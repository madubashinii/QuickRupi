import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { formatTime } from '../../services/chat';
import MessageStatusIndicator from './MessageStatusIndicator';
import MessageWithLinks from './MessageWithLinks';

const AdminMessageBubble = ({ message, isNewMessage = false }) => {
  const isAdmin = message.senderRole === 'admin';
  const isSystem = message.type === 'system';
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
  }, [isNewMessage, slideAnim, fadeAnim]);

  if (isSystem) {
    return (
      <Animated.View style={[styles.systemMessage, { opacity: fadeAnim }]}>
        <Text style={styles.systemText}>{message.text}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        isAdmin ? styles.adminContainer : styles.lenderContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <View style={[styles.bubble, isAdmin ? styles.adminBubble : styles.lenderBubble]}>
        <MessageWithLinks 
          text={message.text}
          style={[styles.text, isAdmin ? styles.adminText : styles.lenderText]}
          linkColor={isAdmin ? colors.white : colors.blueGreen}
        />
      </View>
      <View style={[styles.meta, isAdmin ? styles.adminMeta : styles.lenderMeta]}>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        <MessageStatusIndicator 
          status={message.status} 
          isOwnMessage={isAdmin} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  adminContainer: {
    alignItems: 'flex-end',
  },
  lenderContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  adminBubble: {
    backgroundColor: colors.blueGreen,
    borderBottomRightRadius: borderRadius.xs,
  },
  lenderBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  adminText: {
    color: colors.white,
  },
  lenderText: {
    color: colors.midnightBlue,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  adminMeta: {
    justifyContent: 'flex-end',
  },
  lenderMeta: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.gray,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
  },
});

export default AdminMessageBubble;

