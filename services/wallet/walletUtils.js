/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'LKR') => {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Parse numeric value from currency string
 */
export const parseCurrencyString = (currencyString) => {
  const numericValue = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(numericValue) || 0;
};

/**
 * Validate sufficient balance
 */
export const hasSufficientBalance = (walletBalance, amount) => {
  return walletBalance >= amount && amount > 0;
};

/**
 * Calculate new balance after transaction
 */
export const calculateNewBalance = (currentBalance, amount, operation = 'add') => {
  return operation === 'add' ? currentBalance + amount : currentBalance - amount;
};
