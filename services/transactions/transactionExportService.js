import { isTransactionCredit, capitalize, getTransactionSign } from './transactionTypeUtils';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

// ============ CONSTANTS ============

const CSV_HEADERS = ['Transaction ID', 'Date', 'Time', 'Type', 'Description', 'Amount', 'Status', 'Payment Method'];
const CSV_DELIMITER = ',';
const UTF8_BOM = '\ufeff'; // Excel compatibility

// ============ VALIDATION ============

/**
 * Validate transactions array before export
 * @param {Array} transactions - Transactions to validate
 * @throws {Error} If validation fails
 * @returns {Object} Validation result with optional warning
 */
const validateTransactions = (transactions) => {
  if (!transactions) {
    throw new Error('Transactions data is required');
  }
  
  if (!Array.isArray(transactions)) {
    throw new Error('Transactions must be an array');
  }
  
  if (transactions.length === 0) {
    throw new Error('No transactions available to export');
  }
  
  // Warning for large datasets
  const warning = transactions.length > 1000 
    ? `Large dataset (${transactions.length} transactions). Export may take longer.`
    : null;
  
  return { valid: true, warning };
};

// ============ FORMATTERS ============

/**
 * Sort transactions by date (newest first)
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Sorted transactions
 */
const sortTransactionsByDate = (transactions) => {
  return [...transactions].sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateB - dateA; // Newest first
  });
};

/**
 * Format transaction for export
 * @param {Object} transaction - Transaction object
 * @returns {Object} Formatted transaction data
 */
export const formatTransactionForExport = (transaction) => {
  try {
    // Validate transaction object
    if (!transaction) {
      throw new Error('Transaction is null or undefined');
    }

    // Handle timestamp - multiple format support
    let timestamp;
    if (transaction.timestamp?.toDate) {
      // Firestore Timestamp
      timestamp = transaction.timestamp.toDate();
    } else if (transaction.timestamp instanceof Date) {
      // Already a Date object
      timestamp = transaction.timestamp;
    } else if (typeof transaction.timestamp === 'string' || typeof transaction.timestamp === 'number') {
      // String or number timestamp
      timestamp = new Date(transaction.timestamp);
    } else {
      // Fallback to current date if timestamp is invalid
      console.warn('Invalid timestamp for transaction:', transaction.transactionId || transaction.id);
      timestamp = new Date();
    }

    // Validate required fields
    if (!transaction.type) {
      throw new Error(`Transaction type is missing for transaction: ${transaction.transactionId || transaction.id}`);
    }

    if (transaction.amount === undefined || transaction.amount === null) {
      throw new Error(`Transaction amount is missing for transaction: ${transaction.transactionId || transaction.id}`);
    }

    const sign = getTransactionSign(transaction);
    
    return {
      transactionId: transaction.transactionId || transaction.id || 'N/A',
      date: timestamp.toLocaleDateString('en-GB'), // DD/MM/YYYY
      time: timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), // HH:MM
      type: capitalize(transaction.type),
      description: transaction.description || transaction.displayDescription || `${transaction.type} transaction`,
      amount: `${sign} LKR ${Number(transaction.amount).toLocaleString()}`,
      status: capitalize(transaction.status || 'completed'),
      paymentMethod: transaction.paymentMethodId || transaction.loanId || 'N/A'
    };
  } catch (error) {
    console.error('Error formatting transaction:', error);
    console.error('Problematic transaction:', transaction);
    throw error;
  }
};

/**
 * Escape CSV special characters
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Escape if contains comma, quote, or newline
  if (stringValue.includes(CSV_DELIMITER) || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Convert transaction object to CSV row
 * @param {Object} formattedTransaction - Formatted transaction
 * @returns {string} CSV row
 */
const transactionToCSVRow = (formattedTransaction) => {
  return [
    formattedTransaction.transactionId,
    formattedTransaction.date,
    formattedTransaction.time,
    formattedTransaction.type,
    formattedTransaction.description,
    formattedTransaction.amount,
    formattedTransaction.status,
    formattedTransaction.paymentMethod
  ].map(escapeCSVValue).join(CSV_DELIMITER);
};

/**
 * Generate export filename
 * @param {string} filterType - Current filter type (all, deposits, payouts, etc.)
 * @param {string} format - Export format (csv, pdf)
 * @returns {string} Generated filename
 */
