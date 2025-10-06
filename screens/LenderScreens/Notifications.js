import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Notification type configuration 
const NOTIFICATION_TYPES = {
  loan_request: { icon: 'document-text', color: colors.blueGreen },
  repayment: { icon: 'wallet', color: colors.tealGreen },
  message: { icon: 'chatbubble', color: colors.midnightBlue },
};

// Mock data
const mockNotifications = [
  { id: 1, type: 'loan_request', title: 'Loan Request Approved', body: 'Your request #LN102 was approved. Funds are now in escrow.', timestamp: '2h ago', isRead: false },
  { id: 2, type: 'repayment', title: 'Repayment Due Tomorrow', body: 'LKR 3,500 repayment is due on Dec 15.', timestamp: '4h ago', isRead: false },
  { id: 3, type: 'message', title: 'New Message from Admin', body: 'Admin: Please upload KYC docs.', timestamp: '1d ago', isRead: true },
  { id: 4, type: 'loan_request', title: 'Loan Request Updated', body: 'Your request #LN103 status has been updated to Under Review.', timestamp: '2d ago', isRead: true },
  { id: 5, type: 'repayment', title: 'Repayment Received', body: 'LKR 2,800 repayment received from John Silva.', timestamp: '3d ago', isRead: true },
];

// Notification Item Component 
const NotificationItem = ({ item, onPress }) => {
  const typeConfig = NOTIFICATION_TYPES[item.type] || { icon: 'help', color: colors.gray };
  
  return (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.color }]}>
          <Ionicons name={typeConfig.icon} size={20} color={colors.white} />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.title, !item.isRead && { fontWeight: 'bold' }]}>
            {item.title}
          </Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component 
const EmptyState = () => (
  <View style={styles.emptyState}>
    <Image 
      source={require('../../assets/lender/Ok-pana.png')} 
      style={styles.emptyImage}
      resizeMode="contain"
    />
    <Text style={styles.emptyTitle}>You're all caught up</Text>
    <Text style={styles.emptySubtitle}>No new notifications</Text>
  </View>
);

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  return (
    <AnimatedScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.midnightBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color={colors.midnightBlue} />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem item={item} onPress={markAsRead} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 80,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  filterButton: {
    padding: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.blueGreen,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: 2,
  },
  body: {
    fontSize: fontSize.xs,
    color: colors.gray,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: 10,
    color: colors.gray,
    alignSelf: 'flex-end',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blueGreen,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyImage: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
