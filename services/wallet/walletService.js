import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

const WALLETS_COLLECTION = 'wallets';

// ============ VALIDATION FUNCTIONS ============

/**
 * Validate wallet data structure
 */
export const validateWalletData = (data) => {
  if (!data || typeof data !== 'object') return false;
  return data.walletId && data.userId && typeof data.balance === 'number' && data.currency;
};

/**
 * Validate amount is positive number
 */
export const validateAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};

/**
 * Check if user has sufficient balance
 */
export const checkSufficientBalance = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);
  if (!wallet) throw new Error('Wallet not found');
  return wallet.balance >= amount;
};

/**
 * Validate user role is lender
 * RULE: Only users with role='lender' can have wallets
 */
export const validateLenderRole = (userRole) => {
  return userRole === 'lender';
};

// ============ CORE FUNCTIONS ============
// NOTE: Wallets are for LENDERS ONLY. Borrowers do NOT have wallets.

/**
 * Create a new wallet for a user
 * IMPORTANT: Only call this for users with role='lender'
 */
export const createWallet = async (userId, initialBalance = 0) => {
  const walletRef = doc(collection(db, WALLETS_COLLECTION));
  const walletData = {
    walletId: walletRef.id,
    userId,
    balance: initialBalance,
    currency: 'LKR',
    lastUpdated: serverTimestamp()
  };
  
  await setDoc(walletRef, walletData);
  return walletData;
};

/**
 * Get wallet by userId
 */
export const getWalletByUserId = async (userId) => {
  const q = query(
    collection(db, WALLETS_COLLECTION),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  return querySnapshot.docs[0].data();
};

/**
 * Update wallet balance
 */
export const updateWalletBalance = async (walletId, newBalance) => {
  const walletRef = doc(db, WALLETS_COLLECTION, walletId);
  await updateDoc(walletRef, {
    balance: newBalance,
    lastUpdated: serverTimestamp()
  });
};

/**
 * Get wallet by walletId
 */
export const getWalletById = async (walletId) => {
  const walletRef = doc(db, WALLETS_COLLECTION, walletId);
  const walletSnap = await getDoc(walletRef);
  
  return walletSnap.exists() ? walletSnap.data() : null;
};

/**
 * Add funds to wallet
 */
export const addFunds = async (userId, amount) => {
  if (!validateAmount(amount)) throw new Error('Invalid amount');
  
  const wallet = await getWalletByUserId(userId);
  if (!wallet) throw new Error('Wallet not found');
  
  const newBalance = wallet.balance + amount;
  await updateWalletBalance(wallet.walletId, newBalance);
  return newBalance;
};

/**
 * Withdraw funds from wallet
 */
export const withdrawFunds = async (userId, amount) => {
  if (!validateAmount(amount)) throw new Error('Invalid amount');
  if (!(await checkSufficientBalance(userId, amount))) throw new Error('Insufficient balance');
  
  const wallet = await getWalletByUserId(userId);
  const newBalance = wallet.balance - amount;
  await updateWalletBalance(wallet.walletId, newBalance);
  return newBalance;
};

/**
 * Get current wallet balance
 */
export const getWalletBalance = async (userId) => {
  const wallet = await getWalletByUserId(userId);
  return wallet ? wallet.balance : null;
};

/**
 * Subscribe to real-time wallet updates
 * Returns unsubscribe function
 */
export const subscribeToWallet = (userId, onUpdate) => {
  const q = query(
    collection(db, WALLETS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const walletData = snapshot.docs[0].data();
      onUpdate(walletData);
    }
  }, (error) => {
    console.error('Wallet subscription error:', error);
  });
};
