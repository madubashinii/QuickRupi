import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notifications/notificationService';
import { formatTimestamp, getNotificationTypeConfig } from '../../services/notifications/notificationUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'FUNDING_CONFIRMED', label: 'Funding' },
  { value: 'PAYMENT_RECEIVED', label: 'Payments' },
  { value: 'LOAN_COMPLETED', label: 'Completed Loans' },
  { value: 'FUNDS_ADDED', label: 'Wallet' },
  { value: 'MONTHLY_RETURNS', label: 'Monthly Returns' },
  { value: 'ROI_MILESTONE', label: 'Milestones' },
];

// Navigation helper based on notification type
const getNavigationTarget = (notification) => {
  const typeMapping = {
    FUNDING_CONFIRMED: { screen: 'Investments' },
    ESCROW_APPROVED: { screen: 'Investments' },
    LOAN_DISBURSED: { screen: 'Investments' },
    LOAN_ACTIVE: { screen: 'Investments' },
    PAYMENT_RECEIVED: { screen: 'Investments' },
    LOAN_COMPLETED: { screen: 'Investments' },
    MONTHLY_RETURNS: { screen: 'Investments' },
    ROI_MILESTONE: { screen: 'Investments' },
    FUNDS_ADDED: { screen: 'Transactions' },
    WITHDRAWAL_PROCESSED: { screen: 'Transactions' },
  };
  return typeMapping[notification.type] || null;
};

// Notification Item Component 
const NotificationItem = ({ item, onPress }) => {
  const typeConfig = getNotificationTypeConfig(item.type);
  
  return (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
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
          <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, selectedFilter, onSelectFilter }) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.filterModal}>
        <Text style={styles.filterModalTitle}>Filter Notifications</Text>
        {FILTER_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterOption,
              selectedFilter === option.value && styles.filterOptionSelected
            ]}
            onPress={() => {
              onSelectFilter(option.value);
              onClose();
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedFilter === option.value && styles.filterOptionTextSelected
            ]}>
              {option.label}
            </Text>
            {selectedFilter === option.value && (
              <Ionicons name="checkmark" size={20} color={colors.teal} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

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
  const { user } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToUserNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter(n => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length
  , [notifications]);

  const handleNotificationPress = async (notification) => {
    try {
      // Mark as read first
      if (!notification.isRead) {
        await markNotificationAsRead(notification.notificationId);
      }
      
      // Get navigation target
      const target = getNavigationTarget(notification);
      
      if (target) {
        // Navigate to LenderHome and specify which tab to open
        navigation.navigate('LenderHome', { 
          screen: target.screen 
        });
      } else {
        // No target, just go back
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to handle notification press:', error);
      // Fallback: just go back
      navigation.goBack();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || !user?.uid) return;
    
    Alert.alert(
      'Mark All as Read',
      `Mark ${unreadCount} notification${unreadCount !== 1 ? 's' : ''} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await markAllNotificationsAsRead(user.uid);
            } catch (error) {
              console.error('Failed to mark all as read:', error);
              Alert.alert('Error', 'Failed to mark notifications as read');
            }
          }
        }
      ]
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
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons 
            name={selectedFilter === 'all' ? 'filter-outline' : 'filter'} 
            size={24} 
            color={selectedFilter === 'all' ? colors.midnightBlue : colors.teal} 
          />
        </TouchableOpacity>
      </View>

      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.unreadText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      ) : filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => <NotificationItem item={item} onPress={handleNotificationPress} />}
          keyExtractor={(item) => item.notificationId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  unreadText: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  markAllButton: {
    fontSize: fontSize.sm,
    color: colors.teal,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: SCREEN_WIDTH * 0.8,
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filterOptionSelected: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.sm,
  },
  filterOptionText: {
    fontSize: fontSize.md,
    color: colors.midnightBlue,
  },
  filterOptionTextSelected: {
    fontWeight: '600',
    color: colors.teal,
  },
});

export default NotificationsScreen;
