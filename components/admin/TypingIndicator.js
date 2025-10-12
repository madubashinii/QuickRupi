import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme';

const TypingIndicator = ({ typingUsers, currentUserId }) => {
  if (!typingUsers || Object.keys(typingUsers).length === 0) {
    return null;
  }

  // Filter out current user and non-typing users
  const otherTypingUsers = Object.entries(typingUsers)
    .filter(([userId, status]) => 
      userId !== currentUserId && 
      status.isTyping && 
      status.lastUpdated
    );

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      const [userId] = otherTypingUsers[0];
      const userName = userId === 'ADMIN001' ? 'Admin' : `Lender ${userId}`;
      return `${userName} is typing...`;
    } else {
      return 'Multiple people are typing...';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getTypingText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
  },
});

export default TypingIndicator;
