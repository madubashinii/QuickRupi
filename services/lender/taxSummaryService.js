import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { fetchCompletedLoans } from './lenderLoanService';

// Sri Lankan tax rates for investment income (example - adjust as needed)
const TAX_RATE = 0.08; // 8% tax on investment income (adjust based on actual rates)

/**
 * Calculate tax summary for a lender
 * @param {string} userId - Lender user ID
 * @param {number} year - Tax year (e.g., 2024)
 * @returns {Promise<Object>} Tax summary data
 */
export const calculateTaxSummary = async (userId, year) => {
  try {
    // Fetch all completed loans
    const completedLoans = await fetchCompletedLoans(userId);
    
    // Filter loans completed in the specified year
    const loansInYear = completedLoans.filter(loan => {
      if (!loan.completedAt) return false;
      const completedDate = new Date(loan.completedAt);
      return completedDate.getFullYear() === year;
    });
    
    // Calculate totals
    const totalInterestIncome = loansInYear.reduce((sum, loan) => sum + (loan.interestEarned || 0), 0);
    const totalPrincipalInvested = loansInYear.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0);
    const totalReturns = loansInYear.reduce((sum, loan) => sum + (loan.totalReturn || 0), 0);
    
    // Calculate monthly breakdown
    const monthlyBreakdown = calculateMonthlyBreakdown(loansInYear);
    
    // Calculate tax liability
    const estimatedTax = totalInterestIncome * TAX_RATE;
    const netIncome = totalInterestIncome - estimatedTax;
    
    // Calculate ROI
    const roi = totalPrincipalInvested > 0 
      ? ((totalInterestIncome / totalPrincipalInvested) * 100).toFixed(2)
      : 0;
    
    return {
      year,
      userId,
      lenderName: 'Brian Gunasekara', // TODO: Replace with actual user name
      generatedDate: new Date().toISOString(),
      totalInterestIncome,
      totalPrincipalInvested,
      totalReturns,
      roi,
      estimatedTax,
      netIncome,
      taxRate: TAX_RATE * 100, // Convert to percentage
      loansCompleted: loansInYear.length,
      monthlyBreakdown,
      loanDetails: loansInYear.map(loan => ({
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        principalAmount: loan.principalAmount || 0,
        interestRate: loan.apr || 0,
        interestEarned: loan.interestEarned || 0,
        totalReturn: loan.totalReturn || 0,
        fundedAt: loan.fundedAt,
        completedAt: loan.completedAt
      }))
    };
  } catch (error) {
    console.error('Failed to calculate tax summary:', error);
    throw error;
  }
};

/**
 * Calculate monthly income breakdown
 * @param {Array} loans - Array of completed loans
 * @returns {Array} Monthly breakdown data
 */
const calculateMonthlyBreakdown = (loans) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = {};
  
  // Initialize all months with 0
  monthNames.forEach((month, index) => {
    monthlyData[index] = { month, interestEarned: 0, loansCompleted: 0 };
  });
  
  // Sum up interest by completion month
  loans.forEach(loan => {
    if (!loan.completedAt) return;
    const completedDate = new Date(loan.completedAt);
    const monthIndex = completedDate.getMonth();
    monthlyData[monthIndex].interestEarned += (loan.interestEarned || 0);
    monthlyData[monthIndex].loansCompleted += 1;
  });
  
  // Convert to array and filter out months with no activity
  return Object.values(monthlyData).filter(m => m.loansCompleted > 0);
};

/**
 * Generate HTML for tax summary PDF
 * @param {Object} taxData - Tax summary data
 * @returns {string} HTML string
 */