export const generateExportFilename = (filterType = 'all', format = 'csv') => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
  
  const filterPrefix = filterType === 'all' ? 'transactions' : `transactions_${filterType}`;
  
  return `${filterPrefix}_${dateStr}_${timeStr}.${format}`;
};

// ============ EXPORT FUNCTIONS ============

/**
 * Export transactions to CSV format
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Optional custom filename
 * @returns {Object} CSV data and metadata
 * @throws {Error} If export fails
 */
export const exportToCSV = (transactions, filename = null) => {
  try {
    // Validate input
    const validation = validateTransactions(transactions);
    
    // Sort by date (newest first)
    const sortedTransactions = sortTransactionsByDate(transactions);
    
    // Format transactions
    const formattedTransactions = sortedTransactions.map(formatTransactionForExport);
    
    // Build CSV content
    const headers = CSV_HEADERS.join(CSV_DELIMITER);
    const rows = formattedTransactions.map(transactionToCSVRow);
    const csvContent = UTF8_BOM + headers + '\n' + rows.join('\n');
    
    // Generate filename if not provided
    const exportFilename = filename || generateExportFilename('all', 'csv');
    
    return {
      content: csvContent,
      filename: exportFilename,
      mimeType: 'text/csv',
      count: transactions.length,
      success: true,
      warning: validation.warning
    };
    
  } catch (error) {
    console.error('CSV export failed:', error.message);
    throw new Error(`CSV export failed: ${error.message}`);
  }
};

// ============ UTILITY ============

/**
 * Get export summary statistics
 * @param {Array} transactions - Transactions to summarize
 * @returns {Object} Summary statistics
 */
export const getExportSummary = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { count: 0, totalCredits: 0, totalDebits: 0 };
  }
  
  const summary = transactions.reduce((acc, txn) => {
    const isCredit = isTransactionCredit(txn);
    
    return {
      count: acc.count + 1,
      totalCredits: isCredit ? acc.totalCredits + txn.amount : acc.totalCredits,
      totalDebits: !isCredit ? acc.totalDebits + txn.amount : acc.totalDebits
    };
  }, { count: 0, totalCredits: 0, totalDebits: 0 });
  
  return summary;
};

// ============ FILE HANDLING ============

/**
 * Get platform-specific error message
 * @param {string} errorType - Type of error
 * @param {Error} error - Original error object
 * @returns {string} User-friendly error message
 */
const getPlatformError = (errorType, error) => {
  const platform = Platform.OS;
  
  const errorMessages = {
    save: {
      ios: 'Failed to save file to device. Please ensure the app has storage access.',
      android: 'Failed to save file. Storage may be full or unavailable.',
      default: `Failed to save file: ${error.message}`
    },
    share: {
      ios: 'Failed to open share dialog. Please try again.',
      android: 'Failed to share file. Please check if you have sharing apps installed.',
      default: `Failed to share: ${error.message}`
    },
    permission: {
      ios: 'File sharing is not available on this device.',
      android: 'File sharing requires additional permissions. Please grant access in Settings.',
      default: 'Sharing is not available on this device'
    }
  };
  
  return errorMessages[errorType]?.[platform] || errorMessages[errorType]?.default || error.message;
};

/**
 * Save CSV content to device directory
 * Uses cacheDirectory (preferred) or documentDirectory as fallback
 * Compatible with Android 10+ scoped storage (no permissions needed for cache)
 * @param {string} content - CSV content to save
 * @param {string} filename - Filename for the CSV
 * @returns {Promise<string>} File URI
 */
const saveToCache = async (content, filename) => {
  try {
    // Check if FileSystem module exists
    if (!FileSystem) {
      return { content, filename, isInMemory: true };
    }
    
    // Try different directory options
    let targetDirectory = null;
    
    if (FileSystem.cacheDirectory) {
      targetDirectory = FileSystem.cacheDirectory;
    } else if (FileSystem.documentDirectory) {
      targetDirectory = FileSystem.documentDirectory;
    } else {
      // FileSystem directories unavailable (common in Expo Go iOS Simulator)
      return { content, filename, isInMemory: true };
    }
    
    try {
      // Create full file path
      const fileUri = `${targetDirectory}${filename}`;
      
      // Write CSV content to file
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        return { uri: fileUri, filename, isInMemory: false };
      } else {
        return { content, filename, isInMemory: true };
      }
      
    } catch (writeError) {
      console.error('File write error:', writeError.message);
      return { content, filename, isInMemory: true };
    }
    
  } catch (error) {
    console.error('saveToCache error:', error.message);
    return { content, filename, isInMemory: true };
  }
};

