/**
 * EncryptionService.ts
 * 
 * A service for encrypting and decrypting sensitive data.
 * Uses the Web Crypto API for secure encryption.
 */

// Encryption options
export interface EncryptionOptions {
  algorithm?: 'AES-GCM' | 'AES-CBC';
  keyLength?: 128 | 192 | 256;
  iterations?: number;
  salt?: Uint8Array;
}

// Default encryption options
const DEFAULT_OPTIONS: EncryptionOptions = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000
};

class EncryptionService {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  
  /**
   * Generate a random salt
   * @returns Random salt as Uint8Array
   */
  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }
  
  /**
   * Derive a key from a passphrase
   * @param passphrase The passphrase to derive the key from
   * @param salt The salt to use for key derivation
   * @param options Encryption options
   * @returns The derived key
   */
  async deriveKey(
    passphrase: string,
    salt: Uint8Array,
    options: EncryptionOptions = {}
  ): Promise<CryptoKey> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Convert passphrase to key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive the key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: opts.iterations!,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: opts.algorithm,
        length: opts.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Encrypt data
   * @param data The data to encrypt
   * @param passphrase The passphrase to use for encryption
   * @param options Encryption options
   * @returns The encrypted data as a base64 string
   */
  async encrypt(
    data: string,
    passphrase: string,
    options: EncryptionOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Generate salt and IV
    const salt = opts.salt || this.generateSalt();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key
    const key = await this.deriveKey(passphrase, salt, opts);
    
    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: opts.algorithm,
        iv
      },
      key,
      this.encoder.encode(data)
    );
    
    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...result));
  }
  
  /**
   * Decrypt data
   * @param encryptedData The encrypted data as a base64 string
   * @param passphrase The passphrase to use for decryption
   * @param options Encryption options
   * @returns The decrypted data
   */
  async decrypt(
    encryptedData: string,
    passphrase: string,
    options: EncryptionOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Convert from base64
    const data = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Extract salt, IV, and encrypted data
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 16 + 12);
    const ciphertext = data.slice(16 + 12);
    
    // Derive key
    const key = await this.deriveKey(passphrase, salt, opts);
    
    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: opts.algorithm,
        iv
      },
      key,
      ciphertext
    );
    
    // Convert to string
    return this.decoder.decode(decryptedData);
  }
  
  /**
   * Hash a string
   * @param data The data to hash
   * @returns The hash as a hex string
   */
  async hash(data: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(data)
    );
    
    // Convert to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Generate a random passphrase
   * @param length The length of the passphrase
   * @returns A random passphrase
   */
  generatePassphrase(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    
    return result;
  }
  
  /**
   * Encrypt an object
   * @param obj The object to encrypt
   * @param passphrase The passphrase to use for encryption
   * @param options Encryption options
   * @returns The encrypted object as a base64 string
   */
  async encryptObject<T>(
    obj: T,
    passphrase: string,
    options: EncryptionOptions = {}
  ): Promise<string> {
    return this.encrypt(JSON.stringify(obj), passphrase, options);
  }
  
  /**
   * Decrypt an object
   * @param encryptedData The encrypted data as a base64 string
   * @param passphrase The passphrase to use for decryption
   * @param options Encryption options
   * @returns The decrypted object
   */
  async decryptObject<T>(
    encryptedData: string,
    passphrase: string,
    options: EncryptionOptions = {}
  ): Promise<T> {
    const decrypted = await this.decrypt(encryptedData, passphrase, options);
    return JSON.parse(decrypted) as T;
  }
}

// Export a singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService;
