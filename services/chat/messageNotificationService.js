import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { sendNotification } from '../notifications/notificationService';

/**
 * Get user name and role from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<{name: string, role: string}>}
 */
const getUserInfo = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const name = userData.fullName || userData.name || 'User';
      const role = userData.role || 'user';
      return { name, role };
    }
    return { name: 'User', role: 'user' };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { name: 'User', role: 'user' };
  }
};

/**
 * Send push notification for new chat messages
 */
export const sendMessageNotification = async (recipientId, senderId, messageText, conversationId) => {
  try {
    // Get sender info from Firestore
    const { name, role } = await getUserInfo(senderId);
    const senderName = role === 'admin' ? 'Admin' : name;
    
    // Truncate message for notification
    const preview = messageText.length > 50 
      ? messageText.substring(0, 50) + '...' 
      : messageText;

    const notification = {
      userId: recipientId,
      type: 'message',
      title: `New message from ${senderName}`,
      body: preview,
      data: {
        conversationId,
        senderId,
        messageType: 'chat'
      }
    };

    await sendNotification(notification);
  } catch (error) {
    console.error('Failed to send message notification:', error);
  }
};

/**
 * Send system message notification
 */
export const sendSystemMessageNotification = async (recipientId, systemMessage, metadata) => {
  try {
    const notification = {
      userId: recipientId,
      type: 'system_message',
      title: 'System Update',
      body: systemMessage,
      data: {
        messageType: 'system',
        metadata
      }
    };

    await sendNotification(notification);
  } catch (error) {
    console.error('Failed to send system message notification:', error);
  }
};
