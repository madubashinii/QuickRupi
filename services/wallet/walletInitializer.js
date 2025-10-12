import { createWallet, getWalletByUserId } from './walletService';

/**
 * Initialize wallet for user
 * Checks if exists, creates if needed with balance 0
 * 
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Object} Wallet data
 * @throws {Error} If userId is not provided
 */
export const initializeUserWallet = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to initialize wallet');
  }
  
  // Check if wallet exists
  const existingWallet = await getWalletByUserId(userId);
  if (existingWallet) {
    return existingWallet;
  }
  
  // Create new wallet with balance 0
  const newWallet = await createWallet(userId, 0);
  return newWallet;
};
