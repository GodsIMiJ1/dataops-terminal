/**
 * RateLimitService.ts
 * 
 * A service for implementing rate limiting for API calls.
 */

// Rate limit configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  delayAfterLimit?: number;
  keyPrefix?: string;
}

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  
  /**
   * Initialize with default rate limits
   */
  initialize(): void {
    // Default rate limits for different APIs
    this.registerRateLimit('brightdata', {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      delayAfterLimit: 2000 // 2 seconds delay after hitting limit
    });
    
    this.registerRateLimit('openai', {
      maxRequests: 20,
      windowMs: 60 * 1000 // 1 minute
    });
    
    this.registerRateLimit('github', {
      maxRequests: 30,
      windowMs: 60 * 1000 // 1 minute
    });
    
    this.registerRateLimit('crossref', {
      maxRequests: 50,
      windowMs: 60 * 1000 // 1 minute
    });
    
    this.registerRateLimit('science', {
      maxRequests: 20,
      windowMs: 60 * 1000 // 1 minute
    });
    
    // Default rate limit for all other APIs
    this.registerRateLimit('default', {
      maxRequests: 60,
      windowMs: 60 * 1000 // 1 minute
    });
  }
  
  /**
   * Register a rate limit configuration
   * @param key The rate limit key
   * @param config The rate limit configuration
   */
  registerRateLimit(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }
  
  /**
   * Check if a request is allowed
   * @param key The rate limit key
   * @param identifier Optional identifier for the request (e.g., user ID)
   * @returns True if the request is allowed, false otherwise
   */
  isAllowed(key: string, identifier: string = 'default'): boolean {
    const config = this.configs.get(key) || this.configs.get('default')!;
    const limitKey = `${config.keyPrefix || key}:${identifier}`;
    
    // Get or create rate limit entry
    let entry = this.limits.get(limitKey);
    const now = Date.now();
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.limits.set(limitKey, entry);
    }
    
    // Check if blocked
    if (entry.blocked) {
      return false;
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      // If delay is specified, block for that duration
      if (config.delayAfterLimit) {
        entry.blocked = true;
        setTimeout(() => {
          const currentEntry = this.limits.get(limitKey);
          if (currentEntry) {
            currentEntry.blocked = false;
          }
        }, config.delayAfterLimit);
      }
      return false;
    }
    
    // Increment count and allow request
    entry.count++;
    return true;
  }
  
  /**
   * Get the remaining requests for a key
   * @param key The rate limit key
   * @param identifier Optional identifier for the request
   * @returns The number of remaining requests
   */
  getRemainingRequests(key: string, identifier: string = 'default'): number {
    const config = this.configs.get(key) || this.configs.get('default')!;
    const limitKey = `${config.keyPrefix || key}:${identifier}`;
    
    const entry = this.limits.get(limitKey);
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - entry.count);
  }
  
  /**
   * Get the time until reset for a key
   * @param key The rate limit key
   * @param identifier Optional identifier for the request
   * @returns The time in milliseconds until the rate limit resets
   */
  getTimeUntilReset(key: string, identifier: string = 'default'): number {
    const config = this.configs.get(key) || this.configs.get('default')!;
    const limitKey = `${config.keyPrefix || key}:${identifier}`;
    
    const entry = this.limits.get(limitKey);
    if (!entry) {
      return 0;
    }
    
    return Math.max(0, entry.resetTime - Date.now());
  }
  
  /**
   * Reset rate limit for a key
   * @param key The rate limit key
   * @param identifier Optional identifier for the request
   */
  resetLimit(key: string, identifier: string = 'default'): void {
    const config = this.configs.get(key) || this.configs.get('default')!;
    const limitKey = `${config.keyPrefix || key}:${identifier}`;
    
    this.limits.delete(limitKey);
  }
  
  /**
   * Reset all rate limits
   */
  resetAllLimits(): void {
    this.limits.clear();
  }
  
  /**
   * Execute a function with rate limiting
   * @param key The rate limit key
   * @param fn The function to execute
   * @param identifier Optional identifier for the request
   * @returns The result of the function
   * @throws Error if rate limit is exceeded
   */
  async executeWithRateLimit<T>(
    key: string,
    fn: () => Promise<T>,
    identifier: string = 'default'
  ): Promise<T> {
    if (!this.isAllowed(key, identifier)) {
      const timeUntilReset = this.getTimeUntilReset(key, identifier);
      throw new Error(
        `Rate limit exceeded for ${key}. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`
      );
    }
    
    try {
      return await fn();
    } catch (error: any) {
      // Check if error is due to rate limiting from the API
      if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
        // Mark as blocked
        const config = this.configs.get(key) || this.configs.get('default')!;
        const limitKey = `${config.keyPrefix || key}:${identifier}`;
        const entry = this.limits.get(limitKey);
        
        if (entry) {
          entry.count = config.maxRequests;
          entry.blocked = true;
          
          // Unblock after delay
          setTimeout(() => {
            const currentEntry = this.limits.get(limitKey);
            if (currentEntry) {
              currentEntry.blocked = false;
            }
          }, config.delayAfterLimit || 5000);
        }
      }
      
      throw error;
    }
  }
}

// Export a singleton instance
export const rateLimitService = new RateLimitService();
export default rateLimitService;
