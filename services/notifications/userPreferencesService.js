import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { NOTIFICATION_TYPES } from './notificationService';

const USER_PREFERENCES_COLLECTION = 'userPreferences';

/**
 * Get default notification preferences (all enabled)
 */
const getDefaultPreferences = () => {
  const preferences = {};
  Object.keys(NOTIFICATION_TYPES).forEach(type => {
    preferences[type] = true;
  });
  return preferences;
};

/**
 * Get user notification preferences
 * @param {string} userId - User ID
 * @returns {Promise<object>} Notification preferences object
 */
export const getUserPreferences = async (userId) => {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data().notificationPreferences || getDefaultPreferences();
  }
  
  return getDefaultPreferences();
};

/**
 * Save user notification preferences
 * @param {string} userId - User ID
 * @param {object} preferences - Notification preferences object
 */
export const saveUserPreferences = async (userId, preferences) => {
  const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    await updateDoc(docRef, { notificationPreferences: preferences });
  } else {
    await setDoc(docRef, { notificationPreferences: preferences });
  }
  
  return preferences;
};

/**
 * Check if user has notification type enabled
 * @param {string} userId - User ID
 * @param {string} notificationType - Notification type from NOTIFICATION_TYPES
 * @returns {Promise<boolean>}
 */
export const isNotificationEnabled = async (userId, notificationType) => {
  const preferences = await getUserPreferences(userId);
  return preferences[notificationType] !== false;
};

