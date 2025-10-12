import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getUserPreferences, saveUserPreferences } from '../../services/notifications/userPreferencesService';

const BorrowerNotificationSettingsModal = ({ visible, onClose, userId = 'B001' }) => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences when modal opens
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!visible) return;

      setLoading(true);
      try {
        const prefs = await getUserPreferences(userId);
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to fetch borrower preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [visible, userId]);

  // Toggle a preference on/off
  const handleToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Save preferences
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserPreferences(userId, preferences);
      Alert.alert('Success', 'Your preferences were saved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save borrower preferences:', error);
      Alert.alert('Error', 'Could not save preferences. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Borrower-specific notification categories
  const notificationCategories = [
    {
      title: 'Loan Application Updates',
      items: [
        { type: 'LOAN_APPROVED', label: 'Loan Approved', description: 'When your loan request is approved' },
        { type: 'LOAN_REJECTED', label: 'Loan Rejected', description: 'When your loan request is rejected' },
      ],
    },
    {
      title: 'Repayments & Dues',
      items: [
        { type: 'REPAYMENT_DUE', label: 'Repayment Due', description: 'Reminder before your repayment date' },
        { type: 'REPAYMENT_CONFIRMED', label: 'Repayment Confirmed', description: 'When your payment is received successfully' },
      ],
    },
    {
      title: 'Profile & KYC',
      items: [
        { type: 'KYC_STATUS', label: 'KYC Status', description: 'Updates on your KYC verification process' },
      ],
    },
    {
      title: 'System Messages',
      items: [
        { type: 'GENERAL_ALERT', label: 'General Alerts', description: 'Important updates or system messages from QuickRupi' },
      ],
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.midnightBlue} />
            </TouchableOpacity>
          </View>

          {/* Loading Spinner */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tealGreen} />
            </View>
          ) : (
            <>
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {notificationCategories.map((category, idx) => (
                  <View key={idx} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    {category.items.map((item) => (
                      <View key={item.type} style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                          <Text style={styles.settingLabel}>{item.label}</Text>
                          <Text style={styles.settingDescription}>{item.description}</Text>
                        </View>
                        <Switch
                          value={preferences[item.type] !== false}
                          onValueChange={() => handleToggle(item.type)}
                          trackColor={{ false: colors.lightGray, true: colors.tealGreen }}
                          thumbColor={colors.white}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.midnightBlue,
  },
  closeButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  content: {
    padding: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  saveButton: {
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default BorrowerNotificationSettingsModal;
