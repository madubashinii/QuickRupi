/**
 * Wallet Service - Main Export File
 * Provides clean imports for all wallet functionality
 */

// Export all service functions
export {
  createWallet,
  getWalletByUserId,
  getWalletById,
  updateWalletBalance,
  addFunds,
  withdrawFunds,
  getWalletBalance,
  subscribeToWallet,
  validateWalletData,
  validateAmount,
  checkSufficientBalance,
  validateLenderRole
} from './walletService';

// Export all utility functions
export {
  formatCurrency,
  parseCurrencyString,
  hasSufficientBalance,
  calculateNewBalance
} from './walletUtils';

// Export initialization function
export { initializeUserWallet } from './walletInitializer';
