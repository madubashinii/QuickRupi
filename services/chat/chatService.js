import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as queryLimit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { conversationCache } from './chatCache';

// Error handling constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages'
};

// Retry utility with exponential backoff
const retryWithBackoff = async (operation, maxAttempts = MAX_RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxAttempts) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Generate conversation ID
export const generateConversationId = (lenderId, adminId = 'ADMIN001') => 
  `CONV_${lenderId}_${adminId}`;

// Create new conversation
export const createConversation = async (lenderId, adminId = 'ADMIN001') => {
  try {
    const conversationId = generateConversationId(lenderId, adminId);
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    
    const conversation = {
      conversationId,
      participants: { lenderId, adminId },
      participantIds: [lenderId, adminId],
      lastMessage: null,
      unreadCount: { [lenderId]: 0, [adminId]: 0 },
      typingStatus: {
        [lenderId]: { isTyping: false, lastUpdated: serverTimestamp() },
        [adminId]: { isTyping: false, lastUpdated: serverTimestamp() }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(conversationRef, conversation);
    return { id: conversationId, ...conversation };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation. Please check your connection and try again.');
  }
};

// Get or create conversation
export const getOrCreateConversation = async (lenderId, adminId = 'ADMIN001') => {
  const conversationId = generateConversationId(lenderId, adminId);
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  
  const conversationSnap = await getDoc(conversationRef);
  
  if (conversationSnap.exists()) {
    return { id: conversationSnap.id, ...conversationSnap.data() };
  }
  
  return createConversation(lenderId, adminId);
};

// Send message with retry logic
export const sendMessage = async (conversationId, senderId, senderRole, text, type = 'text', metadata = null) => {
  if (!text?.trim()) {
    throw new Error('Message text is required');
  }

  return retryWithBackoff(async () => {
    const messageRef = collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES);
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    
    const message = {
      conversationId,
      text: text.trim(),
      senderId,
      senderRole,
      recipientId: senderRole === 'lender' ? 'ADMIN001' : senderId,
      type,
      status: 'sent',
      timestamp: serverTimestamp(),
      deliveredAt: null,
      readAt: null,
      read: false,
      metadata: metadata || null
    };
    
    const docRef = await addDoc(messageRef, message);
    
    // Update conversation
    const recipientId = senderRole === 'lender' ? 'ADMIN001' : senderId;
    await updateDoc(conversationRef, {
      lastMessage: {
        text: text.trim(),
        senderId,
        timestamp: serverTimestamp(),
        read: false
      },
      [`unreadCount.${recipientId}`]: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Stop typing indicator
    await updateTypingStatus(conversationId, senderId, false);
    
    return { id: docRef.id, ...message };
  });
};

// Send system message
export const sendSystemMessage = async (conversationId, text, metadata = null) => {
  return sendMessage(conversationId, 'SYSTEM', 'system', text, 'system', metadata);
};

// Subscribe to conversation metadata
export const subscribeToConversation = (conversationId, callback) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  
  return onSnapshot(conversationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

// Subscribe to messages with pagination
export const subscribeToMessages = (conversationId, callback, limit = 50) => {
  const messagesRef = collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES);
  
  const constraints = [
    orderBy('timestamp', 'desc'),  // Get newest first for pagination
    queryLimit(limit)
  ];
  
  const q = query(messagesRef, ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })).reverse(); // Reverse to show oldest first
    
    callback(messages);
  });
};

// Load more messages (pagination)
export const loadMoreMessages = async (conversationId, lastMessageTimestamp, limit = 50) => {
  const messagesRef = collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES);
  
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    queryLimit(limit + 1), // Load one extra to check if more exist
    ...(lastMessageTimestamp ? [where('timestamp', '<', lastMessageTimestamp)] : [])
  );
  
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date()
  }));
  
  const hasMore = messages.length > limit;
  const resultMessages = hasMore ? messages.slice(0, limit) : messages;
  
  return {
    messages: resultMessages.reverse(), // Oldest first
    hasMore,
    lastMessage: resultMessages[resultMessages.length - 1]
  };
};

// Mark messages as read with error handling
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesRef = collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES);
    const q = query(messagesRef, where('recipientId', '==', userId), where('read', '==', false));
    
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { 
        read: true, 
        readAt: serverTimestamp(),
        status: 'read'
      })
    );
    
    await Promise.all(updates);
    
    // Reset unread count
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    // Don't throw error for read operations - just log
  }
};

// Update typing status
export const updateTypingStatus = async (conversationId, userId, isTyping) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  await updateDoc(conversationRef, {
    [`typingStatus.${userId}`]: {
      isTyping,
      lastUpdated: serverTimestamp()
    }
  });
};

// Mark message as delivered
export const markMessageDelivered = async (conversationId, messageId) => {
  const messageRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES, messageId);
  await updateDoc(messageRef, {
    status: 'delivered',
    deliveredAt: serverTimestamp()
  });
};

// Get conversations for user (with caching)
export const getConversationsForUser = async (userId, userRole) => {
  // Try cache first
  const cached = conversationCache.get(`conversations_${userId}`);
  if (cached) {
    return cached;
  }

  const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
  const q = query(
    conversationsRef, 
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const conversations = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Cache the result
  conversationCache.set(`conversations_${userId}`, conversations);
  
  return conversations;
};

// Subscribe to conversations for user (real-time with caching)
export const subscribeToConversationsForUser = (userId, userRole, callback) => {
  const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
  const q = query(
    conversationsRef, 
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Update cache
    conversationCache.set(`conversations_${userId}`, conversations);
    
    callback(conversations);
  });
};

// Get unread count for conversation
export const getUnreadCount = async (conversationId, userId) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  const conversationSnap = await getDoc(conversationRef);
  
  if (!conversationSnap.exists()) return 0;
  
  const data = conversationSnap.data();
  return data.unreadCount?.[userId] || 0;
};

// Get typing status
export const getTypingStatus = async (conversationId) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  const conversationSnap = await getDoc(conversationRef);
  
  if (!conversationSnap.exists()) return null;
  
  const data = conversationSnap.data();
  return data.typingStatus || {};
};

// Subscribe to typing status
export const subscribeToTypingStatus = (conversationId, callback) => {
  const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
  
  return onSnapshot(conversationRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.typingStatus || {});
    }
  });
};

