import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { formatTime } from '../../services/chat';

const ConversationCard = ({ conversation, onPress, isActive }) => {
  const lenderId = conversation.participants?.lenderId || 'Unknown';
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount?.ADMIN001 || 0;

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
          <Text style={styles.lenderName}>{lenderId}</Text>
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

