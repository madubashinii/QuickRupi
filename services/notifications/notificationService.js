import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query, 
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// ============ CONSTANTS ============

const NOTIFICATIONS_COLLECTION = 'notifications';

export const NOTIFICATION_TYPES = {
  FUNDING_CONFIRMED: 'FUNDING_CONFIRMED',
  ESCROW_APPROVED: 'ESCROW_APPROVED',
  LOAN_DISBURSED: 'LOAN_DISBURSED',
  LOAN_ACTIVE: 'LOAN_ACTIVE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  LOAN_COMPLETED: 'LOAN_COMPLETED',
  MONTHLY_RETURNS: 'MONTHLY_RETURNS',
  ROI_MILESTONE: 'ROI_MILESTONE',
  FUNDS_ADDED: 'FUNDS_ADDED',
  WITHDRAWAL_PROCESSED: 'WITHDRAWAL_PROCESSED'
};

export const NOTIFICATION_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

// ============ SCHEMA OVERVIEW ============
/**
 * Notification Schema:
 * {
 *   notificationId: string (auto-generated),
 *   userId: string (e.g., "L001"),
 *   type: enum (see NOTIFICATION_TYPES),
 *   title: string,
 *   body: string,
 *   isRead: boolean,
 *   priority: enum ("HIGH" | "MEDIUM" | "LOW"),
 *   loanId: string | null (optional),
 *   amount: number | null (optional),
 *   createdAt: Firestore timestamp,
 *   readAt: Firestore timestamp | null
 * }
 */

// ============ VALIDATION ============

/**
 * Validate notification data
 * @param {object} data - Notification data object
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateNotificationData = (data) => {
  if (!data?.userId) {
    return { valid: false, error: 'User ID required' };
  }
  
  if (!data?.type || !Object.values(NOTIFICATION_TYPES).includes(data.type)) {
    return { valid: false, error: 'Invalid notification type' };
  }
  
  if (!data?.title || typeof data.title !== 'string') {
    return { valid: false, error: 'Title required' };
  }
  
  if (!data?.body || typeof data.body !== 'string') {
    return { valid: false, error: 'Body required' };
  }
  
  return { valid: true };
};

// ============ CORE FUNCTIONS ============

/**
 * Create a new notification
 */
export const createNotification = async (notificationData) => {
  const validation = validateNotificationData(notificationData);
  if (!validation.valid) throw new Error(validation.error);

  const notification = {
    userId: notificationData.userId,
    type: notificationData.type,
    title: notificationData.title,
    body: notificationData.body,
    isRead: false,
    priority: notificationData.priority || NOTIFICATION_PRIORITY.MEDIUM,
    loanId: notificationData.loanId || null,
    amount: notificationData.amount || null,
    createdAt: serverTimestamp(),
    readAt: null
  };

  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
  return { notificationId: docRef.id, ...notification };
};

/**
 * Get notifications by userId
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters { isRead, limitCount }
 */
export const getNotificationsByUserId = async (userId, filters = {}) => {
  const { isRead = null, limitCount = 50 } = filters;
  
  let q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (isRead !== null) {
    q = query(q, where('isRead', '==', isRead));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ notificationId: doc.id, ...doc.data() }));
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (notificationId) => {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { notificationId: docSnap.id, ...docSnap.data() } : null;
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(docRef, { 
    isRead: true,
    readAt: serverTimestamp()
  });
  
  return { notificationId, isRead: true };
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 */
export const markAllNotificationsAsRead = async (userId) => {
  const unreadNotifications = await getNotificationsByUserId(userId, { isRead: false });
  
  const updatePromises = unreadNotifications.map(notification => 
    markNotificationAsRead(notification.notificationId)
  );
  
  await Promise.all(updatePromises);
  return { count: unreadNotifications.length };
};

/**
 * Subscribe to real-time user notifications
 * @param {string} userId - User ID
 * @param {function} callback - Callback function receiving notifications array
 * @param {number} limitCount - Number of notifications to fetch (default: 50)
 * @returns unsubscribe function
 */
export const subscribeToUserNotifications = (userId, callback, limitCount = 50) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ 
        notificationId: doc.id, 
        ...doc.data() 
      }));
      callback(notifications);
    },
    (error) => {
      console.error('Notification subscription error:', error);
      callback([]);
    }
  );
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async (userId) => {
  const unreadNotifications = await getNotificationsByUserId(userId, { isRead: false });
  return unreadNotifications.length;
};

/**
 * Subscribe to unread notification count
 * @param {string} userId - User ID
 * @param {function} callback - Callback function receiving count
 * @returns unsubscribe function
 */
export const subscribeToUnreadCount = (userId, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error('Unread count subscription error:', error);
      callback(0);
    }
  );
};

