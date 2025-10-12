import { db } from "../firebaseConfig";
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { generateRepaymentSchedule } from "./repaymentScheduleGenerator";
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from "../notifications/notificationService";
import { checkAndNotifyROIMilestone } from "../notifications/roiMilestoneService";

/**
 * Service for managing repayment schedules
 * Follows Interface Segregation - only handles repayment-related operations
 */

/**
 * Create a new repayment schedule
 * @param {Object} loanData - Loan data for repayment schedule
 * @param {string} loanData.loanId - ID of the loan
 * @param {number} loanData.loanAmount - Principal loan amount
 * @param {number} loanData.annualInterestRate - Annual interest rate (APR)
 * @param {number} loanData.termMonths - Loan term in months
 * @param {string} loanData.startDate - Start date for repayments (ISO string)
 * @param {string} loanData.borrowerId - ID of the borrower
 * @param {string} loanData.lenderId - ID of the lender
 * @returns {Promise<string>} ID of the created repayment document
 */
export const createRepaymentSchedule = async (loanData) => {
  try {
    // Generate repayment schedule
    const schedule = generateRepaymentSchedule({
      loanAmount: loanData.loanAmount,
      annualInterestRate: loanData.annualInterestRate,
      termMonths: loanData.termMonths,
      startDate: loanData.startDate,
      borrowerId: loanData.borrowerId,
      lenderId: loanData.lenderId
    });

    // Create repayment document
    const repaymentDoc = {
      loanId: loanData.loanId,
      borrowerId: loanData.borrowerId,
      lenderId: loanData.lenderId,
      schedule: schedule,
      totalAmount: loanData.loanAmount,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, "repayments"), repaymentDoc);

    // Update loan document with repaymentId
    await setDoc(doc(db, "Loans", loanData.loanId), {
      repaymentId: docRef.id
    }, { merge: true });

    return docRef.id;
  } catch (error) {
    console.error("Error creating repayment schedule:", error);
    throw error;
  }
};

/**
 * Get a repayment schedule by ID
 * @param {string} repaymentId - ID of the repayment document
 * @returns {Promise<Object>} Repayment schedule data
 */
export const getRepaymentSchedule = async (repaymentId) => {
  try {
    const docRef = doc(db, "repayments", repaymentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Repayment schedule not found");
    }

    const data = docSnap.data();
    
    if (!data.schedule || !Array.isArray(data.schedule)) {
      throw new Error("Invalid repayment schedule format");
    }

    // Check if all payments are marked as paid BEFORE mapping status
    // This checks the raw Firestore data where status is lowercase 'paid'
    if (areAllInstallmentsPaid(data.schedule) && data.loanId) {
      await updateLoanStatusIfComplete(data.loanId, data.schedule);
    }

    return {
      id: docSnap.id,
      ...data,
      schedule: data.schedule.map(installment => ({
        dueDate: installment.dueDate,
        totalPayment: installment.totalPayment,
        status: mapRepaymentStatus(installment.status, installment.dueDate),
        paidDate: installment.paidDate || null,
        principalPayment: installment.principalPayment,
        interestPayment: installment.interestPayment,
        remainingBalance: installment.remainingBalance,
        installmentNumber: installment.installmentNumber
      }))
    };
  } catch (error) {
    console.error("Error fetching repayment schedule:", error);
    throw error;
  }
};

// Helper function to map repayment status to display status
// Helper function to check if all installments are paid
const areAllInstallmentsPaid = (schedule) => {
  return schedule.every(installment => installment.status.toLowerCase() === 'paid');
};

// Helper function to update loan status when all payments are complete
const updateLoanStatusIfComplete = async (loanId, schedule) => {
  if (!areAllInstallmentsPaid(schedule)) return;
  
  try {
    const { updateLoanStatus } = await import('../lender/lenderLoanService.js');
    await updateLoanStatus(loanId, 'completed');
  } catch (error) {
    console.error('Error updating loan status:', error);
    // Don't throw the error as this is a side effect
  }
};

/**
 * Check and update loan status to completed if all payments are marked as paid
 * This function should be called by admin after marking a payment as paid
 * @param {string} repaymentId - ID of the repayment document
 * @returns {Promise<boolean>} True if loan was marked as completed, false otherwise
 */
