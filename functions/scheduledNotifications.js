/**
 * Firebase Cloud Functions for Scheduled Notifications
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Calculate monthly returns for a lender
 */
const calculateMonthlyReturns = async (lenderId, startDate, endDate) => {
  const repaymentsSnap = await db.collection('repayments')
    .where('lenderId', '==', lenderId)
    .get();
  
  let totalReturns = 0;
  const loansWithPayments = new Set();
  
  repaymentsSnap.docs.forEach(doc => {
    const schedule = doc.data().schedule || [];
    
    schedule.forEach(installment => {
      if (installment.status?.toLowerCase() === 'paid' && installment.paidDate) {
        const paidDate = new Date(installment.paidDate);
        
        if (paidDate >= startDate && paidDate <= endDate) {
          totalReturns += installment.interestPayment || 0;
          loansWithPayments.add(doc.data().loanId);
        }
      }
    });
  });
  
  return { totalReturns: Math.round(totalReturns), loanCount: loansWithPayments.size };
};

/**
 * Create notification in Firestore
 */
const createNotification = async (notification) => {
  await db.collection('notifications').add({
    ...notification,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false,
    readAt: null
  });
};

/**
 * Scheduled function: Run on 1st of each month at 9 AM
 * Cron format: "0 9 1 * *" = At 09:00 on day-of-month 1
 */
exports.sendMonthlyReturns = functions.pubsub
  .schedule('0 9 1 * *')
  .timeZone('Asia/Colombo') // Sri Lanka timezone
  .onRun(async (context) => {
    console.log('Running monthly returns notification...');
    
    try {
      // Calculate previous month
      const today = new Date();
      const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const year = previousMonth.getFullYear();
      const month = previousMonth.getMonth() + 1;
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      // Get all unique lenders
      const repaymentsSnap = await db.collection('repayments').get();
      const lenderIds = new Set();
      
      repaymentsSnap.docs.forEach(doc => {
        const lenderId = doc.data().lenderId;
        if (lenderId) lenderIds.add(lenderId);
      });
      
      console.log(`Found ${lenderIds.size} lenders`);
      
      // Send notifications
      let sent = 0;
      for (const lenderId of lenderIds) {
        const { totalReturns, loanCount } = await calculateMonthlyReturns(
          lenderId,
          startDate,
          endDate
        );
        
        if (totalReturns > 0) {
          await createNotification({
            userId: lenderId,
            type: 'MONTHLY_RETURNS',
            title: 'Monthly Returns Summary',
            body: `You earned LKR ${totalReturns.toLocaleString()} in interest this month across ${loanCount} loan${loanCount !== 1 ? 's' : ''}`,
            priority: 'MEDIUM',
            amount: totalReturns
          });
          sent++;
        }
      }
      
      console.log(`Monthly returns complete: ${sent} notifications sent`);
      return { success: true, sent };
    } catch (error) {
      console.error('Error in monthly returns:', error);
      throw error;
    }
  });

