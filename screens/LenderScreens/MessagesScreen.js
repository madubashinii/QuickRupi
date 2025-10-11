import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import {
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  formatTime,
  formatDate,
  shouldShowDateSeparator,
} from '../../services/chat';

// Constants
const USER_ID = 'L001'; // TODO: Replace with actual authenticated user ID
const USER_ROLE = 'lender';
const SCROLL_DELAY = 100;
const MAX_MESSAGE_LENGTH = 500;

// Components
const ConnectionStatus = ({ isConnected }) => {
  if (isConnected) return null;
  
  return (
    <View style={styles.connectionStatus}>
      <Ionicons name="cloud-offline-outline" size={14} color={colors.white} />
      <Text style={styles.connectionStatusText}>Connecting...</Text>
    </View>
  );
};

const Header = ({ onBack, isConnected, onInfo }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color={colors.white} />
    </TouchableOpacity>
    <View style={styles.headerCenter}>
      <View style={styles.adminAvatar}>
        <Ionicons name="headset" size={20} color={colors.white} />
      </View>
      <View>
        <Text style={styles.headerTitle}>Support Team</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isConnected && styles.onlineDot]} />
          <Text style={styles.statusText}>{isConnected ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
    </View>
    <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
      <Ionicons name="information-circle-outline" size={24} color={colors.white} />
    </TouchableOpacity>
  </View>
);

const DateSeparator = ({ date }) => (
  <View style={styles.dateSeparator}>
    <View style={styles.datePill}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  </View>
);

const MessageBubble = ({ message, isLender, isNewMessage }) => {
  const slideAnim = useRef(new Animated.Value(isNewMessage ? 50 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(isNewMessage ? 0 : 1)).current;

  useEffect(() => {
    if (isNewMessage) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNewMessage]);

  return (
    <Animated.View 
      style={[
        styles.messageContainer, 
        isLender ? styles.lenderMessage : styles.adminMessage,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {!isLender && (
        <View style={styles.adminMessageAvatar}>
          <Ionicons name="headset" size={16} color={colors.white} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={[styles.messageBubble, isLender ? styles.lenderBubble : styles.adminBubble]}>
          <Text style={[styles.messageText, isLender ? styles.lenderText : styles.adminText]}>
            {message.text}
          </Text>
        </View>
        <View style={[styles.messageMeta, isLender ? styles.lenderMeta : styles.adminMeta]}>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          {isLender && (
            <Ionicons 
              name={message.read ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.read ? colors.blueGreen : colors.gray} 
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const SystemMessage = ({ message }) => (
  <View style={styles.systemMessage}>
    <Text style={styles.systemMessageText}>{message.text}</Text>
  </View>
);

const MessageItem = ({ item, index, messages }) => {
  const isLender = item.senderRole === 'lender';
  const isSystem = item.type === 'system';
  const showDateSeparator = shouldShowDateSeparator(item, messages[index - 1]);
  const isNewMessage = index === messages.length - 1;

  return (
    <View>
      {showDateSeparator && <DateSeparator date={formatDate(item.timestamp)} />}
      {isSystem ? <SystemMessage message={item} /> : <MessageBubble message={item} isLender={isLender} isNewMessage={isNewMessage} />}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyStateIconContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.blueGreen} />
    </View>
    <Text style={styles.emptyStateTitle}>Start a Conversation</Text>
    <Text style={styles.emptyStateSubtitle}>Need help? Our support team is here for you.</Text>
    <Text style={styles.emptyStateHint}>💡 Tip: Get instant responses to your queries</Text>
  </View>
);

const LoadingSkeleton = () => (
  <View style={styles.loadingContainer}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.skeletonMessage}>
        <View style={[styles.skeletonBubble, i % 2 === 0 ? styles.skeletonAdmin : styles.skeletonLender]} />
      </View>
    ))}
  </View>
);

const Composer = ({ newMessage, setNewMessage, isSending, onSend }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.composer}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor={colors.gray}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
      {newMessage.length > MAX_MESSAGE_LENGTH * 0.8 && (
        <Text style={styles.charCount}>
          {newMessage.length}/{MAX_MESSAGE_LENGTH}
        </Text>
      )}
    </View>
  );
};

const MessagesScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const flatListRef = useRef(null);

  // Initialize conversation and subscribe to messages
  useEffect(() => {
    let unsubscribe;

    const initConversation = async () => {
      try {
        const conversation = await getOrCreateConversation(USER_ID);
        setConversationId(conversation.conversationId);

        // Subscribe to messages
        unsubscribe = subscribeToMessages(conversation.conversationId, (msgs) => {
          setMessages(msgs);
          setIsLoading(false);
          setIsConnected(true);
        });

        // Mark messages as read
        await markMessagesAsRead(conversation.conversationId, USER_ID);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        Alert.alert('Error', 'Failed to load messages');
        setIsLoading(false);
        setIsConnected(false);
      }
    };

    initConversation();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        markMessagesAsRead(conversationId, USER_ID).catch(console.error);
      }
    }, [conversationId])
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), SCROLL_DELAY);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending || !conversationId) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(conversationId, USER_ID, USER_ROLE, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, conversationId]);

  const handleInfo = useCallback(() => {
    Alert.alert(
      'Support Information',
      'Support Team\n\n' +
      '• Available 24/7 for your queries\n' +
      '• Average response time: < 1-5 hours\n' +
      '• Topics: Loans, Investments, Payments\n\n' +
      'Tip: Be specific with your questions for faster assistance!',
      [{ text: 'Got it', style: 'default' }]
    );
  }, []);

  const renderMessage = useCallback(({ item, index }) => 
    <MessageItem item={item} index={index} messages={messages} />, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header onBack={() => navigation.goBack()} isConnected={isConnected} onInfo={handleInfo} />
      <ConnectionStatus isConnected={isConnected} />

      <View style={styles.messagesContainer}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyState}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />
        )}
      </View>

      <Composer 
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isSending={isSending}
        onSend={handleSendMessage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 80,
    paddingBottom: spacing.md,
    backgroundColor: colors.blueGreen,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray,
  },
  onlineDot: {
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoButton: {
    padding: spacing.xs,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray,
    paddingVertical: spacing.xs,
    gap: 6,
  },
  connectionStatusText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
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
    borderRadius: borderRadius.full,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.gray,
    fontWeight: '500',
  },
  messageContainer: {
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  lenderMessage: {
    justifyContent: 'flex-end',
  },
  adminMessage: {
    justifyContent: 'flex-start',
  },
  adminMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  lenderBubble: {
    backgroundColor: colors.blueGreen,
    borderBottomRightRadius: borderRadius.xs,
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  adminBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  lenderText: {
    color: colors.white,
  },
  adminText: {
    color: colors.midnightBlue,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  lenderMeta: {
    justifyContent: 'flex-end',
  },
  adminMeta: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginRight: spacing.xs,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemMessageText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  composer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  inputContainerFocused: {
    borderColor: colors.blueGreen,
    borderWidth: 2,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    maxHeight: 80,
    minHeight: 20,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(55, 190, 176, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: fontSize.base,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyStateHint: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.md,
  },
  skeletonMessage: {
    marginVertical: spacing.xs,
  },
  skeletonBubble: {
    height: 40,
    borderRadius: borderRadius.lg,
    opacity: 0.3,
  },
  skeletonLender: {
    backgroundColor: colors.blueGreen,
    alignSelf: 'flex-end',
    width: '60%',
  },
  skeletonAdmin: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    width: '50%',
  },
});

export default MessagesScreen;