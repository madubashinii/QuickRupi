import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Fetch approved loans (for Browse tab)
 */
export const fetchApprovedLoans = async () => {
  try {
    // Fetch loans where status === "approved"
    const loansQuery = query(collection(db, "Loans"), where("status", "==", "approved"));
    const loanSnapshot = await getDocs(loansQuery);
    // Log for debugging
    console.log("Approved loans count:", loanSnapshot.docs.length);
    const loansData = loanSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Join with users data
    const userSnapshot = await getDocs(collection(db, "users"));
    const usersData = userSnapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id }));
    const usersMap = {};
    usersData.forEach((u) => { usersMap[u.userId] = u; });

    // TODO: Join with KYC data - comment out for later implementation
    // const kycSnapshot = await getDocs(collection(db, "kycSubmissions"));
    // const kycData = kycSnapshot.docs.map((doc) => doc.data());
    // const kycMap = {};
    // kycData.forEach((k) => {
    //     if (k.userId) kycMap[k.userId] = k;
    // });

    // Return formatted array
    return loansData.map((loan) => {
        const borrower = usersMap[loan.borrowerId] || {};
        
        // Handle Firestore timestamp or string date
        let createdAt = loan.createdAt;
        if (createdAt?.toDate) {
            // Firestore Timestamp
            createdAt = createdAt.toDate().toISOString();
        } else if (!createdAt) {
            // No date provided, use current date
            createdAt = new Date().toISOString();
        }
        
        return {
            id: loan.id || loan.loanId, // Use either id or loanId
            loanId: loan.loanId || loan.id, // Ensure loanId is also available
            borrowerName: borrower.name || "Unknown",
            borrowerId: loan.borrowerId,
            amountRequested: loan.amountRequested || 0,
            interestRate: loan.interestRate || loan.apr || 0,
            apr: loan.apr || loan.interestRate || 0, // Ensure apr is available
            termMonths: loan.termMonths || 0,
            purpose: loan.purpose || "",
            description: loan.description || "",
            status: loan.status,
            createdAt: createdAt,
            location: borrower.location || "Unknown" // Add location from borrower data
        };
    });
  } catch (error) {
    console.error("Failed to fetch approved loans. Please try again later.");
    throw error;
  }
};

/**
 * Fetch ongoing loans for a specific lender (for Ongoing tab)
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<Array>} Array of ongoing loan investments
 */
export const fetchOngoingLoans = async (lenderId) => {
  try {
    // Fetch all loans (we'll filter by lenderId in memory since Firestore doesn't support OR in WHERE)
    const loansQuery = collection(db, "Loans");
    const loanSnapshot = await getDocs(loansQuery);
    const allLoans = loanSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Filter for this lender's loans with ongoing statuses
    const ongoingStatuses = ['funding', 'funded', 'disbursed', 'repaying'];
    const lenderLoans = allLoans.filter(loan => 
      loan.lenderId === lenderId && ongoingStatuses.includes(loan.status)
    );

    // Join with users data for borrower names
    const userSnapshot = await getDocs(collection(db, "users"));
    const usersData = userSnapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id }));
    const usersMap = {};
    usersData.forEach((u) => { usersMap[u.userId] = u; });

    // Return formatted array
    return lenderLoans.map((loan) => {
        const borrower = usersMap[loan.borrowerId] || {};
        
        // Handle Firestore timestamp or string date
        let createdAt = loan.createdAt;
        if (createdAt?.toDate) {
            createdAt = createdAt.toDate().toISOString();
        } else if (!createdAt) {
            createdAt = new Date().toISOString();
        }

        let fundedAt = loan.fundedAt;
        if (fundedAt?.toDate) {
            fundedAt = fundedAt.toDate().toISOString();
        }

        const fundedAmount = loan.fundedAmount || loan.amountRequested || 0;
        const apr = loan.interestRate || loan.apr || 0;
        const totalRepayment = fundedAmount * (1 + apr / 100);
        const amountRepaid = loan.amountRepaid || 0;
        
        return {
            id: loan.id,
            borrowerName: borrower.name || "Unknown",
            borrowerId: loan.borrowerId,
            lenderId: loan.lenderId,
            amountRequested: loan.amountRequested || 0,
            amountFunded: fundedAmount,
            apr: apr,
            termMonths: loan.termMonths || 0,
            purpose: loan.purpose || "",
            description: loan.description || "",
            status: getDisplayStatus(loan.status, fundedAt),
            createdAt: createdAt,
            fundedAt: fundedAt,
            escrowId: loan.escrowId || null,
            // Progress tracking
            amountRepaid: amountRepaid,
            repaymentAmount: totalRepayment,
            // Calculated fields
            monthlyPayment: calculateMonthlyPayment(fundedAmount, apr, loan.termMonths),
            nextPaymentDue: calculateNextPaymentDue(fundedAt, loan.termMonths),
            repaymentId: loan.repaymentId || null, // Add repaymentId
        };
    });
  } catch (error) {
    console.error("Failed to fetch ongoing loans. Please try again later.");
    throw error;
  }
};

