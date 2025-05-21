/**
 * ErrorHandlingService.ts
 * 
 * A service for handling errors in a consistent way across the application.
 * Provides detailed error messages and recovery suggestions.
 */

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  API = 'api',
  COMMAND = 'command',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  recoverable: boolean;
  recovery?: string;
}

class ErrorHandlingService {
  private errors: AppError[] = [];
  private readonly MAX_ERRORS = 100;
  
  /**
   * Create a new error
   * @param type Error type
   * @param message Error message
   * @param options Additional error options
   * @returns The created error
   */
  createError(
    type: ErrorType,
    message: string,
    options: {
      severity?: ErrorSeverity;
      details?: string;
      code?: string;
      recoverable?: boolean;
      recovery?: string;
    } = {}
  ): AppError {
    const error: AppError = {
      type,
      severity: options.severity || ErrorSeverity.ERROR,
      message,
      details: options.details,
      code: options.code,
      timestamp: new Date(),
      recoverable: options.recoverable !== undefined ? options.recoverable : true,
      recovery: options.recovery
    };
    
    // Add to error log
    this.logError(error);
    
    return error;
  }
  
  /**
   * Log an error
   * @param error The error to log
   */
  logError(error: AppError): void {
    this.errors.unshift(error);
    
    // Trim error log if it gets too large
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${error.type.toUpperCase()}] ${error.message}`, error);
    }
  }
  
  /**
   * Get all logged errors
   * @returns Array of errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }
  
  /**
   * Clear all logged errors
   */
  clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Get a detailed error message for a command error
   * @param command The command that failed
   * @param error The error that occurred
   * @returns A detailed error message with recovery suggestions
   */
  getCommandErrorMessage(command: string, error: any): string {
    // Extract command name
    const commandName = command.split(' ')[0];
    
    // Check for specific command errors
    switch (commandName) {
      case '!internet':
        return this.getInternetCommandError(command, error);
      case '!recon':
        return this.getReconCommandError(command, error);
      case '!r3b3l':
        return this.getBrightDataCommandError(command, error);
      case '!net-scan':
        return this.getNetScanCommandError(command, error);
      case '!git-harvest':
        return this.getGitHarvestCommandError(command, error);
      default:
        // Generic command error
        return `Error executing command: ${error.message || 'Unknown error'}\n\nTry checking your syntax or run !help for command reference.`;
    }
  }
  
  /**
   * Get error message for internet command
   */
  private getInternetCommandError(command: string, error: any): string {
    if (command.includes('on')) {
      return `Failed to enable internet access: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check your network connection\n- Try !airlock off first\n- Restart the terminal`;
    } else {
      return `Failed to disable internet access: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Force disable with !airlock on\n- Restart the terminal`;
    }
  }
  
  /**
   * Get error message for recon command
   */
  private getReconCommandError(command: string, error: any): string {
    const url = command.split(' ')[1];
    
    if (error.message?.includes('network')) {
      return `Network error while accessing ${url}: ${error.message}\n\nRecovery options:\n- Check your internet connection\n- Verify the URL is correct\n- Try !internet on to ensure internet access is enabled`;
    } else if (error.message?.includes('permission')) {
      return `Permission denied while accessing ${url}: ${error.message}\n\nRecovery options:\n- The site may be blocking automated access\n- Try using !r3b3l access instead for advanced access capabilities`;
    } else {
      return `Error during reconnaissance of ${url}: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check URL format\n- Ensure internet access is enabled (!internet on)\n- Try a different URL`;
    }
  }
  
  /**
   * Get error message for Bright Data commands
   */
  private getBrightDataCommandError(command: string, error: any): string {
    const parts = command.split(' ');
    const operation = parts[1];
    
    switch (operation) {
      case 'discover':
        return `Error during Bright Data discover operation: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check your query syntax\n- Ensure internet access is enabled\n- Try a more specific query`;
      
      case 'access':
        return `Error accessing site with Bright Data: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Verify the URL is correct\n- Try with --render flag for JavaScript-heavy sites\n- Try with --auth flag if authentication is required`;
      
      case 'extract':
        return `Error extracting data with Bright Data: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check your schema format\n- Ensure the site structure matches your schema\n- Try accessing the site first with !r3b3l access`;
      
      case 'interact':
        return `Error during site interaction with Bright Data: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Simplify your interaction steps\n- Check if the site has anti-automation measures\n- Try with a different browser simulation`;
      
      case 'collect':
        return `Error running Bright Data collector: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Verify collector target name\n- Check parameter format\n- Ensure the collector is configured correctly`;
      
      default:
        return `Error with Bright Data operation: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check command syntax with !help\n- Ensure internet access is enabled\n- Try a simpler operation first`;
    }
  }
  
  /**
   * Get error message for net-scan command
   */
  private getNetScanCommandError(command: string, error: any): string {
    const target = command.split(' ')[1];
    
    return `Error scanning ${target}: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check if the domain/IP is valid\n- Ensure internet access is enabled\n- Try with a different target`;
  }
  
  /**
   * Get error message for git-harvest command
   */
  private getGitHarvestCommandError(command: string, error: any): string {
    const target = command.split(' ')[1];
    
    if (error.message?.includes('rate limit')) {
      return `GitHub API rate limit exceeded while harvesting ${target}: ${error.message}\n\nRecovery options:\n- Wait a few minutes before trying again\n- Use a more specific target to reduce API calls\n- Try with authentication if available`;
    } else if (error.message?.includes('not found')) {
      return `GitHub user or organization ${target} not found: ${error.message}\n\nRecovery options:\n- Check the spelling of the user/organization name\n- Verify the user/organization exists on GitHub`;
    } else {
      return `Error harvesting GitHub data for ${target}: ${error.message || 'Unknown error'}\n\nRecovery options:\n- Check your internet connection\n- Verify the user/organization name\n- Try with a different target`;
    }
  }
}

// Export a singleton instance
export const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;
