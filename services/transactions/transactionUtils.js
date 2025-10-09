import { TRANSACTION_TYPES, TRANSACTION_STATUS } from './transactionService';

// ============ HELPER/UTILITY FUNCTIONS ============

/**
 * Generate transaction description based on type and metadata
 * @param {string} type - Transaction type
 * @param {number} amount - Transaction amount
 * @param {object} metadata - Additional metadata (e.g., loanId, paymentMethodId)
 * @returns {string} Human-readable description
 */
export const generateTransactionDescription = (type, amount, metadata = {}) => {
  const formattedAmount = `LKR ${amount.toLocaleString()}`;
  
  switch (type) {
    case TRANSACTION_TYPES.TOPUP:
      return metadata.paymentMethodId 
        ? `Added ${formattedAmount} to wallet` 
        : `Funds added: ${formattedAmount}`;
    
    case TRANSACTION_TYPES.WITHDRAW:
      return metadata.paymentMethodId 
        ? `Withdrew ${formattedAmount} from wallet` 
        : `Withdrawal: ${formattedAmount}`;
    
    case TRANSACTION_TYPES.INVESTMENT:
      return metadata.loanId 
        ? `Investment in loan ${metadata.loanId}: ${formattedAmount}` 
        : `Loan investment: ${formattedAmount}`;
    
    case TRANSACTION_TYPES.REPAYMENT:
      return metadata.loanId 
        ? `Repayment received from loan ${metadata.loanId}: ${formattedAmount}` 
        : `Repayment received: ${formattedAmount}`;
    
    default:
      return `Transaction: ${formattedAmount}`;
  }
};

/**
 * Format transaction for UI display
 * @param {object} transaction - Raw transaction object
 * @returns {object} Formatted transaction with display properties
 */
export const formatTransactionForDisplay = (transaction) => {
  const isPositive = [TRANSACTION_TYPES.TOPUP, TRANSACTION_TYPES.REPAYMENT].includes(transaction.type);
  const icon = {
    [TRANSACTION_TYPES.TOPUP]: 'arrow-down-circle',
    [TRANSACTION_TYPES.WITHDRAW]: 'arrow-up-circle',
    [TRANSACTION_TYPES.INVESTMENT]: 'trending-up',
    [TRANSACTION_TYPES.REPAYMENT]: 'cash'
  }[transaction.type] || 'swap-horizontal';

  return {
    ...transaction,
    isPositive,
    icon,
    formattedAmount: `${isPositive ? '+' : '-'} LKR ${transaction.amount.toLocaleString()}`,
    displayDescription: transaction.description || generateTransactionDescription(
      transaction.type, 
      transaction.amount, 
      { loanId: transaction.loanId, paymentMethodId: transaction.paymentMethodId }
    ),
    statusColor: {
      [TRANSACTION_STATUS.PENDING]: '#FFA500',
      [TRANSACTION_STATUS.COMPLETED]: '#4CAF50',
      [TRANSACTION_STATUS.FAILED]: '#F44336'
    }[transaction.status] || '#757575'
  };
};

/**
 * Apply transaction filter based on filter key
 * @param {array} transactions - Array of transactions
 * @param {string} filterKey - Filter key (all|deposits|payouts|repayments|fees)
 * @returns {array} Filtered transactions
 */
export const applyTransactionFilter = (transactions, filterKey) => {
  if (!transactions || filterKey === 'all') return transactions;

  const filterMap = {
    deposits: [TRANSACTION_TYPES.TOPUP, TRANSACTION_TYPES.REPAYMENT],
    payouts: [TRANSACTION_TYPES.WITHDRAW, TRANSACTION_TYPES.INVESTMENT],
    repayments: [TRANSACTION_TYPES.REPAYMENT],
    fees: [] // Reserved for future fee transactions
  };

  const allowedTypes = filterMap[filterKey];
  return allowedTypes ? transactions.filter(txn => allowedTypes.includes(txn.type)) : transactions;
};

/**
 * Filter transactions by date range
 * @param {array} transactions - Array of transactions
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {array} Filtered transactions
 */
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  if (!transactions || !startDate || !endDate) return transactions;

  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(23, 59, 59, 999);

  return transactions.filter(txn => {
    // Handle Firestore timestamp or Date object
    const txnDate = txn.timestamp?.toDate ? txn.timestamp.toDate().getTime() : new Date(txn.timestamp).getTime();
    return txnDate >= start && txnDate <= end;
  });
};

