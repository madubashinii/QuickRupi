import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { fetchOngoingLoans, fetchCompletedLoans } from './lenderLoanService';
import { getWalletBalance } from '../wallet/walletService';

/**
 * Get lender name from Firestore
 * @param {string} userId - Lender user ID
 * @returns {Promise<string>} Lender name
 */
const getLenderName = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Try different name fields
      return userData.fullName || 
             userData.name || 
             `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
             userData.personalDetails?.nameWithInitials ||
             'Lender';
    }
    return 'Lender';
  } catch (error) {
    console.error('Error fetching lender name:', error);
    return 'Lender';
  }
};

/**
 * Calculate portfolio metrics for a lender
 * @param {string} userId - Lender user ID
 * @returns {Promise<Object>} Portfolio metrics data
 */
export const calculatePortfolioMetrics = async (userId) => {
  try {
    // Fetch all data in parallel
    const [lenderName, ongoingLoans, completedLoans, walletBalance] = await Promise.all([
      getLenderName(userId),
      fetchOngoingLoans(userId),
      fetchCompletedLoans(userId),
      getWalletBalance(userId)
    ]);

    // Calculate active investments metrics
    const activeCount = ongoingLoans.length;
    const totalActiveInvestment = ongoingLoans.reduce((sum, loan) => sum + (loan.amountFunded || 0), 0);
    const expectedReturns = ongoingLoans.reduce((sum, loan) => sum + (loan.repaymentAmount || 0), 0);
    const expectedInterest = expectedReturns - totalActiveInvestment;
    const avgActiveAPR = activeCount > 0 
      ? ongoingLoans.reduce((sum, loan) => sum + (loan.apr || 0), 0) / activeCount 
      : 0;

    // Calculate completed loans metrics
    const completedCount = completedLoans.length;
    const totalCompletedInvestment = completedLoans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0);
    const totalReturnsReceived = completedLoans.reduce((sum, loan) => sum + (loan.totalReturn || 0), 0);
    const totalInterestEarned = completedLoans.reduce((sum, loan) => sum + (loan.interestEarned || 0), 0);
    const avgCompletedROI = totalCompletedInvestment > 0 
      ? ((totalInterestEarned / totalCompletedInvestment) * 100).toFixed(2)
      : 0;

    // Calculate overall portfolio metrics
    const totalInvested = totalActiveInvestment + totalCompletedInvestment;
    const portfolioValue = walletBalance + totalActiveInvestment + expectedInterest;
    const overallROI = totalInvested > 0 
      ? (((totalInterestEarned + expectedInterest) / totalInvested) * 100).toFixed(2)
      : 0;
    const successRate = (activeCount + completedCount) > 0 
      ? ((completedCount / (activeCount + completedCount)) * 100).toFixed(1)
      : 0;

    return {
      userId,
      lenderName,
      generatedDate: new Date().toISOString(),
      // Portfolio overview
      portfolioValue,
      walletBalance: walletBalance || 0,
      totalInvested,
      overallROI,
      successRate,
      // Active investments
      activeLoans: {
        count: activeCount,
        totalInvestment: totalActiveInvestment,
        expectedReturns,
        expectedInterest,
        avgAPR: avgActiveAPR.toFixed(2),
        loans: ongoingLoans.map(loan => ({
          loanId: loan.id,
          borrowerName: loan.borrowerName,
          principalAmount: loan.amountFunded || 0,
          apr: loan.apr || 0,
          purpose: loan.purpose || 'N/A',
          fundedAt: loan.fundedAt,
          expectedReturn: loan.repaymentAmount || 0,
          status: loan.status
        }))
      },
      // Completed investments
      completedLoans: {
        count: completedCount,
        totalInvestment: totalCompletedInvestment,
        totalReturns: totalReturnsReceived,
        totalInterest: totalInterestEarned,
        avgROI: avgCompletedROI,
        loans: completedLoans.map(loan => ({
          loanId: loan.id,
          borrowerName: loan.borrowerName,
          principalAmount: loan.principalAmount || 0,
          apr: loan.apr || 0,
          interestEarned: loan.interestEarned || 0,
          totalReturn: loan.totalReturn || 0,
          fundedAt: loan.fundedAt,
          completedAt: loan.completedAt,
          actualROI: loan.principalAmount > 0 
            ? ((loan.interestEarned / loan.principalAmount) * 100).toFixed(2) 
            : 0
        }))
      }
    };
  } catch (error) {
    console.error('Failed to calculate portfolio metrics:', error);
    throw error;
  }
};

/**
 * Generate HTML for portfolio report PDF
 * @param {Object} portfolioData - Portfolio metrics data
 * @returns {string} HTML string
 */
export const generatePortfolioReportHTML = (portfolioData) => {
  const {
    lenderName,
    generatedDate,
    portfolioValue,
    walletBalance,
    totalInvested,
    overallROI,
    successRate,
    activeLoans,
    completedLoans
  } = portfolioData;

  const formatCurrency = (amount) => `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          padding: 40px;
          color: #1a1a2e;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #16697a;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #16697a;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid #16697a;
        }
        .summary-card label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-card value {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }
        .section-title {
          background: #16697a;
          color: white;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: 600;
          margin: 30px 0 15px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 12px;
        }
        th {
          background: #16697a;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        .highlight {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <h1>Portfolio Report</h1>
        <p><strong>Lender:</strong> ${lenderName}</p>
        <p><strong>Generated:</strong> ${formatDate(generatedDate)}</p>
        <p><strong>QuickRupi Investment Platform</strong></p>
      </div>

      <!-- Portfolio Overview -->
      <div class="summary-grid">
        <div class="summary-card">
          <label>Total Portfolio Value</label>
          <value>${formatCurrency(portfolioValue)}</value>
        </div>
        <div class="summary-card">
          <label>Wallet Balance</label>
          <value>${formatCurrency(walletBalance)}</value>
        </div>
        <div class="summary-card">
          <label>Total Invested</label>
          <value>${formatCurrency(totalInvested)}</value>
        </div>
        <div class="summary-card">
          <label>Overall ROI</label>
          <value>${overallROI}%</value>
        </div>
        <div class="summary-card">
          <label>Success Rate</label>
          <value>${successRate}%</value>
        </div>
        <div class="summary-card">
          <label>Total Loans</label>
          <value>${activeLoans.count + completedLoans.count}</value>
        </div>
      </div>

      <!-- Active Investments Summary -->
      <div class="highlight">
        <h3 style="margin: 0 0 10px 0; color: #856404;">Active Investments Summary</h3>
        <p><strong>Active Loans:</strong> ${activeLoans.count}</p>
        <p><strong>Total Investment:</strong> ${formatCurrency(activeLoans.totalInvestment)}</p>
        <p><strong>Expected Returns:</strong> ${formatCurrency(activeLoans.expectedReturns)}</p>
        <p><strong>Expected Interest:</strong> ${formatCurrency(activeLoans.expectedInterest)}</p>
        <p><strong>Average APR:</strong> ${activeLoans.avgAPR}%</p>
      </div>

      <!-- Active Loans Table -->
      ${activeLoans.count > 0 ? `
      <div class="section-title">Active Loans (${activeLoans.count})</div>
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Borrower</th>
            <th>Principal</th>
            <th>APR</th>
            <th>Purpose</th>
            <th>Expected Return</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${activeLoans.loans.map(loan => `
            <tr>
              <td>${loan.loanId}</td>
              <td>${loan.borrowerName}</td>
              <td>${formatCurrency(loan.principalAmount)}</td>
              <td>${loan.apr}%</td>
              <td>${loan.purpose}</td>
              <td>${formatCurrency(loan.expectedReturn)}</td>
              <td>${loan.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p style="text-align: center; color: #666;">No active loans</p>'}

      <!-- Completed Investments Summary -->
      <div class="highlight" style="margin-top: 30px;">
        <h3 style="margin: 0 0 10px 0; color: #856404;">Completed Investments Summary</h3>
        <p><strong>Completed Loans:</strong> ${completedLoans.count}</p>
        <p><strong>Total Investment:</strong> ${formatCurrency(completedLoans.totalInvestment)}</p>
        <p><strong>Total Returns:</strong> ${formatCurrency(completedLoans.totalReturns)}</p>
        <p><strong>Total Interest Earned:</strong> ${formatCurrency(completedLoans.totalInterest)}</p>
        <p><strong>Average ROI:</strong> ${completedLoans.avgROI}%</p>
      </div>

      <!-- Completed Loans Table -->
      ${completedLoans.count > 0 ? `
      <div class="section-title">Completed Loans (${completedLoans.count})</div>
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Borrower</th>
            <th>Principal</th>
            <th>APR</th>
            <th>Interest Earned</th>
            <th>Total Return</th>
            <th>ROI</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          ${completedLoans.loans.map(loan => `
            <tr>
              <td>${loan.loanId}</td>
              <td>${loan.borrowerName}</td>
              <td>${formatCurrency(loan.principalAmount)}</td>
              <td>${loan.apr}%</td>
              <td>${formatCurrency(loan.interestEarned)}</td>
              <td>${formatCurrency(loan.totalReturn)}</td>
              <td>${loan.actualROI}%</td>
              <td>${formatDate(loan.completedAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p style="text-align: center; color: #666;">No completed loans</p>'}

      <!-- Footer -->
      <div class="footer">
        <p><strong>QuickRupi Investment Platform</strong></p>
        <p>This report was automatically generated on ${formatDate(generatedDate)}</p>
        <p>For questions or support, please contact: support@quickrupi.lk</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export portfolio report as PDF and share
 * @param {string} userId - Lender user ID
 * @returns {Promise<Object>} Export result
 */
export const exportPortfolioReportPDF = async (userId) => {
  try {
    // Calculate portfolio metrics
    const portfolioData = await calculatePortfolioMetrics(userId);
    
    // Generate HTML
    const html = generatePortfolioReportHTML(portfolioData);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });
    
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Share PDF
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Portfolio Report',
      UTI: 'com.adobe.pdf'
    });
    
    return {
      success: true,
      uri,
      portfolioData
    };
  } catch (error) {
    console.error('Failed to export portfolio report PDF:', error);
    throw error;
  }
};