// Helper: Calculate monthly payment
const calculateMonthlyPayment = (principal, apr, months) => {
  if (!principal || !apr || !months) return 0;
  const monthlyRate = apr / 100 / 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
};

// Helper: Calculate next payment due date
const calculateNextPaymentDue = (fundedAt, termMonths) => {
  if (!fundedAt) return null;
  const fundedDate = fundedAt.toDate ? fundedAt.toDate() : new Date(fundedAt);
  const nextDue = new Date(fundedDate);
  nextDue.setMonth(nextDue.getMonth() + 1); // Next month
  return nextDue.toISOString();
};

// Helper: Get display status for InvestmentCard
const getDisplayStatus = (loanStatus, fundedAt) => {
  // Map loan status to display status
  if (loanStatus === 'funding') return 'Awaiting admin escrow approval';
  if (loanStatus === 'funded' || loanStatus === 'disbursed') return 'Money cleared for disbursement';
  if (loanStatus === 'repaying') return 'Repayment in progress';
  if (loanStatus === 'completed') return 'Loan completed';
  return 'Money cleared for disbursement'; // Default status
};

/**
 * Update loan status
 * @param {string} loanId - The ID of the loan to update
 * @param {string} status - The new status to set
 */
export const updateLoanStatus = async (loanId, status) => {
  try {
    const loanRef = doc(db, "Loans", loanId);
    await updateDoc(loanRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to update loan status. Please try again later.");
    throw error;
  }
};

/**
 * Fetch completed loans for a specific lender (for Finished tab)
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<Array>} Array of completed loan investments
 */
export const fetchCompletedLoans = async (lenderId) => {
  try {
    // Query loans with completed status for this lender
    const loansQuery = query(
      collection(db, "Loans"),
      where("lenderId", "==", lenderId),
      where("status", "==", "completed")
    );
    const loanSnapshot = await getDocs(loansQuery);
    const completedLoans = loanSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Join with users data for borrower names
    const userSnapshot = await getDocs(collection(db, "users"));
    const usersData = userSnapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id }));
    const usersMap = {};
    usersData.forEach((u) => { usersMap[u.userId] = u; });

    // Fetch repayment data for accurate calculations
    const { getRepaymentSchedule } = await import('../repayment/repaymentService.js');

    // Return formatted array with repayment data
    const loansWithRepaymentData = await Promise.all(completedLoans.map(async (loan) => {
      const borrower = usersMap[loan.borrowerId] || {};
      
      // Handle Firestore timestamp or string date
      let createdAt = loan.createdAt;
      let fundedAt = loan.fundedAt;
      let completedAt = loan.updatedAt;

      if (createdAt?.toDate) createdAt = createdAt.toDate().toISOString();
      if (fundedAt?.toDate) fundedAt = fundedAt.toDate().toISOString();
      if (completedAt?.toDate) completedAt = completedAt.toDate().toISOString();

      const fundedAmount = loan.fundedAmount || loan.amountRequested || 0;
      const apr = loan.interestRate || loan.apr || 0;
      
      // Fetch actual repayment data if available
      let actualTotalRepaid = fundedAmount;
      let actualInterestEarned = 0;
      
      if (loan.repaymentId) {
        try {
          const repaymentData = await getRepaymentSchedule(loan.repaymentId);
          if (repaymentData?.schedule) {
            actualTotalRepaid = repaymentData.schedule.reduce((sum, installment) => 
              sum + (installment.totalPayment || 0), 0
            );
            actualInterestEarned = actualTotalRepaid - fundedAmount;
          }
        } catch (error) {
          console.error('Failed to fetch repayment data for loan:', loan.id);
          // Fall back to calculated values
          actualTotalRepaid = fundedAmount * (1 + apr / 100);
          actualInterestEarned = actualTotalRepaid - fundedAmount;
        }
      } else {
        // No repayment data, use calculation
        actualTotalRepaid = fundedAmount * (1 + apr / 100);
        actualInterestEarned = actualTotalRepaid - fundedAmount;
      }
      
      return {
        id: loan.id,
        borrowerName: borrower.name || "Unknown",
        borrowerId: loan.borrowerId,
        lenderId: loan.lenderId,
        // Fields for FinishedInvestmentCard
        principalAmount: fundedAmount,
        interestEarned: actualInterestEarned,
        totalReturn: actualTotalRepaid,
        actualAPR: apr,
        loanPurpose: loan.purpose || "",
        // Additional fields
        amountFunded: fundedAmount,
        totalRepaid: actualTotalRepaid,
        apr: apr,
        termMonths: loan.termMonths || 0,
        purpose: loan.purpose || "",
        description: loan.description || "",
        status: "Completed",
        createdAt: createdAt,
        fundedAt: fundedAt,
        completedAt: completedAt,
        repaymentId: loan.repaymentId,
        totalInterestEarned: actualInterestEarned
      };
    }));

    return loansWithRepaymentData;
  } catch (error) {
    console.error("Failed to fetch completed loans. Please try again later.");
    throw error;
  }
};

