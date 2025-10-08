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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Constants
const SEND_DELAY = 1000;
const SCROLL_DELAY = 100;
const MAX_MESSAGE_LENGTH = 500;

// Mock data
const mockData = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: '2',
    text: 'Hi, I have a question about my recent loan investment',
    sender: 'lender',
    timestamp: new Date(Date.now() - 3500000),
    read: true,
  },
  {
    id: '3',
    text: 'Of course! I\'d be happy to help. Which loan are you referring to?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 3400000),
    read: true,
  },
  {
    id: '4',
    text: 'It\'s loan LN-201 for John Silva. I noticed the borrower hasn\'t made the payment yet.',
    sender: 'lender',
    timestamp: new Date(Date.now() - 3300000),
    read: true,
  },
  {
    id: '5',
    text: 'I see. Let me check the status of that loan for you. One moment please.',
    sender: 'admin',
    timestamp: new Date(Date.now() - 3200000),
    read: true,
  },
  {
    id: '6',
    text: 'Thank you!',
    sender: 'lender',
    timestamp: new Date(Date.now() - 3000000),
    read: false,
  },
  {
    id: 'system-1',
    text: 'Escrow approved for LN-201',
    sender: 'system',
    timestamp: new Date(Date.now() - 2800000),
    read: false,
  },
];

// Utility functions
const formatTime = (timestamp) => 
  timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const formatDate = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffDays = Math.ceil((now - messageDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  return messageDate.toLocaleDateString();
};

const shouldShowDateSeparator = (current, previous) => 
  !previous || new Date(current.timestamp).toDateString() !== new Date(previous.timestamp).toDateString();

// Components
const Header = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color={colors.midnightBlue} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Admin Support</Text>
    <View style={styles.headerSpacer} />
  </View>
);

const DateSeparator = ({ date }) => (
  <View style={styles.dateSeparator}>
    <View style={styles.datePill}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  </View>
);

const MessageBubble = ({ message, isLender }) => (
  <View style={[styles.messageContainer, isLender ? styles.lenderMessage : styles.adminMessage]}>
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
          size={12} 
          color={colors.gray} 
        />
      )}
    </View>
  </View>
);

const SystemMessage = ({ message }) => (
  <View style={styles.systemMessage}>
    <Text style={styles.systemMessageText}>{message.text}</Text>
  </View>
);

const MessageItem = ({ item, index, messages }) => {
  const isLender = item.sender === 'lender';
  const isSystem = item.sender === 'system';
  const showDateSeparator = shouldShowDateSeparator(item, messages[index - 1]);

  return (
    <View>
      {showDateSeparator && <DateSeparator date={formatDate(item.timestamp)} />}
      {isSystem ? <SystemMessage message={item} /> : <MessageBubble message={item} isLender={isLender} />}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateEmoji}>👋</Text>
    <Text style={styles.emptyStateText}>Say hi to support</Text>
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

const Composer = ({ newMessage, setNewMessage, isSending, onSend }) => (
  <View style={styles.composer}>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Write a message…"
        placeholderTextColor={colors.midnightBlue}
        multiline
        maxLength={MAX_MESSAGE_LENGTH}
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
  </View>
);

const MessagesScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(mockData);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), SCROLL_DELAY);
  }, []);

  useEffect(() => scrollToBottom(), [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'lender',
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    setTimeout(() => setIsSending(false), SEND_DELAY);
  }, [newMessage, isSending]);

  const renderMessage = useCallback(({ item, index }) => 
    <MessageItem item={item} index={index} messages={messages} />, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header onBack={() => navigation.goBack()} />

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
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
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
    marginVertical: spacing.xs,
  },
  lenderMessage: {
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  lenderBubble: {
    backgroundColor: colors.blueGreen,
    borderBottomRightRadius: borderRadius.xs,
  },
  adminBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: colors.tiffanyBlue,
    borderTopWidth: 1,
    borderTopColor: colors.tiffanyBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.deepForestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.gray,
    textAlign: 'center',
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