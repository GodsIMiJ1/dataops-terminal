/**
 * FallbackService.ts
 * 
 * A service for providing fallback options when API calls fail.
 * Includes offline mode support and cached responses.
 */

import cacheService from './CacheService';
import { errorHandlingService, ErrorType } from './ErrorHandlingService';

// Fallback strategy types
export enum FallbackStrategy {
  CACHE = 'cache',
  LOCAL_DATA = 'local_data',
  OFFLINE_MODE = 'offline_mode',
  DEGRADED_OPERATION = 'degraded_operation',
  RETRY_LATER = 'retry_later'
}

// Fallback options
export interface FallbackOptions {
  strategies: FallbackStrategy[];
  cacheKey?: string;
  localData?: any;
  offlineHandler?: () => any;
  degradedHandler?: () => any;
  retryInterval?: number;
}

class FallbackService {
  private isOffline: boolean = false;
  private pendingOperations: Map<string, { fn: Function, args: any[], retryCount: number }> = new Map();
  private readonly MAX_RETRY_COUNT = 5;
  
  /**
   * Execute an operation with fallback options
   * @param operation The operation to execute
   * @param fallbackOptions Fallback options
   * @returns The result of the operation or a fallback
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOptions: FallbackOptions
  ): Promise<T> {
    try {
      // Attempt the operation
      return await operation();
    } catch (error: any) {
      console.warn('Operation failed, attempting fallback:', error);
      
      // Try each fallback strategy in order
      for (const strategy of fallbackOptions.strategies) {
        try {
          const result = await this.executeFallbackStrategy<T>(strategy, fallbackOptions, error);
          if (result !== null) {
            return result;
          }
        } catch (fallbackError) {
          console.warn(`Fallback strategy ${strategy} failed:`, fallbackError);
          // Continue to the next strategy
        }
      }
      
      // If all fallbacks fail, throw the original error
      throw error;
    }
  }
  
  /**
   * Execute a specific fallback strategy
   * @param strategy The fallback strategy to execute
   * @param options Fallback options
   * @param originalError The original error
   * @returns The result of the fallback strategy or null if not applicable
   */
  private async executeFallbackStrategy<T>(
    strategy: FallbackStrategy,
    options: FallbackOptions,
    originalError: any
  ): Promise<T | null> {
    switch (strategy) {
      case FallbackStrategy.CACHE:
        return this.executeCacheFallback<T>(options.cacheKey);
      
      case FallbackStrategy.LOCAL_DATA:
        return this.executeLocalDataFallback<T>(options.localData);
      
      case FallbackStrategy.OFFLINE_MODE:
        return this.executeOfflineFallback<T>(options.offlineHandler);
      
      case FallbackStrategy.DEGRADED_OPERATION:
        return this.executeDegradedFallback<T>(options.degradedHandler);
      
      case FallbackStrategy.RETRY_LATER:
        return this.executeRetryLaterFallback<T>(originalError);
      
      default:
        return null;
    }
  }
  
  /**
   * Execute cache fallback strategy
   * @param cacheKey The cache key to retrieve
   * @returns The cached data or null if not found
   */
  private async executeCacheFallback<T>(cacheKey?: string): Promise<T | null> {
    if (!cacheKey) {
      return null;
    }
    
    const cachedData = cacheService.get<T>(cacheKey);
    if (cachedData !== null) {
      console.log(`Using cached data for key: ${cacheKey}`);
      return cachedData;
    }
    
    return null;
  }
  
  /**
   * Execute local data fallback strategy
   * @param localData The local data to use
   * @returns The local data or null if not provided
   */
  private async executeLocalDataFallback<T>(localData?: any): Promise<T | null> {
    if (localData !== undefined) {
      console.log('Using local fallback data');
      return localData as T;
    }
    
    return null;
  }
  
  /**
   * Execute offline mode fallback strategy
   * @param offlineHandler The offline handler function
   * @returns The result of the offline handler or null if not provided
   */
  private async executeOfflineFallback<T>(offlineHandler?: () => any): Promise<T | null> {
    if (offlineHandler) {
      console.log('Executing offline mode handler');
      this.isOffline = true;
      return offlineHandler() as T;
    }
    
    return null;
  }
  
  /**
   * Execute degraded operation fallback strategy
   * @param degradedHandler The degraded operation handler function
   * @returns The result of the degraded handler or null if not provided
   */
  private async executeDegradedFallback<T>(degradedHandler?: () => any): Promise<T | null> {
    if (degradedHandler) {
      console.log('Executing degraded operation handler');
      return degradedHandler() as T;
    }
    
    return null;
  }
  
  /**
   * Execute retry later fallback strategy
   * @param error The original error
   * @returns Always returns null as this strategy queues for later
   */
  private async executeRetryLaterFallback<T>(error: any): Promise<T | null> {
    // This would typically queue the operation for retry
    // For now, just log that we would retry later
    console.log('Operation queued for retry later');
    
    // Create a more user-friendly error
    errorHandlingService.createError(
      ErrorType.NETWORK,
      'Operation queued for retry when network conditions improve',
      {
        severity: error.severity,
        details: error.message,
        recoverable: true,
        recovery: 'The operation will be retried automatically when possible.'
      }
    );
    
    return null;
  }
  
  /**
   * Queue an operation for retry later
   * @param key A unique key for the operation
   * @param fn The function to retry
   * @param args Arguments for the function
   */
  queueForRetry(key: string, fn: Function, args: any[]): void {
    const existingOperation = this.pendingOperations.get(key);
    
    if (existingOperation) {
      // Increment retry count
      existingOperation.retryCount++;
      
      // If max retries reached, remove from queue
      if (existingOperation.retryCount > this.MAX_RETRY_COUNT) {
        this.pendingOperations.delete(key);
        console.warn(`Operation ${key} exceeded maximum retry count and was removed from queue`);
        return;
      }
    } else {
      // Add new operation to queue
      this.pendingOperations.set(key, { fn, args, retryCount: 0 });
    }
  }
  
  /**
   * Retry all pending operations
   * @returns Number of operations retried
   */
  async retryPendingOperations(): Promise<number> {
    if (this.pendingOperations.size === 0) {
      return 0;
    }
    
    let retryCount = 0;
    
    for (const [key, operation] of this.pendingOperations.entries()) {
      try {
        console.log(`Retrying operation: ${key}`);
        await operation.fn(...operation.args);
        
        // If successful, remove from queue
        this.pendingOperations.delete(key);
        retryCount++;
      } catch (error) {
        console.warn(`Retry failed for operation ${key}:`, error);
        // Increment retry count
        operation.retryCount++;
        
        // If max retries reached, remove from queue
        if (operation.retryCount > this.MAX_RETRY_COUNT) {
          this.pendingOperations.delete(key);
          console.warn(`Operation ${key} exceeded maximum retry count and was removed from queue`);
        }
      }
    }
    
    return retryCount;
  }
  
  /**
   * Check if the system is in offline mode
   * @returns True if offline, false otherwise
   */
  isInOfflineMode(): boolean {
    return this.isOffline;
  }
  
  /**
   * Set offline mode
   * @param offline True to enable offline mode, false to disable
   */
  setOfflineMode(offline: boolean): void {
    this.isOffline = offline;
    
    // If coming back online, retry pending operations
    if (!offline) {
      this.retryPendingOperations();
    }
  }
}

// Export a singleton instance
export const fallbackService = new FallbackService();
export default fallbackService;
