import { db } from "../firebaseConfig";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { generateRepaymentSchedule } from "./repaymentScheduleGenerator";

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
