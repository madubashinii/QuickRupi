import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// ============ CONSTANTS ============

const TRANSACTIONS_COLLECTION = 'transactions';

export const TRANSACTION_TYPES = {
  TOPUP: 'topup',
  WITHDRAW: 'withdraw',
  INVESTMENT: 'investment',
  REPAYMENT: 'repayment'
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// ============ SCHEMA OVERVIEW ============
/**
 * Transaction Schema:
 * {
 *   transactionId: string (auto-generated),
 *   userId: string (e.g., "L001"),
 *   amount: number,
 *   type: enum ("topup" | "withdraw" | "investment" | "repayment"),
 *   loanId: string | null (optional - only for investment/repayment),
 *   status: enum ("pending" | "completed" | "failed"),
 *   timestamp: Firestore timestamp,
 *   description: string | null (optional),
 *   paymentMethodId: string | null (optional - for topup/withdraw)
 * }
 */

// ============ VALIDATION ============

/**
 * Validate transaction type
 * @param {string} type - Transaction type
 * @returns {boolean} True if valid
 */
export const validateTransactionType = (type) => {
  return Object.values(TRANSACTION_TYPES).includes(type);
};

/**
 * Validate transaction status
 * @param {string} status - Transaction status
 * @returns {boolean} True if valid
 */
export const validateTransactionStatus = (status) => {
  return Object.values(TRANSACTION_STATUS).includes(status);
};

/**
 * Validate transaction data
 * @param {object} data - Transaction data object
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateTransactionData = (data) => {
  if (!data?.userId) {
    return { valid: false, error: 'User ID required' };
  }
  
  if (!data?.type) {
    return { valid: false, error: 'Transaction type required' };
  }
  
  if (!validateTransactionType(data.type)) {
    return { valid: false, error: 'Invalid transaction type' };
  }
  
  if (typeof data?.amount !== 'number' || data.amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  // Validate loanId for investment/repayment transactions
  if ((data.type === TRANSACTION_TYPES.INVESTMENT || data.type === TRANSACTION_TYPES.REPAYMENT) && !data.loanId) {
    return { valid: false, error: 'Loan ID required for investment/repayment transactions' };
  }
  
  return { valid: true };
};

// ============ CORE FUNCTIONS ============

/**
 * Create a new transaction record
 */
export const createTransaction = async (transactionData) => {
  const validation = validateTransactionData(transactionData);
  if (!validation.valid) throw new Error(validation.error);

  const transaction = {
    userId: transactionData.userId,
    amount: transactionData.amount,
    type: transactionData.type,
    loanId: transactionData.loanId || null,
    status: transactionData.status || TRANSACTION_STATUS.COMPLETED,
    timestamp: serverTimestamp(),
    description: transactionData.description || null,
    paymentMethodId: transactionData.paymentMethodId || null
  };

  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transaction);
  return { transactionId: docRef.id, ...transaction };
};

/**
 * Get transactions by userId with optional filters
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters { type, status, limitCount }
 */
export const getTransactionsByUserId = async (userId, filters = {}) => {
  const { type = null, status = null, limitCount = 50 } = filters;
  
  let q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  if (type) {
    q = query(q, where('type', '==', type));
  }

  if (status) {
    q = query(q, where('status', '==', status));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ transactionId: doc.id, ...doc.data() }));
};

/**
 * Subscribe to real-time user transaction updates
 * @param {string} userId - User ID
 * @param {function} callback - Callback function receiving { transactions, hasMore, lastVisible }
 * @param {number} limitCount - Number of transactions to fetch (default: 10)
 * @returns unsubscribe function
 */
export const subscribeToUserTransactions = (userId, callback, limitCount = 10) => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount + 1) // Fetch one extra to check if more exist
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const docs = snapshot.docs;
      const hasMore = docs.length > limitCount;
      const transactions = docs
        .slice(0, limitCount)
        .map(doc => ({ transactionId: doc.id, ...doc.data() }));
      
      const lastVisible = transactions.length > 0 
        ? docs[limitCount - 1] 
        : null;

      callback({ transactions, hasMore, lastVisible });
    },
    (error) => {
      console.error('Transaction subscription error:', error);
      callback({ transactions: [], hasMore: false, lastVisible: null });
    }
  );
};

/**
 * Load more transactions with pagination
 * @param {string} userId - User ID
 * @param {object} lastTransaction - Last visible document from previous query
 * @param {number} limitCount - Number of transactions to fetch (default: 10)
 * @returns {Promise<{transactions: Array, hasMore: boolean, lastVisible: object}>}
 */
export const getMoreTransactions = async (userId, lastTransaction, limitCount = 10) => {
  if (!lastTransaction) {
    throw new Error('lastTransaction is required for pagination');
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    startAfter(lastTransaction),
    limit(limitCount + 1) // Fetch one extra to check if more exist
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const hasMore = docs.length > limitCount;
  const transactions = docs
    .slice(0, limitCount)
    .map(doc => ({ transactionId: doc.id, ...doc.data() }));
  
  const lastVisible = transactions.length > 0 
    ? docs[Math.min(limitCount - 1, docs.length - 1)] 
    : null;

  return { transactions, hasMore, lastVisible };
};

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status (pending|completed|failed)
 */
export const updateTransactionStatus = async (transactionId, status) => {
  if (!validateTransactionStatus(status)) {
    throw new Error('Invalid transaction status');
  }

  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
  await updateDoc(docRef, { status });
  
  return { transactionId, status };
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId) => {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { transactionId: docSnap.id, ...docSnap.data() } : null;
};

/**
 * Get ALL transactions for a user (for export purposes)
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters { type, status }
 * @returns {Promise<Array>} All transactions for the user
 */
export const getAllTransactionsForExport = async (userId, filters = {}) => {
  const { type = null, status = null } = filters;
  
  let q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  if (type) {
    q = query(q, where('type', '==', type));
  }

  if (status) {
    q = query(q, where('status', '==', status));
  }

  // No limit - fetch ALL transactions
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ transactionId: doc.id, ...doc.data() }));
};
