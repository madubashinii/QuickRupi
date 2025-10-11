import { sendNotification } from '../notifications/notificationService';

/**
 * Send push notification for new chat messages
 */
export const sendMessageNotification = async (recipientId, senderId, messageText, conversationId) => {
  try {
    // Determine sender name
    const senderName = senderId === 'ADMIN001' ? 'Admin' : `Lender ${senderId}`;
    
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
