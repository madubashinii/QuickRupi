import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { formatTime } from '../../services/chat';
import { getUserDoc } from '../../services/firestoreService';

const ConversationCard = ({ conversation, onPress, isActive, adminId }) => {
  const lenderId = conversation.participants?.lenderId || 'Unknown';
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount?.[adminId] || 0;
  const [displayName, setDisplayName] = useState(lenderId);

  useEffect(() => {
    const fetchLenderName = async () => {
      if (!lenderId || lenderId === 'Unknown') return;

      try {
        const userData = await getUserDoc(lenderId);
        if (userData && userData.firstName) {
          // Get last 4 digits of user ID
          const last4Digits = lenderId.slice(-4);
          // Display firstName with last 4 digits
          setDisplayName(`${userData.firstName} - ${last4Digits}`);
        } else {
          setDisplayName(lenderId);
        }
      } catch (error) {
        console.error(`Error fetching lender ${lenderId}:`, error);
        setDisplayName(lenderId);
      }
    };

    fetchLenderName();
  }, [lenderId]);

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={colors.white} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.lenderName}>{displayName}</Text>
          {lastMessage?.timestamp && (
            <Text style={styles.time}>
              {formatTime(lastMessage.timestamp.toDate?.() || lastMessage.timestamp)}
            </Text>
          )}
        </View>

        {lastMessage && (
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.text}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  cardActive: {
    backgroundColor: colors.babyBlue,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lenderName: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.gray,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray,
    marginRight: spacing.sm,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.deepForestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ConversationCard;

