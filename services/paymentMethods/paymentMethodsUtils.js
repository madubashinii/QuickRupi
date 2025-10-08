/**
 * Payment Methods Utility Functions
 * Centralized utilities to avoid code duplication
 */

import { CARD_BRANDS } from './paymentMethodsService';
import { encryptionService } from '../encryption';

/**
 * Card brand detection
 */
export const detectCardBrand = (cardNumber) => {
  if (!cardNumber) return null;
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.startsWith('4')) return CARD_BRANDS.VISA;
  if (clean.startsWith('5')) return CARD_BRANDS.MASTERCARD;
  if (clean.startsWith('3')) return CARD_BRANDS.AMEX;
  if (clean.startsWith('6')) return CARD_BRANDS.DISCOVER;
  return null;
};

/**
 * Extract last 4 digits from card number
 */
export const extractLast4 = (cardNumber) => {
  if (!cardNumber) return '';
  return cardNumber.replace(/\D/g, '').slice(-4);
};

/**
 * Sanitize text input
 */
export const sanitizeText = (text) => text?.trim() || '';

/**
 * Format expiry date to MM/YY
 */
export const formatExpiry = (expiry) => {
  if (!expiry) return '';
  const clean = expiry.replace(/\D/g, '');
  if (clean.length === 4) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
};

/**
 * Mask card number for display (uses encryption service)
 */
export const maskCardNumber = (cardNumber, visibleChars = 4) => {
  if (!cardNumber) return '';
  return encryptionService.mask(cardNumber, visibleChars);
};


/**
 * Validate card data for form input
 */
export const validateCardFormData = (data) => {
  const errors = [];
  
  if (!data.cardholderName?.trim()) errors.push('Cardholder name is required');
  if (!data.cardNumber?.trim()) errors.push('Card number is required');
  if (!data.expiry?.trim()) errors.push('Expiry date is required');
  if (!data.cvv?.trim()) errors.push('CVV is required');
  
  // Card number validation
  const cleanCardNumber = data.cardNumber?.replace(/\D/g, '');
  if (cleanCardNumber && (cleanCardNumber.length < 13 || cleanCardNumber.length > 19)) {
    errors.push('Invalid card number length');
  }
  
  // Expiry validation (MM/YY format)
  if (data.expiry && !/^\d{2}\/\d{2}$/.test(data.expiry)) {
    errors.push('Invalid expiry format (MM/YY)');
  }
  
  // CVV validation
  if (data.cvv && (!/^\d{3,4}$/.test(data.cvv))) {
    errors.push('Invalid CVV (3-4 digits)');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Validate bank data for form input
 */
export const validateBankFormData = (data) => {
  const errors = [];
  
  if (!data.accountHolderName?.trim()) errors.push('Account holder name is required');
  if (!data.bankName?.trim()) errors.push('Bank name is required');
  if (!data.branch?.trim()) errors.push('Branch is required');
  if (!data.accountNumber?.trim()) errors.push('Account number is required');
  
  // Account number validation
  if (data.accountNumber && !/^\d{8,20}$/.test(data.accountNumber.replace(/\D/g, ''))) {
    errors.push('Invalid account number format');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Check for duplicate payment methods
 */
export const checkForDuplicates = async (getUserPaymentMethods, userId, type, data) => {
  try {
    const existingMethods = await getUserPaymentMethods(userId, type);
    
    if (type === 'card') {
      const last4 = data.cardNumber?.replace(/\D/g, '').slice(-4);
      const existingCard = existingMethods.find(method => 
        method.last4 === last4 && 
        method.cardholder?.toLowerCase() === data.cardholderName?.toLowerCase()
      );
      return existingCard;
    }
    
    if (type === 'bank') {
      // For bank accounts, we need to decrypt stored account numbers to compare with plain text input
      const existingBank = existingMethods.find(method => {
        if (method.bankName !== data.bankName) return false;
        
        // If accountNumber is encrypted, decrypt it for comparison
        if (method.accountNumber && method.accountNumber.length > 20) {
          // Likely encrypted - decrypt and compare
          try {
            const decryptedAccountNumber = encryptionService.decrypt(method.accountNumber);
            return decryptedAccountNumber === data.accountNumber;
          } catch {
            // If decryption fails, fall back to masked comparison
            return method.accountNumberMasked === encryptionService.mask(data.accountNumber, 4);
          }
        } else {
          // Plain text comparison (for backward compatibility)
          return method.accountNumber === data.accountNumber;
        }
      });
      return existingBank;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return null;
  }
};

/**
 * Prepare card data for Firestore
 */
export const prepareCardDataForFirestore = (formData, userId) => {
  // Validate required fields
  if (!formData.cardNumber?.trim()) {
    throw new Error('Card number is required');
  }
  if (!formData.cardholderName?.trim()) {
    throw new Error('Cardholder name is required');
  }
  if (!formData.expiry?.trim()) {
    throw new Error('Expiry date is required');
  }

  const cleanCardNumber = formData.cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(formData.cardNumber);
  
  if (!brand) {
    throw new Error('Invalid card number - unsupported card type');
  }
  
  return {
    userId,
    type: 'card',
    brand,
    last4: cleanCardNumber.slice(-4),
    cardholder: formData.cardholderName.trim(),
    expiry: formData.expiry.trim(),
    nickname: formData.cardNickname?.trim() || null,
    isDefault: formData.isDefault || false,
    isActive: true
  };
};

/**
 * Prepare bank data for Firestore
 */
export const prepareBankDataForFirestore = (formData, userId) => {
  console.log('Preparing bank data:', formData, 'userId:', userId);
  
  // Validate required fields
  if (!formData.bankName?.trim()) {
    console.log('Bank name validation failed:', formData.bankName);
    throw new Error('Bank name is required');
  }
  if (!formData.accountNumber?.trim()) {
    console.log('Account number validation failed:', formData.accountNumber);
    throw new Error('Account number is required');
  }
  if (!formData.accountHolderName?.trim()) {
    console.log('Account holder name validation failed:', formData.accountHolderName);
    throw new Error('Account holder name is required');
  }
  if (!formData.branch?.trim()) {
    console.log('Branch validation failed:', formData.branch);
    throw new Error('Branch is required');
  }

  const preparedData = {
    userId,
    type: 'bank',
    bankName: formData.bankName.trim(),
    accountHolder: formData.accountHolderName.trim(),
    branch: formData.branch.trim(),
    accountNumber: formData.accountNumber.trim(),
    accountType: formData.accountType || 'savings',
    isDefault: formData.isDefault || false,
    isActive: true
  };
  
  console.log('Prepared bank data:', preparedData);
  return preparedData;
};
