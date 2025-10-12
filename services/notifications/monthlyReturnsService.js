import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './notificationService';

/**
 * Calculate monthly returns for a lender
 * @param {string} lenderId - Lender user ID
 * @param {Date} startDate - Start of month
 * @param {Date} endDate - End of month
 * @returns {Promise<{totalReturns: number, loanCount: number}>}
 */
const calculateMonthlyReturns = async (lenderId, startDate, endDate) => {
  try {
    // Get all repayments for the lender
    const repaymentsQuery = query(
      collection(db, 'repayments'),
      where('lenderId', '==', lenderId)
    );
    
    const repaymentsSnap = await getDocs(repaymentsQuery);
    
    let totalReturns = 0;
    const loansWithPayments = new Set();
    
    // Calculate returns from paid installments in the date range
    repaymentsSnap.docs.forEach(doc => {
      const repayment = doc.data();
      const schedule = repayment.schedule || [];
      
      schedule.forEach(installment => {
        if (installment.status?.toLowerCase() === 'paid' && installment.paidDate) {
          const paidDate = new Date(installment.paidDate);
          
          if (paidDate >= startDate && paidDate <= endDate) {
            // Sum only interest portion for "returns" (not principal)
            totalReturns += installment.interestPayment || 0;
            loansWithPayments.add(repayment.loanId);
          }
        }
      });
    });
    
    return {
      totalReturns: Math.round(totalReturns),
      loanCount: loansWithPayments.size
    };
  } catch (error) {
    console.error('Error calculating monthly returns:', error);
    return { totalReturns: 0, loanCount: 0 };
  }
};

/**
 * Send monthly returns notification to a lender
 * @param {string} lenderId - Lender user ID
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12)
 */
export const sendMonthlyReturnsNotification = async (lenderId, year, month) => {
  try {
    // Calculate date range for previous month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Calculate returns
    const { totalReturns, loanCount } = await calculateMonthlyReturns(
      lenderId,
      startDate,
      endDate
    );
    
    // Only send notification if there were returns
    if (totalReturns > 0) {
      const monthName = startDate.toLocaleDateString('en-US', { month: 'long' });
      
      await createNotification({
        userId: lenderId,
        type: NOTIFICATION_TYPES.MONTHLY_RETURNS,
        title: 'Monthly Returns Summary',
        body: `You earned LKR ${totalReturns.toLocaleString()} in interest this month across ${loanCount} loan${loanCount !== 1 ? 's' : ''}`,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        amount: totalReturns
      });
      
      return { success: true, totalReturns, loanCount };
    }
    
    return { success: false, message: 'No returns for this month' };
  } catch (error) {
    console.error('Error sending monthly returns notification:', error);
    throw error;
  }
};

/**
 * Send monthly returns notifications to all active lenders
 * Call this function on the 1st of each month
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12) - the month that just ended
 */
export const sendMonthlyReturnsToAllLenders = async (year, month) => {
  try {
    // Get all unique lenders from repayments collection
    const repaymentsSnap = await getDocs(collection(db, 'repayments'));
    const lenderIds = new Set();
    
    repaymentsSnap.docs.forEach(doc => {
      const lenderId = doc.data().lenderId;
      if (lenderId) lenderIds.add(lenderId);
    });
    
    // Send notifications to all lenders
    const results = await Promise.allSettled(
      Array.from(lenderIds).map(lenderId => 
        sendMonthlyReturnsNotification(lenderId, year, month)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: true,
      totalLenders: lenderIds.size,
      notificationsSent: successful,
      failed
    };
  } catch (error) {
    console.error('Error sending monthly returns to all lenders:', error);
    throw error;
  }
};

/**
 * Helper function to run monthly returns for previous month
 * Call this on the 1st of each month
 */
export const runMonthlyReturns = async () => {
  const today = new Date();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  return await sendMonthlyReturnsToAllLenders(
    previousMonth.getFullYear(),
    previousMonth.getMonth() + 1 // JavaScript months are 0-indexed
  );
};

