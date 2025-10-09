import { createWallet, getWalletByUserId } from './walletService';

// Development configuration
const DEV_USER_ID = 'L001';

/**
 * Initialize wallet for user
 * Dev Mode: Always uses "L001"
 * Checks if exists, creates if needed with balance 0
 * 
 * @param {string} userId - User ID (ignored in dev, uses L001)
 * @returns {Object} Wallet data
 */
export const initializeUserWallet = async (userId = DEV_USER_ID) => {
  // Force dev userId
  const devUserId = DEV_USER_ID;
  
  // Check if wallet exists
  const existingWallet = await getWalletByUserId(devUserId);
  if (existingWallet) {
    return existingWallet;
  }
  
  // Create new wallet with balance 0
  const newWallet = await createWallet(devUserId, 0);
  return newWallet;
};