export const generateTaxSummaryHTML = (taxData) => {
  const {
    year,
    lenderName,
    generatedDate,
    totalInterestIncome,
    totalPrincipalInvested,
    totalReturns,
    roi,
    estimatedTax,
    netIncome,
    taxRate,
    loansCompleted,
    monthlyBreakdown,
    loanDetails
  } = taxData;
  
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
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          background: #16697a;
          color: white;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .summary-item {
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid #16697a;
        }
        .summary-item label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-item value {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }
        .tax-highlight {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .tax-highlight h3 {
          margin: 0 0 10px 0;
          color: #856404;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 13px;
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
        .disclaimer {
          background: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-left: 4px solid #6c757d;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <h1>Annual Tax Summary ${year}</h1>
        <p><strong>Lender:</strong> ${lenderName}</p>
        <p><strong>Generated:</strong> ${formatDate(generatedDate)}</p>
        <p><strong>QuickRupi Investment Platform</strong></p>
      </div>

      <!-- Income Summary -->
      <div class="section">
        <div class="section-title">Income Summary</div>
        <div class="summary-grid">
          <div class="summary-item">
            <label>Total Interest Income</label>
            <value>${formatCurrency(totalInterestIncome)}</value>
          </div>
          <div class="summary-item">
            <label>Total Principal Invested</label>
            <value>${formatCurrency(totalPrincipalInvested)}</value>
          </div>
          <div class="summary-item">
            <label>Total Returns Received</label>
            <value>${formatCurrency(totalReturns)}</value>
          </div>
          <div class="summary-item">
            <label>Return on Investment (ROI)</label>
            <value>${roi}%</value>
          </div>
          <div class="summary-item">
            <label>Loans Completed</label>
            <value>${loansCompleted}</value>
          </div>
          <div class="summary-item">
            <label>Net Income (After Tax)</label>
            <value>${formatCurrency(netIncome)}</value>
          </div>
        </div>
      </div>

      <!-- Tax Calculation -->
      <div class="tax-highlight">
        <h3>Tax Liability Estimate</h3>
        <p><strong>Taxable Interest Income:</strong> ${formatCurrency(totalInterestIncome)}</p>
        <p><strong>Applicable Tax Rate:</strong> ${taxRate}%</p>
        <p><strong>Estimated Tax Payable:</strong> ${formatCurrency(estimatedTax)}</p>
        <p style="margin-top: 10px; font-size: 11px; color: #856404;">
          * This is an estimate based on standard investment income tax rates. 
          Please consult with a tax professional for accurate calculations.
        </p>
      </div>

      <!-- Monthly Breakdown -->
      ${monthlyBreakdown.length > 0 ? `
      <div class="section">
        <div class="section-title">Monthly Income Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Loans Completed</th>
              <th>Interest Earned</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyBreakdown.map(m => `
              <tr>
                <td>${m.month}</td>
                <td>${m.loansCompleted}</td>
                <td>${formatCurrency(m.interestEarned)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Loan Details -->
      <div class="section">
        <div class="section-title">Loan-by-Loan Details</div>
        <table>
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Borrower</th>
              <th>Principal</th>
              <th>APR</th>
              <th>Interest Earned</th>
              <th>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            ${loanDetails.map(loan => `
              <tr>
                <td>${loan.loanId}</td>
                <td>${loan.borrowerName}</td>
                <td>${formatCurrency(loan.principalAmount)}</td>
                <td>${loan.interestRate}%</td>
                <td>${formatCurrency(loan.interestEarned)}</td>
                <td>${formatDate(loan.completedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer">
        <strong>Important Notice:</strong> This tax summary is provided for informational purposes only 
        and should not be considered as professional tax advice. Tax laws and rates may vary. 
        Please consult with a qualified tax advisor or accountant for accurate tax filing and planning.
        QuickRupi is not responsible for any tax-related decisions made based on this document.
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>QuickRupi Investment Platform</strong></p>
        <p>This document was automatically generated on ${formatDate(generatedDate)}</p>
        <p>For questions or support, please contact: support@quickrupi.lk</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export tax summary as PDF and share
 * @param {string} userId - Lender user ID
 * @param {number} year - Tax year
 * @returns {Promise<Object>} Export result
 */
export const exportTaxSummaryPDF = async (userId, year) => {
  try {
    // Calculate tax summary
    const taxData = await calculateTaxSummary(userId, year);
    
    // Generate HTML
    const html = generateTaxSummaryHTML(taxData);
    
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
      dialogTitle: `Tax Summary ${year}`,
      UTI: 'com.adobe.pdf'
    });
    
    return {
      success: true,
      uri,
      taxData
    };
  } catch (error) {
    console.error('Failed to export tax summary PDF:', error);
    throw error;
  }
};

/**
 * Get available tax years (current and previous years)
 * @returns {Array<number>} Array of available years
 */
export const getAvailableTaxYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2];
};

