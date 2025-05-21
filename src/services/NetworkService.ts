/**
 * NetworkService.ts
 * 
 * A service for handling network requests with automatic retry functionality.
 */

import { errorHandlingService, ErrorType, ErrorSeverity } from './ErrorHandlingService';

// Network request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
  cache?: RequestCache;
}

// Default request options
const DEFAULT_OPTIONS: RequestOptions = {
  method: 'GET',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  cache: 'default'
};

class NetworkService {
  /**
   * Make a network request with automatic retry
   * @param url The URL to request
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    // Merge with default options
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
    
    // Track retry attempts
    let attempts = 0;
    
    while (true) {
      try {
        attempts++;
        
        // Prepare fetch options
        const fetchOptions: RequestInit = {
          method: opts.method,
          headers: opts.headers,
          signal: controller.signal,
          cache: opts.cache
        };
        
        // Add body for non-GET requests
        if (opts.method !== 'GET' && opts.body) {
          fetchOptions.body = typeof opts.body === 'string' 
            ? opts.body 
            : JSON.stringify(opts.body);
        }
        
        // Make the request
        const response = await fetch(url, fetchOptions);
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Check if response needs to be retried
        if (!response.ok && opts.retryStatusCodes?.includes(response.status) && attempts <= opts.retries!) {
          console.warn(`Request to ${url} failed with status ${response.status}. Retrying (${attempts}/${opts.retries})...`);
          await this.delay(opts.retryDelay! * attempts); // Exponential backoff
          continue;
        }
        
        // Handle non-OK responses that shouldn't be retried
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }
        
        // Parse response
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/')) {
          data = await response.text();
        } else {
          data = await response.blob();
        }
        
        return data as T;
      } catch (error: any) {
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Handle abort (timeout)
        if (error.name === 'AbortError') {
          const timeoutError = errorHandlingService.createError(
            ErrorType.TIMEOUT,
            `Request to ${url} timed out after ${opts.timeout}ms`,
            {
              severity: ErrorSeverity.WARNING,
              details: `The server took too long to respond.`,
              recoverable: true,
              recovery: `Try again with a longer timeout or when network conditions improve.`
            }
          );
          throw timeoutError;
        }
        
        // Check if we should retry
        if (attempts <= opts.retries!) {
          console.warn(`Request to ${url} failed: ${error.message}. Retrying (${attempts}/${opts.retries})...`);
          await this.delay(opts.retryDelay! * attempts); // Exponential backoff
          continue;
        }
        
        // Max retries reached, throw error
        const networkError = errorHandlingService.createError(
          ErrorType.NETWORK,
          `Request to ${url} failed after ${attempts} attempts: ${error.message}`,
          {
            severity: ErrorSeverity.ERROR,
            details: `The request could not be completed after multiple attempts.`,
            recoverable: true,
            recovery: `Check your network connection and try again later.`
          }
        );
        throw networkError;
      }
    }
  }
  
  /**
   * Make a GET request
   * @param url The URL to request
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async get<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  /**
   * Make a POST request
   * @param url The URL to request
   * @param body The request body
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async post<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }
  
  /**
   * Make a PUT request
   * @param url The URL to request
   * @param body The request body
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async put<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }
  
  /**
   * Make a DELETE request
   * @param url The URL to request
   * @param options Request options
   * @returns Promise resolving to the response data
   */
  async delete<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
  
  /**
   * Delay execution
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance
export const networkService = new NetworkService();
export default networkService;
