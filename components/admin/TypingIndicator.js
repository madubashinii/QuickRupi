import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme';
import { getUserDoc } from '../../services/firestoreService';

const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const [userNames, setUserNames] = useState({});

  // Filter out current user and non-typing users
  const otherTypingUsers = React.useMemo(() => {
    if (!typingUsers || Object.keys(typingUsers).length === 0) {
      return [];
    }
    
    return Object.entries(typingUsers)
      .filter(([userId, status]) => 
        userId !== currentUserId && 
        status.isTyping && 
        status.lastUpdated
      );
  }, [typingUsers, currentUserId]);

  // Fetch user names for typing users
  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      
      for (const [userId] of otherTypingUsers) {
        if (!userNames[userId]) {
          try {
            const userData = await getUserDoc(userId);
            if (userData) {
              // Combine firstName and lastName
              const fullName = userData.firstName && userData.lastName 
                ? `${userData.firstName} ${userData.lastName}`.trim()
                : (userData.firstName || userData.lastName || '').trim();
              
              // Use nameWithInitials, fullName, name, email, or fallback to userId
              names[userId] = userData.nameWithInitials || fullName || userData.name || userData.email?.split('@')[0] || userId;
            } else {
              names[userId] = userId;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            names[userId] = userId;
          }
        }
      }
      
      if (Object.keys(names).length > 0) {
        setUserNames(prev => ({ ...prev, ...names }));
      }
    };

    if (otherTypingUsers.length > 0) {
      fetchUserNames();
    }
  }, [otherTypingUsers]);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      const [userId] = otherTypingUsers[0];
      const userName = userNames[userId] || 'Someone';
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
