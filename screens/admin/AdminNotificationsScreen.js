import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { subscribeToUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notifications/notificationService';
import { formatTimestamp, getNotificationTypeConfig } from '../../services/notifications/notificationUtils';
import { useAuth } from '../../context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'NEW_KYC_SUBMISSION', label: 'KYC Submissions' },
  { value: 'NEW_LOAN_APPLICATION', label: 'Loan Applications' },
  { value: 'ESCROW_PENDING_APPROVAL', label: 'Escrow Approvals' },
  { value: 'PAYMENT_OVERDUE', label: 'Overdue Payments' },
];

const getNavigationTarget = (notification) => {
  const typeMapping = {
    NEW_KYC_SUBMISSION: { screen: 'KYCApproval' },
    NEW_LOAN_APPLICATION: { screen: 'AdminHome', params: { screen: 'Loans' } },
    ESCROW_PENDING_APPROVAL: { screen: 'AdminHome', params: { screen: 'Escrow' } },
    PAYMENT_OVERDUE: { screen: 'AdminHome', params: { screen: 'Dashboard', params: { screen: 'Repayments' } } },
  };
  return typeMapping[notification.type] || null;
};

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
              <Ionicons name="checkmark" size={20} color={colors.midnightBlue} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Image 
      source={require('../../assets/lender/Ok-pana.png')} 
      style={styles.emptyImage}
      resizeMode="contain"
    />
    <Text style={styles.emptyTitle}>All Caught Up</Text>
    <Text style={styles.emptySubtitle}>No new notifications</Text>
  </View>
);

const AdminNotificationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const adminId = user?.uid;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserNotifications(adminId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminId]);

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter(n => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length
  , [notifications]);

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.notificationId);
      }
      
      const target = getNavigationTarget(notification);
      
      if (target) {
        navigation.navigate(target.screen, target.params);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert('No Unread Notifications', 'All notifications are already marked as read.');
      return;
    }

    if (!adminId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await markAllNotificationsAsRead(adminId);
              Alert.alert('Success', 'All notifications marked as read');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.midnightBlue} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>
          {selectedFilter === 'all' ? 'All' : FILTER_OPTIONS.find(o => o.value === selectedFilter)?.label}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={handleNotificationPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.midnightBlue,
    paddingTop: 80,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  badge: {
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.midnightBlue,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.midnightBlue,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: SCREEN_WIDTH * 0.85,
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: colors.babyBlue,
  },
  filterOptionText: {
    fontSize: 16,
    color: colors.black,
  },
  filterOptionTextSelected: {
    fontWeight: '600',
    color: colors.midnightBlue,
  },
});

export default AdminNotificationsScreen;

