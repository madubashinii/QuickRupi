/**
 * Loan PDF Service
 * Handles PDF generation and sharing for loan reports
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import {
  formatLoanForReport,
  formatRepaymentScheduleForReport,
  generateReportFilename,
  calculateLoanSummary
} from './loanReportService';

/**
 * Get CSS styles for PDF
 * @returns {string} CSS styles
 */
const getPdfStyles = () => `
  <style>
    body {
      font-family: 'Helvetica', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #000000;
    }
    .header {
      background-color: #0c6170;
      color: #ffffff;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .header h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      color: #0c6170;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 2px solid #37beb0;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .info-label {
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 14px;
      font-weight: bold;
      color: #000000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #0c6170;
      color: #ffffff;
      padding: 10px;
      text-align: left;
      font-size: 12px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .status-paid {
      color: #107869;
      font-weight: bold;
    }
    .status-pending {
      color: #6c757d;
    }
    .status-overdue {
      color: #dc3545;
      font-weight: bold;
    }
    .performance-box {
      background-color: #dbf5f0;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #37beb0;
    }
    .performance-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #a4e5e0;
    }
    .performance-item:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      font-size: 10px;
      color: #6c757d;
      text-align: center;
    }
  </style>
`;

/**
 * Build PDF header
 * @param {Object} loan - Formatted loan object
 * @returns {string} HTML header
 */
const buildPdfHeader = (loan) => `
  <div class="header">
    <h1>QuickRupi Loan Report</h1>
    <p>Loan ID: ${loan.loanId}</p>
  </div>
`;

/**
 * Build loan summary section
 * @param {Object} loan - Formatted loan object
 * @param {Object} summary - Loan summary with calculations
 * @returns {string} HTML loan summary section
 */
const buildLoanSummarySection = (loan, summary) => `
  <div class="section">
    <h2 class="section-title">Loan Summary</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Borrower</div>
        <div class="info-value">${loan.borrowerName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Loan Purpose</div>
        <div class="info-value">${loan.purpose}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Principal Amount</div>
        <div class="info-value">LKR ${summary.principalAmount.toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Interest Rate (APR)</div>
        <div class="info-value">${summary.apr}%</div>
      </div>
      <div class="info-item">
        <div class="info-label">Loan Term</div>
        <div class="info-value">${summary.termMonths} months</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">${loan.status}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Funded Date</div>
        <div class="info-value">${loan.fundedDate}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Completed Date</div>
        <div class="info-value">${loan.completedDate}</div>
      </div>
    </div>
  </div>
`;

/**
 * Build repayment schedule table
 * @param {Array} schedule - Formatted repayment schedule
 * @returns {string} HTML repayment schedule table
 */
const buildRepaymentScheduleTable = (schedule) => {
  const rows = schedule.map(item => `
    <tr>
      <td>${item.installmentNumber}</td>
      <td>${item.dueDate}</td>
      <td>LKR ${item.principalPayment.toLocaleString()}</td>
      <td>LKR ${item.interestPayment.toLocaleString()}</td>
      <td>LKR ${item.totalPayment.toLocaleString()}</td>
      <td>LKR ${item.remainingBalance.toLocaleString()}</td>
      <td class="status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</td>
      <td>${item.paidDate || '-'}</td>
    </tr>
  `).join('');

  return `
    <div class="section">
      <h2 class="section-title">Repayment Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Due Date</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Total</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Paid Date</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Build performance section
 * @param {Object} summary - Loan summary with ROI calculations
 * @returns {string} HTML performance section
 */
const buildPerformanceSection = (summary) => `
  <div class="section">
    <h2 class="section-title">Investment Performance</h2>
    <div class="performance-box">
      <div class="performance-item">
        <span>Principal Invested:</span>
        <strong>LKR ${summary.principalAmount.toLocaleString()}</strong>
      </div>
      <div class="performance-item">
        <span>Total Interest Earned:</span>
        <strong style="color: #107869;">LKR ${summary.totalInterestEarned.toLocaleString()}</strong>
      </div>
      <div class="performance-item">
        <span>Total Amount Repaid:</span>
        <strong>LKR ${summary.totalRepaid.toLocaleString()}</strong>
      </div>
      <div class="performance-item">
        <span>Return on Investment (ROI):</span>
        <strong style="color: #0c6170; font-size: 16px;">${summary.roi}%</strong>
      </div>
    </div>
  </div>
`;

/**
 * Build PDF footer
 * @returns {string} HTML footer
 */
const buildPdfFooter = () => {
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
    <div class="footer">
      <p>Generated on ${date}</p>
      <p>This report is confidential and intended for the recipient only. QuickRupi © ${new Date().getFullYear()}</p>
    </div>
  `;
};

/**
 * Generate complete PDF HTML
 * @param {Object} loan - Formatted loan object
 * @param {Object} repaymentData - Repayment data with schedule
 * @param {Object} summary - Loan summary with calculations
 * @returns {string} Complete HTML document
 */
const generatePdfHtml = (loan, repaymentData, summary) => {
  const formattedSchedule = formatRepaymentScheduleForReport(repaymentData.schedule || []);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Loan Report - ${loan.loanId}</title>
        ${getPdfStyles()}
      </head>
      <body>
        ${buildPdfHeader(loan)}
        ${buildLoanSummarySection(loan, summary)}
        ${buildPerformanceSection(summary)}
        ${buildRepaymentScheduleTable(formattedSchedule)}
        ${buildPdfFooter()}
      </body>
    </html>
  `;
};

/**
 * Export loan to PDF
 * @param {Object} loan - Raw loan object from service
 * @param {Object} repaymentData - Repayment data from repaymentService
 * @param {string} filename - Optional custom filename
 * @returns {Promise<string>} Path to generated PDF file
 */
export const exportLoanToPDF = async (loan, repaymentData, filename = null) => {
  try {
    // Format loan data
    const formattedLoan = formatLoanForReport(loan);
    
    // Calculate summary
    const summary = calculateLoanSummary(loan, repaymentData);
    
    // Generate HTML
    const html = generatePdfHtml(formattedLoan, repaymentData, summary);
    
    // Generate filename if not provided
    const pdfFilename = filename || generateReportFilename(formattedLoan.loanId);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Export and share loan PDF (complete workflow)
 * @param {Object} loan - Raw loan object from service
 * @param {Object} repaymentData - Repayment data from repaymentService
 * @returns {Promise<void>}
 */
export const exportAndShareLoanPDF = async (loan, repaymentData) => {
  try {
    // Generate PDF
    const pdfUri = await exportLoanToPDF(loan, repaymentData);
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Share PDF
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Loan Report',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};

