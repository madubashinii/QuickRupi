import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { colors } from '../../theme';
import { 
  formatTransactionForExport, 
  generateExportFilename,
  getExportSummary
} from './transactionExportService';

// ============ REUSED HELPERS (imported from transactionExportService) ============
// formatTransactionForExport, generateExportFilename, getExportSummary

// Internal validation and sorting (minimal duplicates for encapsulation)
const validateTransactions = (transactions) => {
  if (!transactions?.length) {
    throw new Error('No transactions available to export');
  }
};

const sortTransactionsByDate = (transactions) => {
  return [...transactions].sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateB - dateA;
  });
};

// ============ PDF TEMPLATE COMPONENTS ============

/**
 * Build PDF header with company info and date
 * @param {Object} summary - Summary object (unused but kept for consistency)
 * @returns {string} HTML header section
 */
export const buildPdfHeader = (summary) => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `
    <div class="header">
      <div class="company-name">QuickRupi</div>
      <div class="title">Transaction Report</div>
      <div class="subtitle">Generated on ${currentDate}</div>
    </div>
  `;
};

/**
 * Build PDF summary section with statistics
 * @param {Object} summary - {count, totalCredits, totalDebits}
 * @returns {string} HTML summary section
 */
export const buildPdfSummarySection = (summary) => {
  return `
    <div class="summary">
      <div class="summary-row">
        <span class="summary-label">Total Transactions:</span>
        <span class="summary-value">${summary.count}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Total Credits:</span>
        <span class="summary-value credit">+ LKR ${summary.totalCredits.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Total Debits:</span>
        <span class="summary-value debit">- LKR ${summary.totalDebits.toLocaleString()}</span>
      </div>
    </div>
  `;
};

/**
 * Build PDF transaction table
 * @param {Array} transactions - Formatted transaction objects
 * @returns {string} HTML table
 */
export const buildPdfTransactionTable = (transactions) => {
  const rows = transactions.map((txn, index) => {
    const isCredit = txn.amount.includes('+');
    const amountColor = isCredit ? colors.forestGreen : colors.red;
    
    return `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 12px 8px; font-size: 11px; color: #666;">${index + 1}</td>
        <td style="padding: 12px 8px; font-size: 11px; color: #666;">${txn.date}</td>
        <td style="padding: 12px 8px; font-size: 11px; color: #333;">${txn.type}</td>
        <td style="padding: 12px 8px; font-size: 11px; color: #555; max-width: 180px;">${txn.description}</td>
        <td style="padding: 12px 8px; font-size: 11px; font-weight: 600; color: ${amountColor}; text-align: right;">${txn.amount}</td>
        <td style="padding: 12px 8px; font-size: 11px; color: #666; text-align: center;">${txn.status}</td>
      </tr>
    `;
  }).join('');

  return `
    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th style="width: 80px;">Date</th>
          <th style="width: 100px;">Type</th>
          <th>Description</th>
          <th style="width: 120px;">Amount</th>
          <th style="width: 80px;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * Build PDF footer with disclaimer
 * @returns {string} HTML footer section
 */
export const buildPdfFooter = () => {
  return `
    <div class="footer">
      <p><strong class="footer-brand">QuickRupi</strong> - Microloan Platform</p>
      <p>This is a system-generated report. For inquiries, contact support.</p>
      <p>Confidential - For authorized use only</p>
    </div>
  `;
};

/**
 * Get CSS styles for PDF (inline for compatibility)
 * @returns {string} CSS style string
 */
const getPdfStyles = () => {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 20mm; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      padding: 20px; 
      color: #333;
      max-width: 210mm;
    }
    .header { 
      margin-bottom: 25px; 
      border-bottom: 3px solid ${colors.blueGreen}; 
      padding-bottom: 15px;
    }
    .company-name { 
      font-size: 14px; 
      font-weight: 700; 
      color: ${colors.midnightBlue}; 
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .title { 
      font-size: 24px; 
      font-weight: 700; 
      color: #333; 
      margin-bottom: 5px; 
    }
    .subtitle { 
      font-size: 12px; 
      color: #666; 
    }
    .summary { 
      background: #f9f9f9; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px;
      border: 1px solid #e5e5e5;
    }
    .summary-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0; 
      border-bottom: 1px solid #e0e0e0; 
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-size: 12px; color: #666; }
    .summary-value { font-size: 12px; font-weight: 600; color: #333; }
    .credit { color: ${colors.forestGreen}; }
    .debit { color: ${colors.red}; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 15px;
      font-size: 11px;
    }
    thead { 
      background: ${colors.blueGreen}; 
      color: white; 
    }
    th { 
      padding: 12px 8px; 
      text-align: left; 
      font-size: 10px; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
    }
    th:last-child, td:last-child { text-align: center; }
    th:nth-last-child(2), td:nth-last-child(2) { text-align: right; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .footer { 
      margin-top: 30px; 
      padding-top: 15px; 
      border-top: 2px solid #e5e5e5; 
      text-align: center; 
      font-size: 10px; 
      color: #555; 
    }
    .footer p { margin: 3px 0; }
    .footer-brand { 
      color: ${colors.midnightBlue}; 
      font-weight: 700;
    }
  `;
};

