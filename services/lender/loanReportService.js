/**
 * Loan Report Service
 * Utility functions for generating loan reports
 */

/**
 * Format loan data for report display
 * @param {Object} loan - Loan object from lenderLoanService
 * @returns {Object} Formatted loan data
 */
export const formatLoanForReport = (loan) => {
  return {
    loanId: loan.id || loan.loanId,
    borrowerName: loan.borrowerName || 'Unknown',
    principalAmount: loan.amountFunded || loan.principalAmount || 0,
    interestRate: loan.apr || loan.actualAPR || 0,
    termMonths: loan.termMonths || 0,
    purpose: loan.purpose || loan.loanPurpose || '',
    fundedDate: formatDate(loan.fundedAt),
    completedDate: formatDate(loan.completedAt),
    status: loan.status || 'Unknown'
  };
};

/**
 * Format repayment schedule for report display
 * @param {Array} schedule - Repayment schedule array from repaymentService
 * @returns {Array} Formatted repayment schedule
 */
export const formatRepaymentScheduleForReport = (schedule) => {
  if (!Array.isArray(schedule)) return [];
  
  return schedule.map(installment => ({
    installmentNumber: installment.installmentNumber,
    dueDate: formatDate(installment.dueDate),
    principalPayment: installment.principalPayment || 0,
    interestPayment: installment.interestPayment || 0,
    totalPayment: installment.totalPayment || 0,
    remainingBalance: installment.remainingBalance || 0,
    status: installment.status || 'Pending',
    paidDate: installment.paidDate ? formatDate(installment.paidDate) : null
  }));
};

/**
 * Generate report filename
 * @param {string} loanId - Loan ID
 * @returns {string} Filename in format: loan-report-LOAN123-2025-10-10.pdf
 */
export const generateReportFilename = (loanId) => {
  const date = new Date().toISOString().split('T')[0];
  return `loan-report-${loanId}-${date}.pdf`;
};

/**
 * Calculate loan summary with totals, interest, and ROI
 * @param {Object} loan - Loan object
 * @param {Object} repaymentData - Repayment data with schedule
 * @returns {Object} Loan summary with calculations
 */
export const calculateLoanSummary = (loan, repaymentData) => {
  const principal = loan.amountFunded || loan.principalAmount || 0;
  const apr = loan.apr || loan.actualAPR || 0;
  
  let totalRepaid = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  
  // Calculate from repayment schedule if available
  if (repaymentData?.schedule && Array.isArray(repaymentData.schedule)) {
    repaymentData.schedule.forEach(installment => {
      totalPrincipal += installment.principalPayment || 0;
      totalInterest += installment.interestPayment || 0;
      totalRepaid += installment.totalPayment || 0;
    });
  } else {
    // Fallback to calculated values
    totalRepaid = principal * (1 + apr / 100);
    totalInterest = totalRepaid - principal;
    totalPrincipal = principal;
  }
  
  const roi = principal > 0 ? ((totalInterest / principal) * 100) : 0;
  
  return {
    principalAmount: principal,
    totalInterestEarned: totalInterest,
    totalRepaid: totalRepaid,
    roi: roi.toFixed(2),
    apr: apr.toFixed(2),
    termMonths: loan.termMonths || 0
  };
};

// Helper: Format date to readable string
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

