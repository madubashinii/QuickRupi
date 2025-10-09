import { encryptionService } from './encryptionService';

/**
 * Display utilities for masked sensitive data
 */

// Helper function to safely decrypt and mask
const _safeDecryptAndMask = (encryptedData, visibleChars = 4) => {
  if (!encryptedData) return '';
  try {
    const decrypted = encryptionService.decrypt(encryptedData);
    return encryptionService.mask(decrypted, visibleChars);
  } catch {
    return '****';
  }
};

// Core display functions
export const getMaskedAccountNumber = (encryptedAccountNumber, visibleChars = 4) => 
  _safeDecryptAndMask(encryptedAccountNumber, visibleChars);

export const getMaskedCardNumber = (encryptedCardNumber, visibleChars = 4) => 
  _safeDecryptAndMask(encryptedCardNumber, visibleChars);

export const decryptForProcessing = (encryptedData) => {
  if (!encryptedData) return '';
  return encryptionService.decrypt(encryptedData);
};

// Formatting functions
export const formatAccountDisplay = (encryptedAccountNumber, bankName = '') => {
  const masked = getMaskedAccountNumber(encryptedAccountNumber);
  return bankName ? `${bankName} ••••${masked}` : `••••${masked}`;
};

export const formatCardDisplay = (encryptedCardNumber, brand = '') => {
  const masked = getMaskedCardNumber(encryptedCardNumber);
  return brand ? `${brand} ••••${masked}` : `••••${masked}`;
};

// Validation
export const validateEncryptedData = (encryptedData) => {
  if (!encryptedData) return false;
  try {
    encryptionService.decrypt(encryptedData);
    return true;
  } catch {
    return false;
  }
};
