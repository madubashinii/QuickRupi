import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { encryptionService, getMaskedAccountNumber, decryptForProcessing } from '../encryption';

// Configuration
const COLLECTION = 'paymentMethods';

// Constants
export const TYPES = { CARD: 'card', BANK: 'bank' };
export const CARD_BRANDS = { VISA: 'visa', MASTERCARD: 'mastercard', AMEX: 'amex', DISCOVER: 'discover' };
export const ACCOUNT_TYPES = { SAVINGS: 'savings', CHECKING: 'checking', CURRENT: 'current' };

/**
 * Data validation 
 */
export const validatePaymentMethod = (data) => {
  const errors = [];
  
  if (!data.userId) errors.push('userId required');
  if (!data.type || !Object.values(TYPES).includes(data.type)) errors.push('valid type required');
  
  if (data.type === TYPES.CARD) {
    if (!data.brand || !Object.values(CARD_BRANDS).includes(data.brand)) errors.push('valid brand required');
    if (!data.last4) errors.push('last4 required');
    if (!data.cardholder) errors.push('cardholder required');
    if (!data.expiry) errors.push('expiry required');
  }
  
  if (data.type === TYPES.BANK) {
    if (!data.bankName) errors.push('bankName required');
    if (!data.accountNumber) errors.push('accountNumber required');
    if (!data.accountHolder) errors.push('accountHolder required');
    if (!data.accountType || !Object.values(ACCOUNT_TYPES).includes(data.accountType)) errors.push('valid accountType required');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Error handling utility 
 */
const handleError = (operation, error) => {
  console.error(`Payment method ${operation} error:`, error);
  throw new Error(`Failed to ${operation} payment method`);
};

/**
 * Helper to unset other defaults
 */
const unsetOtherDefaults = async (userId, type, excludeId = null) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('type', '==', type),
    where('isDefault', '==', true),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.forEach((doc) => {
    if (doc.id !== excludeId) {
      batch.update(doc.ref, { isDefault: false });
    }
  });

  if (!snapshot.empty) await batch.commit();
};

/**
 * Core CRUD Operations
 */

// CREATE
export const createPaymentMethod = async (paymentData) => {
  try {
    const validation = validatePaymentMethod(paymentData);
    if (!validation.isValid) throw new Error(`Validation failed: ${validation.errors.join(', ')}`);

    const docData = {
      ...paymentData,
      isDefault: paymentData.isDefault || false,
      isActive: paymentData.isActive !== undefined ? paymentData.isActive : true,
      createdAt: serverTimestamp(),
      lastUsed: null
    };

    // Encrypt sensitive data
    if (docData.type === TYPES.BANK && docData.accountNumber) {
      const { encrypted, masked } = encryptionService.encryptAndMask(docData.accountNumber);
      docData.accountNumber = encrypted;
      docData.accountNumberMasked = masked;
    }

    // Handle default setting
    if (docData.isDefault) {
      await unsetOtherDefaults(docData.userId, docData.type);
    }

    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    handleError('create', error);
    throw error; // Re-throw to ensure the calling code gets the error
  }
};

// READ
export const getUserPaymentMethods = async (userId, type = null, activeOnly = true) => {
  try {
    // Simple query - just get all payment methods for user (no complex indexes needed)
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let methods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter in JavaScript (no index required)
    if (type) methods = methods.filter(method => method.type === type);
    if (activeOnly) methods = methods.filter(method => method.isActive === true);
    
    // Sort by createdAt in JavaScript (no index required)
    return methods.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime; // Descending order (newest first)
    });
  } catch (error) {
    handleError('get user payment methods', error);
  }
};

export const getPaymentMethod = async (paymentMethodId) => {
  try {
    const docRef = doc(db, COLLECTION, paymentMethodId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    handleError('get payment method', error);
  }
};

export const getDefaultPaymentMethod = async (userId, type) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('type', '==', type),
      where('isDefault', '==', true),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    handleError('get default payment method', error);
  }
};

// UPDATE
export const updatePaymentMethod = async (paymentMethodId, updates) => {
  try {
    // Validate if updating core fields
    if (updates.type || updates.brand || updates.last4 || updates.cardholder || 
        updates.expiry || updates.bankName || updates.accountNumber || 
        updates.accountHolder || updates.accountType) {
      
      const current = await getPaymentMethod(paymentMethodId);
      if (!current) throw new Error('Payment method not found');
      
      const validation = validatePaymentMethod({ ...current, ...updates });
      if (!validation.isValid) throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Handle default setting changes
    if (updates.isDefault !== undefined) {
      const current = await getPaymentMethod(paymentMethodId);
      if (!current) throw new Error('Payment method not found');
      
      if (updates.isDefault === true) {
        // Setting this as default, unset all others
        await unsetOtherDefaults(current.userId, current.type, paymentMethodId);
      } else if (updates.isDefault === false && current.isDefault) {
        // Unsetting default - ensure at least one remains default
        console.warn('Removing default status from payment method');
      }
    }

    // Add server timestamp for update
    const updatePayload = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    const docRef = doc(db, COLLECTION, paymentMethodId);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleError('update', error);
    throw error;
  }
};

// DELETE
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const docRef = doc(db, COLLECTION, paymentMethodId);
    await updateDoc(docRef, { 
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    handleError('delete', error);
    throw error;
  }
};

// SET DEFAULT
export const setDefaultPaymentMethod = async (paymentMethodId, userId) => {
  try {
    const paymentMethod = await getPaymentMethod(paymentMethodId);
    if (!paymentMethod) throw new Error('Payment method not found');
    if (paymentMethod.userId !== userId) throw new Error('Unauthorized');

    await unsetOtherDefaults(paymentMethod.userId, paymentMethod.type, paymentMethodId);
    await updatePaymentMethod(paymentMethodId, { isDefault: true });
  } catch (error) {
    handleError('set default', error);
  }
};

/**
 * Utility functions for display and processing
 */
export const getPaymentMethodForDisplay = async (paymentMethodId) => {
  const method = await getPaymentMethod(paymentMethodId);
  if (!method) return null;

  if (method.type === TYPES.BANK && method.accountNumber) {
    method.accountNumber = getMaskedAccountNumber(method.accountNumber);
  }
  return method;
};

export const getPaymentMethodForProcessing = async (paymentMethodId) => {
  const method = await getPaymentMethod(paymentMethodId);
  if (!method) return null;

  if (method.type === TYPES.BANK && method.accountNumber) {
    method.accountNumber = decryptForProcessing(method.accountNumber);
  }
  return method;
};

// Re-export utility functions
export {
  detectCardBrand,
  extractLast4,
  sanitizeText,
  formatExpiry,
  maskCardNumber,
  validateCardFormData,
  validateBankFormData,
  checkForDuplicates,
  prepareCardDataForFirestore,
  prepareBankDataForFirestore
} from './paymentMethodsUtils';