export const checkAndCompleteLoan = async (repaymentId) => {
  try {
    const docRef = doc(db, "repayments", repaymentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Repayment schedule not found");
    }

    const data = docSnap.data();
    
    if (!data.schedule || !Array.isArray(data.schedule) || !data.loanId) {
      return false;
    }

    // Check if all payments are marked as paid
    if (areAllInstallmentsPaid(data.schedule)) {
      await updateLoanStatusIfComplete(data.loanId, data.schedule);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking loan completion:", error);
    return false;
  }
};

const mapRepaymentStatus = (status, dueDate) => {
  // Convert to lowercase for consistent comparison
  const normalizedStatus = status.toLowerCase();
  
  // If already paid, keep it as paid
  if (normalizedStatus === 'paid') return 'Paid';
  
  // For pending payments, check the due date
  const now = new Date();
  const dueDateTime = new Date(dueDate);
  const daysDiff = Math.ceil((dueDateTime - now) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return 'Overdue';
  } else if (daysDiff <= 7) {
    return 'Due soon';
  } else {
    return 'Pending';
  }
};

/**
 * Mark an installment as paid and send notification to lender
 * @param {string} repaymentId - ID of the repayment document
 * @param {number} installmentNumber - Installment number to mark as paid
 * @returns {Promise<{success: boolean, loanCompleted: boolean}>}
 */
export const markInstallmentAsPaid = async (repaymentId, installmentNumber) => {
  try {
    const docRef = doc(db, "repayments", repaymentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Repayment schedule not found");
    }

    const data = docSnap.data();
    const schedule = data.schedule;
    
    // Find and update the installment
    const installmentIndex = schedule.findIndex(
      inst => inst.installmentNumber === installmentNumber
    );
    
    if (installmentIndex === -1) {
      throw new Error("Installment not found");
    }

    const installment = schedule[installmentIndex];
    
    // Mark as paid
    schedule[installmentIndex] = {
      ...installment,
      status: 'paid',
      paidDate: new Date().toISOString()
    };

    // Update Firestore
    await updateDoc(docRef, { schedule });

    // Send PAYMENT_RECEIVED notification to lender
    try {
      const paymentStatus = installment.dueDate 
        ? new Date(installment.dueDate) >= new Date() ? 'On Time' : 'Late'
        : 'On Time';
      
      await createNotification({
        userId: data.lenderId,
        type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
        title: 'Payment Received',
        body: `Payment of LKR ${Math.round(installment.totalPayment).toLocaleString()} received from loan #${data.loanId} (${paymentStatus})`,
        priority: NOTIFICATION_PRIORITY.HIGH,
        loanId: data.loanId,
        amount: Math.round(installment.totalPayment)
      });
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      // Don't throw - payment update succeeded
    }

    // Check if all installments are now paid
    const allPaid = schedule.every(inst => inst.status.toLowerCase() === 'paid');
    
    if (allPaid) {
      await handleLoanCompletion(repaymentId, data);
      return { success: true, loanCompleted: true };
    }

    return { success: true, loanCompleted: false };
  } catch (error) {
    console.error("Error marking installment as paid:", error);
    throw error;
  }
};

/**
 * Handle loan completion - update status and send notification
 * @param {string} repaymentId - ID of the repayment document
 * @param {Object} repaymentData - Repayment data
 */
const handleLoanCompletion = async (repaymentId, repaymentData) => {
  try {
    const { loanId, lenderId, schedule } = repaymentData;
    
    // Update loan status to completed
    await updateLoanStatusIfComplete(loanId, schedule);

    // Get loan details for total return calculation
    const loanRef = doc(db, "Loans", loanId);
    const loanDoc = await getDoc(loanRef);
    
    if (!loanDoc.exists()) {
      console.error('Loan not found for completion notification');
      return;
    }

    const loanData = loanDoc.data();
    const principal = loanData.fundedAmount || loanData.amountRequested || 0;
    
    // Calculate totals from schedule
    const totalReturn = schedule.reduce((sum, inst) => sum + (inst.totalPayment || 0), 0);
    const interestEarned = totalReturn - principal;

    // Send LOAN_COMPLETED notification to lender
    try {
      await createNotification({
        userId: lenderId,
        type: NOTIFICATION_TYPES.LOAN_COMPLETED,
        title: 'Loan Completed',
        body: `Loan #${loanId} completed! Total return: LKR ${Math.round(totalReturn).toLocaleString()} (LKR ${Math.round(interestEarned).toLocaleString()} interest earned)`,
        priority: NOTIFICATION_PRIORITY.HIGH,
        loanId,
        amount: Math.round(totalReturn)
      });
    } catch (error) {
      console.error('Failed to send loan completion notification:', error);
      // Don't throw - loan status update succeeded
    }

    // Check for ROI milestone after loan completion
    try {
      await checkAndNotifyROIMilestone(lenderId);
    } catch (error) {
      console.error('Failed to check ROI milestone:', error);
      // Don't throw - main notifications succeeded
    }
  } catch (error) {
    console.error('Error handling loan completion:', error);
    // Don't throw - this is a side effect
  }
};

/**
 * Check for overdue payments and send admin notifications
 * Can be triggered daily or when admin views RepaymentMonitoringScreen
 * @returns {Promise<number>} Number of overdue notifications sent
 */
export const checkOverduePayments = async () => {
  try {
    const repaymentsSnapshot = await getDocs(collection(db, "repayments"));
    const today = new Date();
    let notificationsSent = 0;

    for (const repaymentDoc of repaymentsSnapshot.docs) {
      const repaymentData = repaymentDoc.data();
      const { schedule, loanId } = repaymentData;

      if (!schedule || !Array.isArray(schedule)) continue;

      for (const installment of schedule) {
        const isPending = installment.status?.toLowerCase() === 'pending';
        const dueDate = new Date(installment.dueDate);
        const isOverdue = dueDate < today;

        if (isPending && isOverdue) {
          const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

          await createNotification({
            userId: 'ADMIN001',
            type: NOTIFICATION_TYPES.PAYMENT_OVERDUE,
            title: 'Payment Overdue',
            body: `Loan #${loanId} payment overdue by ${daysLate} days`,
            priority: NOTIFICATION_PRIORITY.MEDIUM,
            loanId,
            amount: installment.totalPayment
          });

          notificationsSent++;
        }
      }
    }

    return notificationsSent;
  } catch (error) {
    console.error('Error checking overdue payments:', error);
    return 0;
  }
};
