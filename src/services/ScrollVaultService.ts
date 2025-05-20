/**
 * ScrollVaultService.ts
 * 
 * This service provides encryption and decryption for R3B3L 4F scroll logs.
 * It allows for secure storage of sensitive mission data.
 */

// Configuration for the scroll vault
export interface ScrollVaultConfig {
  encryptedLogs: boolean;
  passphrase: string;
  encryptionAlgorithm: 'AES-GCM' | 'AES-CBC';
  saltLength: number;
  ivLength: number;
}

// Default configuration
const DEFAULT_CONFIG: ScrollVaultConfig = {
  encryptedLogs: false,
  passphrase: 'ghostkey',
  encryptionAlgorithm: 'AES-GCM',
  saltLength: 16,
  ivLength: 12
};

// Current configuration
let config: ScrollVaultConfig = { ...DEFAULT_CONFIG };

/**
 * Initialize the scroll vault service
 * @param initialConfig - Initial configuration
 */
export const initScrollVault = (initialConfig: Partial<ScrollVaultConfig> = {}): void => {
  config = { ...DEFAULT_CONFIG, ...initialConfig };
  console.log('Scroll Vault initialized with encryption:', config.encryptedLogs ? 'enabled' : 'disabled');
};

/**
 * Update the scroll vault configuration
 * @param newConfig - New configuration
 */
export const updateScrollVaultConfig = (newConfig: Partial<ScrollVaultConfig>): void => {
  config = { ...config, ...newConfig };
  console.log('Scroll Vault configuration updated:', config.encryptedLogs ? 'enabled' : 'disabled');
};

/**
 * Check if encryption is enabled
 * @returns True if encryption is enabled, false otherwise
 */
export const isEncryptionEnabled = (): boolean => {
  return config.encryptedLogs;
};

/**
 * Toggle encryption status
 * @returns The new encryption status
 */
export const toggleEncryption = (): boolean => {
  config.encryptedLogs = !config.encryptedLogs;
  console.log('Scroll Vault encryption:', config.encryptedLogs ? 'enabled' : 'disabled');
  return config.encryptedLogs;
};

/**
 * Set the passphrase for encryption/decryption
 * @param passphrase - The passphrase to use
 */
export const setPassphrase = (passphrase: string): void => {
  config.passphrase = passphrase;
  console.log('Scroll Vault passphrase updated');
};

/**
 * Generate a key from the passphrase
 * @param salt - The salt to use
 * @returns The generated key
 */
const generateKey = async (salt: Uint8Array): Promise<CryptoKey> => {
  // Convert passphrase to buffer
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(config.passphrase);
  
  // Import the passphrase as a key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive the actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: config.encryptionAlgorithm,
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt a scroll
 * @param content - The content to encrypt
 * @returns The encrypted content as a base64 string
 */
export const encryptScroll = async (content: string): Promise<string> => {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(config.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(config.ivLength));
    
    // Generate key
    const key = await generateKey(salt);
    
    // Encode content
    const encoder = new TextEncoder();
    const contentBuffer = encoder.encode(content);
    
    // Encrypt content
    let encryptedContent: ArrayBuffer;
    
    if (config.encryptionAlgorithm === 'AES-GCM') {
      encryptedContent = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        contentBuffer
      );
    } else {
      encryptedContent = await crypto.subtle.encrypt(
        {
          name: 'AES-CBC',
          iv
        },
        key,
        contentBuffer
      );
    }
    
    // Combine salt, IV, and encrypted content
    const result = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedContent), salt.length + iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Error encrypting scroll:', error);
    throw new Error('Failed to encrypt scroll');
  }
};

/**
 * Decrypt a scroll
 * @param encryptedContent - The encrypted content as a base64 string
 * @returns The decrypted content
 */
export const decryptScroll = async (encryptedContent: string): Promise<string> => {
  try {
    // Convert from base64
    const encryptedBuffer = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted content
    const salt = encryptedBuffer.slice(0, config.saltLength);
    const iv = encryptedBuffer.slice(config.saltLength, config.saltLength + config.ivLength);
    const content = encryptedBuffer.slice(config.saltLength + config.ivLength);
    
    // Generate key
    const key = await generateKey(salt);
    
    // Decrypt content
    let decryptedContent: ArrayBuffer;
    
    if (config.encryptionAlgorithm === 'AES-GCM') {
      decryptedContent = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        content
      );
    } else {
      decryptedContent = await crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv
        },
        key,
        content
      );
    }
    
    // Decode content
    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  } catch (error) {
    console.error('Error decrypting scroll:', error);
    throw new Error('Failed to decrypt scroll. Check your passphrase.');
  }
};

/**
 * Process a scroll for saving
 * @param content - The content to process
 * @returns The processed content
 */
export const processScrollForSaving = async (content: string): Promise<string> => {
  if (config.encryptedLogs) {
    return await encryptScroll(content);
  }
  return content;
};

/**
 * Process a scroll for loading
 * @param content - The content to process
 * @param isEncrypted - Whether the content is encrypted
 * @returns The processed content
 */
export const processScrollForLoading = async (content: string, isEncrypted: boolean = false): Promise<string> => {
  if (isEncrypted || content.startsWith('ey')) {
    try {
      return await decryptScroll(content);
    } catch (error) {
      console.error('Error decrypting scroll:', error);
      return `[ENCRYPTED SCROLL - DECRYPTION FAILED]\n\nUse !decrypt-scroll with the correct passphrase to view this scroll.`;
    }
  }
  return content;
};

// Initialize the scroll vault service when this module is imported
initScrollVault();

export default {
  initScrollVault,
  updateScrollVaultConfig,
  isEncryptionEnabled,
  toggleEncryption,
  setPassphrase,
  encryptScroll,
  decryptScroll,
  processScrollForSaving,
  processScrollForLoading
};
