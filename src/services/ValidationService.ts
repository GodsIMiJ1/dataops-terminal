/**
 * ValidationService.ts
 * 
 * A service for validating user inputs to prevent security issues.
 */

// Validation rules
export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  custom?: (value: string) => boolean;
  message: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

class ValidationService {
  // Common validation patterns
  private patterns = {
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^[0-9]+$/,
    doi: /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    domain: /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    safeString: /^[a-zA-Z0-9\s.,!?()-_]+$/,
    commandName: /^![a-zA-Z0-9-_]+$/,
    filepath: /^[a-zA-Z0-9\s.,_\-/\\]+\.[a-zA-Z0-9]+$/
  };
  
  // Predefined validation rules
  private rules: Record<string, ValidationRule[]> = {
    url: [
      {
        pattern: this.patterns.url,
        message: 'Invalid URL format. URLs should start with http:// or https:// and contain a valid domain.'
      },
      {
        maxLength: 2048,
        message: 'URL is too long. Maximum length is 2048 characters.'
      }
    ],
    email: [
      {
        pattern: this.patterns.email,
        message: 'Invalid email format. Please enter a valid email address.'
      }
    ],
    doi: [
      {
        pattern: this.patterns.doi,
        message: 'Invalid DOI format. DOIs should start with "10." followed by a numeric prefix and suffix.'
      }
    ],
    command: [
      {
        pattern: this.patterns.commandName,
        message: 'Invalid command format. Commands should start with "!" followed by alphanumeric characters.'
      },
      {
        maxLength: 1000,
        message: 'Command is too long. Maximum length is 1000 characters.'
      }
    ],
    domain: [
      {
        pattern: this.patterns.domain,
        message: 'Invalid domain format. Please enter a valid domain name.'
      }
    ],
    ipAddress: [
      {
        pattern: this.patterns.ipv4,
        message: 'Invalid IP address format. Please enter a valid IPv4 address.'
      }
    ],
    filepath: [
      {
        pattern: this.patterns.filepath,
        message: 'Invalid file path format. File paths should contain a file name with extension.'
      }
    ],
    safeString: [
      {
        pattern: this.patterns.safeString,
        message: 'Input contains invalid characters. Please use only alphanumeric characters and basic punctuation.'
      }
    ]
  };
  
  /**
   * Validate a value against a set of rules
   * @param value The value to validate
   * @param rules The validation rules to apply
   * @returns Validation result
   */
  validate(value: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      // Check if required
      if (rule.required && (!value || value.trim() === '')) {
        errors.push(rule.message);
        continue;
      }
      
      // Skip other validations if value is empty and not required
      if (!value || value.trim() === '') {
        continue;
      }
      
      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message);
        continue;
      }
      
      // Check min length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(rule.message);
        continue;
      }
      
      // Check max length
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(rule.message);
        continue;
      }
      
      // Check custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message);
        continue;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a value against a predefined rule set
   * @param value The value to validate
   * @param ruleSet The name of the predefined rule set
   * @returns Validation result
   */
  validateWithRuleSet(value: string, ruleSet: string): ValidationResult {
    const rules = this.rules[ruleSet];
    
    if (!rules) {
      throw new Error(`Rule set "${ruleSet}" not found`);
    }
    
    return this.validate(value, rules);
  }
  
  /**
   * Add a new validation rule set
   * @param name The name of the rule set
   * @param rules The validation rules
   */
  addRuleSet(name: string, rules: ValidationRule[]): void {
    this.rules[name] = rules;
  }
  
  /**
   * Get a predefined pattern
   * @param name The name of the pattern
   * @returns The pattern or undefined if not found
   */
  getPattern(name: string): RegExp | undefined {
    return this.patterns[name as keyof typeof this.patterns];
  }
  
  /**
   * Sanitize a string for safe display
   * @param value The string to sanitize
   * @returns The sanitized string
   */
  sanitize(value: string): string {
    // Replace HTML special characters
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Sanitize a command for safe execution
   * @param command The command to sanitize
   * @returns The sanitized command
   */
  sanitizeCommand(command: string): string {
    // Remove any potentially dangerous characters
    return command
      .replace(/[;&|`$]/g, '') // Remove shell command operators
      .trim();
  }
  
  /**
   * Validate a URL for safety
   * @param url The URL to validate
   * @returns Validation result
   */
  validateUrl(url: string): ValidationResult {
    // Basic URL validation
    const basicValidation = this.validateWithRuleSet(url, 'url');
    if (!basicValidation.valid) {
      return basicValidation;
    }
    
    // Additional safety checks
    const errors: string[] = [];
    
    // Check for javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      errors.push('URLs with javascript: protocol are not allowed for security reasons.');
    }
    
    // Check for data: protocol
    if (url.toLowerCase().startsWith('data:')) {
      errors.push('URLs with data: protocol are not allowed for security reasons.');
    }
    
    // Check for file: protocol
    if (url.toLowerCase().startsWith('file:')) {
      errors.push('URLs with file: protocol are not allowed for security reasons.');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a command for safety
   * @param command The command to validate
   * @returns Validation result
   */
  validateCommand(command: string): ValidationResult {
    const errors: string[] = [];
    
    // Check for shell injection attempts
    if (/[;&|`$]/.test(command)) {
      errors.push('Command contains invalid characters that could be used for shell injection.');
    }
    
    // Check for valid command format
    if (!command.startsWith('!')) {
      errors.push('Commands must start with "!" character.');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export const validationService = new ValidationService();
export default validationService;
