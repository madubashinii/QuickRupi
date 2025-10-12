/**
 * Transaction Type Utilities
 * 
 * Common utility functions for transaction type checking and categorization
 */

import { TRANSACTION_TYPES } from './transactionService';

/**
 * Check if a transaction is a credit (money coming in)
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if transaction is a credit
 */
export const isTransactionCredit = (transaction) => {
  return [TRANSACTION_TYPES.TOPUP, TRANSACTION_TYPES.REPAYMENT].includes(transaction.type);
};

/**
 * Check if a transaction is a debit (money going out)
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if transaction is a debit
 */
export const isTransactionDebit = (transaction) => {
  return !isTransactionCredit(transaction);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get transaction sign (+ or -)
 * @param {Object} transaction - Transaction object
 * @returns {string} '+' for credits, '-' for debits
 */
export const getTransactionSign = (transaction) => {
  return isTransactionCredit(transaction) ? '+' : '-';
};

