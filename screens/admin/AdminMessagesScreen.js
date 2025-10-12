import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import {
  subscribeToConversationsForUser,
  subscribeToMessages,
  loadMoreMessages,
  sendMessage,
  markMessagesAsRead,
  shouldShowDateSeparator,
  formatDate,
} from '../../services/chat';
import ConversationsList from '../../components/admin/ConversationsList';
import AdminChatHeader from '../../components/admin/AdminChatHeader';
import AdminMessageBubble from '../../components/admin/AdminMessageBubble';
import AdminChatComposer from '../../components/admin/AdminChatComposer';
import ChatEmptyState from '../../components/admin/ChatEmptyState';
import ErrorMessage from '../../components/admin/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLE = 'admin';

const DateSeparator = ({ date }) => (
  <View style={styles.dateSeparator}>
    <View style={styles.datePill}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  </View>
);

const EmptyChatState = () => <ChatEmptyState type="messages" />;

const AdminMessagesScreen = () => {
  const { user } = useAuth();
  const adminId = user?.uid;
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const flatListRef = useRef(null);
  const unsubscribeMessagesRef = useRef(null);

  // Subscribe to all conversations
  useEffect(() => {
    if (!adminId) return;

    const unsubscribe = subscribeToConversationsForUser(adminId, ADMIN_ROLE, (convs) => {
      setConversations(convs);
      setIsLoading(false);
      setError(null); // Clear any previous errors
    }, (error) => {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations. Please check your connection.');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [adminId]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !adminId) {
      setMessages([]);
      return;
    }

    unsubscribeMessagesRef.current = subscribeToMessages(
      selectedConversation.conversationId,
      (msgs) => {
        setMessages(msgs);
        // Auto-scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );

    // Mark as read
    markMessagesAsRead(selectedConversation.conversationId, adminId).catch(console.error);

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [selectedConversation, adminId]);

  // Mark as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedConversation && adminId) {
        markMessagesAsRead(selectedConversation.conversationId, adminId).catch(console.error);
      }
    }, [selectedConversation, adminId])
  );

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !selectedConversation || !adminId) return;

    setIsSending(true);
    const text = messageText.trim();
    setMessageText('');
    setError(null);

    try {
      await sendMessage(selectedConversation.conversationId, adminId, ADMIN_ROLE, text);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please check your connection and try again.');
      setMessageText(text);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSending(false);
    }
  };

  const handleLenderInfo = () => {
    Alert.alert('Lender Info', `Lender ID: ${selectedConversation?.participants?.lenderId}`);
  };

  const handleRetry = () => {
    if (!adminId) return;
    
    setError(null);
    setRetryCount(prev => prev + 1);
    // Trigger a refresh of conversations
    const unsubscribe = subscribeToConversationsForUser(adminId, ADMIN_ROLE, (convs) => {
      setConversations(convs);
      setError(null);
    }, (error) => {
      setError('Failed to load conversations. Please check your connection.');
    });
    setTimeout(() => unsubscribe(), 1000);
  };

  const handleRefresh = async () => {
    if (!selectedConversation || loadingMore) return;
    
    setRefreshing(true);
    try {
      const result = await loadMoreMessages(
        selectedConversation.conversationId,
        lastMessageTimestamp,
        50
      );
      
      if (result.messages.length > 0) {
        setMessages(prev => [...result.messages, ...prev]);
        setLastMessageTimestamp(result.lastMessage?.timestamp);
        setHasMoreMessages(result.hasMore);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const showDateSeparator = shouldShowDateSeparator(item, messages[index - 1]);
    const isNewMessage = index === messages.length - 1;
    
    return (
      <View>
        {showDateSeparator && <DateSeparator date={formatDate(item.timestamp)} />}
        <AdminMessageBubble message={item} isNewMessage={isNewMessage} />
      </View>
    );
  };

  // Mobile: Show either list or chat
  if (!selectedConversation) {
    return (
      <View style={styles.container}>
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
            showRetry={retryCount < 3}
          />
        )}
        <ConversationsList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedId={selectedConversation?.id}
          isLoading={isLoading}
          adminId={adminId}
          unreadCount={conversations.reduce((sum, conv) => {
            const adminUnreadCount = conv.unreadCount?.[adminId] || 0;
            const hasAdmin = conv.participantIds?.includes(adminId);
            return hasAdmin ? sum + adminUnreadCount : sum;
          }, 0)}
        />
      </View>
    );
  }

  // Chat view
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <AdminChatHeader
        lenderId={selectedConversation.participants?.lenderId}
        onBack={handleBackToList}
        onInfo={handleLenderInfo}
      />

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          showRetry={retryCount < 3}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || `message-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyChatState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.blueGreen}
            colors={[colors.blueGreen]}
          />
        }
        onScrollToTop={() => {
          if (hasMoreMessages && !loadingMore) {
            handleRefresh();
          }
        }}
      />

      <AdminChatComposer
        value={messageText}
        onChangeText={setMessageText}
        onSend={handleSendMessage}
        isSending={isSending}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  datePill: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
});

export default AdminMessagesScreen;

