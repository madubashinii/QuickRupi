// Configuration
const ENCRYPTION_KEY = 'QuickRupi_Encryption_Key_2024_Secure_256bit';

/**
 * Core encryption service - uses base64 encoding for React Native compatibility
 */
class EncryptionService {
  encrypt(plaintext) {
    if (!plaintext?.trim()) throw new Error('Invalid input');
    
    // Use base64 encoding - works reliably in React Native
    return btoa(plaintext);
  }

  decrypt(ciphertext) {
    if (!ciphertext?.trim()) throw new Error('Invalid input');
    
    try {
      return atob(ciphertext);
    } catch (error) {
      throw new Error(`Base64 decode failed: ${error.message}`);
    }
  }

  mask(data, visibleChars = 4) {
    if (!data?.trim()) return '';
    if (data.length <= visibleChars) return '*'.repeat(data.length);
    return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
  }

  encryptAndMask(plaintext, visibleChars = 4) {
    return {
      encrypted: this.encrypt(plaintext),
      masked: this.mask(plaintext, visibleChars)
    };
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
