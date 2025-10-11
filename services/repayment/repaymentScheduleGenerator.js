/**
 * Utility to generate repayment schedules
 * Follows Single Responsibility Principle - only handles schedule calculation
 */

/**
 * Calculate monthly payment amount
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (APR)
 * @param {number} termMonths - Loan term in months
 * @returns {number} Monthly payment amount
 */
const calculateMonthlyPayment = (principal, annualInterestRate, termMonths) => {
  const monthlyRate = (annualInterestRate / 100) / 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                 (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment * 100) / 100; // Round to 2 decimal places
};

/**
 * Generate repayment schedule
 * @param {Object} params - Parameters for schedule generation
 * @param {number} params.loanAmount - Principal loan amount
 * @param {number} params.annualInterestRate - Annual interest rate (APR)
 * @param {number} params.termMonths - Loan term in months
 * @param {string} params.startDate - Start date for repayments (ISO string)
 * @param {string} params.borrowerId - ID of the borrower
 * @param {string} params.lenderId - ID of the lender
 * @returns {Array} Array of repayment installments
 */
export const generateRepaymentSchedule = ({
  loanAmount,
  annualInterestRate,
  termMonths,
  startDate,
  borrowerId,
  lenderId
}) => {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, termMonths);
  const monthlyRate = (annualInterestRate / 100) / 12;
  let remainingBalance = loanAmount;
  const schedule = [];
  const startDateTime = new Date(startDate);

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    // Calculate due date for this installment
    const dueDate = new Date(startDateTime);
    dueDate.setMonth(dueDate.getMonth() + month);

    schedule.push({
      installmentNumber: month,
      dueDate: dueDate.toISOString(),
      totalPayment: monthlyPayment,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
      status: 'pending',
      paidDate: null,
      borrowerId,
      lenderId
    });
  }

  return schedule;
};
