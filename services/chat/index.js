// Chat Service
export {
  generateConversationId,
  createConversation,
  getOrCreateConversation,
  sendMessage,
  sendSystemMessage,
  subscribeToConversation,
  subscribeToMessages,
  loadMoreMessages,
  markMessagesAsRead,
  markMessageDelivered,
  updateTypingStatus,
  getTypingStatus,
  subscribeToTypingStatus,
  getConversationsForUser,
  subscribeToConversationsForUser,
  getUnreadCount
} from './chatService';

// Chat Utils
export {
  formatMessageForDisplay,
  groupMessagesByDate,
  formatTime,
  formatDate,
  shouldShowDateSeparator,
  validateMessageText
} from './chatUtils';

// Message Notifications
export {
  sendMessageNotification,
  sendSystemMessageNotification
} from './messageNotificationService';

// Performance & Caching
export {
  getCachedConversations,
  setCachedConversations,
  clearConversationCache
} from './chatCache';

export {
  messageBatcher,
  sendBatchedMessage
} from './messageBatcher';