/**
 * Share file using native share dialog
 * Supports both file-based and clipboard fallback
 * iOS: Uses UIActivityViewController
 * Android: Uses Intent.ACTION_SEND
 * @param {Object} fileData - File data object {uri, content, filename, isInMemory}
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<boolean>} True if shared successfully
 */
const shareFile = async (fileData, mimeType) => {
  try {
    // Method 1: In-memory - Platform-specific handling
    if (fileData.isInMemory) {
      // Web Platform: Use download link
      if (Platform.OS === 'web') {
        try {
          // Create blob and download link
          const blob = new Blob([fileData.content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileData.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          Alert.alert(
            ' Download Started',
            `${fileData.filename} is downloading to your Downloads folder.`,
            [{ text: 'OK', style: 'default' }]
          );
          
          return { usedClipboard: false, usedDownload: true };
        } catch (webError) {
          console.error('Web download error:', webError.message);
          throw new Error('Unable to download file. Please check browser permissions.');
        }
      }
      
      // Native Platform: Use clipboard
      try {
        await Clipboard.setStringAsync(fileData.content);
        
        Alert.alert(
          '📋 CSV Copied to Clipboard',
          `${fileData.filename} has been copied!\n\nTo save:\n1. Open Notes or Files app\n2. Paste (long press → Paste)\n3. Save as "${fileData.filename}"\n\nℹ️ Note: File export works on:\n• Physical devices\n• Android emulators\n• Custom dev builds\n\nExpo Go on iOS Simulator has limited file access.`,
          [{ text: 'Got it!', style: 'default' }]
        );
        
        return { usedClipboard: true };
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError.message);
        throw new Error('Unable to copy to clipboard. Please try again or use a physical device.');
      }
    }
    
    // Method 2: File URI sharing using expo-sharing
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Sharing not available on this device');
    }
    
    const shareOptions = {
      mimeType,
      dialogTitle: 'Export Transactions',
      UTI: Platform.OS === 'ios' && mimeType === 'text/csv' 
        ? 'public.comma-separated-values-text' 
        : undefined
    };
    
    await Sharing.shareAsync(fileData.uri, shareOptions);
    
    return { usedClipboard: false };
  } catch (error) {
    // Check if error is user cancellation
    const errorMsg = error.message || '';
    if (errorMsg.includes('cancel') || errorMsg.includes('dismiss') || errorMsg.includes('User did not share')) {
      throw new Error('Export cancelled by user');
    }
    
    console.error('Share error:', error.message);
    throw new Error(getPlatformError('share', error));
  }
};

/**
 * Delete temporary file from cache
 * @param {Object} fileData - File data object
 * @returns {Promise<void>}
 */
const cleanupFile = async (fileData) => {
  // Skip cleanup for in-memory files
  if (!fileData || fileData.isInMemory || !fileData.uri) {
    return;
  }
  
  try {
    if (FileSystem && FileSystem.getInfoAsync) {
      const fileInfo = await FileSystem.getInfoAsync(fileData.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileData.uri, { idempotent: true });
      }
    }
  } catch (error) {
    // Silently fail - file might already be deleted
  }
};

/**
 * Export and share CSV file
 * Complete workflow: generate CSV → save to cache → share → cleanup
 * @param {Array} transactions - Transactions to export
 * @param {string} filterType - Filter type for filename
 * @returns {Promise<Object>} Export result
 */
export const exportAndShareCSV = async (transactions, filterType = 'all') => {
  let fileData = null;
  
  try {
    // Generate CSV content
    const csvData = exportToCSV(transactions, null);
    const filename = generateExportFilename(filterType, 'csv');
    
    // Log warning if large dataset
    if (csvData.warning) {
      console.warn('Export warning:', csvData.warning);
    }
    
    // Save to cache or prepare in-memory
    fileData = await saveToCache(csvData.content, filename);
    
    // Share file
    await shareFile(fileData, csvData.mimeType);
    
    // Cleanup after successful share
    await cleanupFile(fileData);
    
    return {
      success: true,
      filename,
      count: csvData.count,
      warning: csvData.warning,
      usedClipboard: fileData.isInMemory,
      message: 'Export completed successfully'
    };
    
  } catch (error) {
    console.error('Export failed:', error.message);
    
    // Cleanup on error
    if (fileData) {
      await cleanupFile(fileData);
    }
    
    throw new Error(error.message || 'Export failed');
  }
};