/**
 * Calculate ROI growth data for the last 6 months
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<Array>} Array of monthly ROI data
 */
export const calculateROIGrowth = async (lenderId) => {
  try {
    const completedLoans = await fetchCompletedLoans(lenderId);
    
    // Get last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        loans: []
      });
    }
    
    // Group completed loans by completion month
    completedLoans.forEach(loan => {
      if (!loan.completedAt) return;
      
      const completedDate = new Date(loan.completedAt);
      const monthIndex = months.findIndex(m => 
        m.month === monthNames[completedDate.getMonth()] && 
        m.year === completedDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].loans.push(loan);
      }
    });
    
    // Calculate cumulative ROI for each month
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    
    return months.map(monthData => {
      monthData.loans.forEach(loan => {
        cumulativePrincipal += loan.principalAmount || 0;
        cumulativeInterest += loan.interestEarned || 0;
      });
      
      const roi = cumulativePrincipal > 0 
        ? ((cumulativeInterest / cumulativePrincipal) * 100)
        : 0;
      
      return {
        month: monthData.month,
        roi: parseFloat(roi.toFixed(1))
      };
    });
  } catch (error) {
    console.error("Failed to calculate ROI growth:", error);
    // Return default data with 0 ROI
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: monthNames[date.getMonth()],
        roi: 0
      });
    }
    
    return result;
  }
};

/**
 * Calculate monthly returns for the last 6 months
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<Array>} Array of monthly returns data
 */
export const calculateMonthlyReturns = async (lenderId) => {
  try {
    const completedLoans = await fetchCompletedLoans(lenderId);
    
    // Get last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        returns: 0
      });
    }
    
    // Sum returns by completion month
    completedLoans.forEach(loan => {
      if (!loan.completedAt) return;
      
      const completedDate = new Date(loan.completedAt);
      const monthIndex = months.findIndex(m => 
        m.month === monthNames[completedDate.getMonth()] && 
        m.year === completedDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].returns += (loan.interestEarned || 0);
      }
    });
    
    return months.map(m => ({
      month: m.month,
      returns: Math.round(m.returns)
    }));
  } catch (error) {
    console.error("Failed to calculate monthly returns:", error);
    // Return default data with 0 returns
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: monthNames[date.getMonth()],
        returns: 0
      });
    }
    
    return result;
  }
};