/**
 * Generate complete HTML for PDF from transactions data
 * Assembles all template components
 * @param {Array} transactions - Formatted transaction objects
 * @param {Object} summary - Transaction summary {count, totalCredits, totalDebits}
 * @returns {string} Complete HTML document
 */
export const generatePdfHtml = (transactions, summary) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Report</title>
        <style>${getPdfStyles()}</style>
      </head>
      <body>
        ${buildPdfHeader(summary)}
        ${buildPdfSummarySection(summary)}
        ${buildPdfTransactionTable(transactions)}
        ${buildPdfFooter()}
      </body>
    </html>
  `;
};

// ============ PDF EXPORT ============

/**
 * Export transactions to PDF format
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Optional custom filename
 * @returns {Promise<Object>} PDF data with URI
 */
export const exportToPDF = async (transactions, filename = null) => {
  try {
    // Validate and sort
    validateTransactions(transactions);
    const sortedTransactions = sortTransactionsByDate(transactions);
    
    // Format transactions
    const formattedTransactions = sortedTransactions.map(formatTransactionForExport);
    
    // Calculate summary
    const summary = getExportSummary(transactions);
    
    // Generate HTML
    const html = generatePdfHtml(formattedTransactions, summary);
    
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Generate filename
      const exportFilename = filename || generateExportFilename('all', 'pdf');
      
      console.log(` PDF generated: ${exportFilename} (${transactions.length} transactions)`);
      
      return {
        uri,
        filename: exportFilename,
        count: transactions.length,
        success: true
      };
    } catch (error) {
      console.error('PDF export failed:', error.message);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  };

// ============ COMPLETE WORKFLOW ============

/**
 * Export and share PDF file - complete workflow
 * @param {Array} transactions - Transactions to export
 * @param {string} filterType - Filter type for filename
 * @returns {Promise<Object>} Export result
 */
export const exportAndSharePDF = async (transactions, filterType = 'all') => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('PDF sharing is not available on this device');
    }
    
    // Generate PDF
    const filename = generateExportFilename(filterType, 'pdf');
    const pdfData = await exportToPDF(transactions, filename);
    
      // Share PDF
      await Sharing.shareAsync(pdfData.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Transactions',
        UTI: Platform.OS === 'ios' ? 'com.adobe.pdf' : undefined
      });
      
      console.log(` PDF shared successfully: ${pdfData.filename}`);
      
      return {
        success: true,
        filename: pdfData.filename,
        count: pdfData.count,
        message: 'PDF exported successfully'
      };
  } catch (error) {
    // Handle user cancellation
    if (error.message?.includes('cancel') || error.message?.includes('dismiss')) {
      throw new Error('Export cancelled by user');
    }
    
    console.error('PDF export and share failed:', error.message);
    throw new Error(error.message || 'PDF export failed');
  }
};