import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './notificationService';

// Milestone thresholds
const ROI_THRESHOLDS = [10, 15, 20, 25, 30];

/**
 * Calculate portfolio ROI for a lender
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<{roi: number, totalInvested: number, totalReturns: number}>}
 */
export const calculatePortfolioROI = async (lenderId) => {
  try {
    // Get all completed loans for lender
    const loansQuery = query(
      collection(db, 'Loans'),
      where('lenderId', '==', lenderId),
      where('status', '==', 'completed')
    );
    
    const loansSnap = await getDocs(loansQuery);
    
    let totalInvested = 0;
    let totalReturns = 0;
    
    // Calculate from completed loans
    for (const loanDoc of loansSnap.docs) {
      const loan = loanDoc.data();
      const principal = loan.fundedAmount || loan.amountRequested || 0;
      
      totalInvested += principal;
      
      // Get repayment schedule to calculate actual returns
      if (loan.repaymentId) {
        const repaymentDoc = await getDoc(doc(db, 'repayments', loan.repaymentId));
        if (repaymentDoc.exists()) {
          const schedule = repaymentDoc.data().schedule || [];
          const loanReturns = schedule.reduce((sum, inst) => 
            sum + (inst.totalPayment || 0), 0
          );
          totalReturns += loanReturns;
        }
      } else {
        // Fallback: estimate using APR
        const apr = loan.interestRate || loan.apr || 0;
        totalReturns += principal * (1 + apr / 100);
      }
    }
    
    const roi = totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested) * 100 : 0;
    
    return {
      roi: Math.round(roi * 100) / 100, // Round to 2 decimals
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns)
    };
  } catch (error) {
    console.error('Error calculating portfolio ROI:', error);
    return { roi: 0, totalInvested: 0, totalReturns: 0 };
  }
};

/**
 * Get user's milestone history
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<Array<number>>} Array of reached milestones
 */
const getMilestoneHistory = async (lenderId) => {
  try {
    const docRef = doc(db, 'userPreferences', lenderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().roiMilestones || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting milestone history:', error);
    return [];
  }
};

/**
 * Save milestone to history
 * @param {string} lenderId - Lender user ID
 * @param {number} milestone - Milestone percentage
 */
const saveMilestone = async (lenderId, milestone) => {
  try {
    const docRef = doc(db, 'userPreferences', lenderId);
    const docSnap = await getDoc(docRef);
    
    const existingData = docSnap.exists() ? docSnap.data() : {};
    const milestones = existingData.roiMilestones || [];
    
    if (!milestones.includes(milestone)) {
      milestones.push(milestone);
      await setDoc(docRef, {
        ...existingData,
        roiMilestones: milestones
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving milestone:', error);
  }
};

/**
 * Check ROI and send milestone notification if threshold crossed
 * @param {string} lenderId - Lender user ID
 * @returns {Promise<{milestone: number|null, roi: number}>}
 */
export const checkAndNotifyROIMilestone = async (lenderId) => {
  try {
    // Calculate current ROI
    const { roi, totalInvested, totalReturns } = await calculatePortfolioROI(lenderId);
    
    // Get milestone history
    const reachedMilestones = await getMilestoneHistory(lenderId);
    
    // Find highest milestone that should be reached but hasn't been notified
    let newMilestone = null;
    for (const threshold of ROI_THRESHOLDS) {
      if (roi >= threshold && !reachedMilestones.includes(threshold)) {
        newMilestone = threshold;
      }
    }
    
    // Send notification for new milestone
    if (newMilestone) {
      await createNotification({
        userId: lenderId,
        type: NOTIFICATION_TYPES.ROI_MILESTONE,
        title: 'ROI Milestone Achieved!',
        body: `Congratulations! You've reached ${newMilestone}% portfolio ROI`,
        priority: NOTIFICATION_PRIORITY.HIGH,
        amount: Math.round(totalReturns - totalInvested)
      });
      
      await saveMilestone(lenderId, newMilestone);
      
      return { milestone: newMilestone, roi };
    }
    
    return { milestone: null, roi };
  } catch (error) {
    console.error('Error checking ROI milestone:', error);
    return { milestone: null, roi: 0 };
  }
};

