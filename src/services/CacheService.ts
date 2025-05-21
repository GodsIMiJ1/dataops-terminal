/**
 * CacheService.ts
 * 
 * A service for caching API responses and other data to improve performance.
 * Particularly useful for Bright Data operations which may be expensive or rate-limited.
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // Time in milliseconds until the cache item expires
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param expiry Optional expiry time in milliseconds
   */
  set<T>(key: string, data: T, expiry: number = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }
  
  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get or fetch data
   * @param key The cache key
   * @param fetchFn The function to fetch data if not in cache
   * @param expiry Optional expiry time in milliseconds
   * @returns The cached or fetched data
   */
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    expiry: number = this.DEFAULT_EXPIRY
  ): Promise<T> {
    const cachedData = this.get<T>(key);
    
    if (cachedData !== null) {
      console.log(`Cache hit for key: ${key}`);
      return cachedData;
    }
    
    console.log(`Cache miss for key: ${key}, fetching data...`);
    const data = await fetchFn();
    this.set(key, data, expiry);
    return data;
  }
  
  /**
   * Get the number of items in the cache
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Clean expired items from the cache
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
export default cacheService;
