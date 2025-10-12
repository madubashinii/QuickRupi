import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { getUserPreferences, saveUserPreferences } from '../../services/notifications/userPreferencesService';

const AdminNotificationSettingsModal = ({ visible, onClose, userId = 'ADMIN001' }) => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!visible) return;
      
      setLoading(true);
      try {
        const prefs = await getUserPreferences(userId);
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [visible, userId]);

  const handleToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserPreferences(userId, preferences);
      Alert.alert('Success', 'Notification preferences saved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const notificationCategories = [
    {
      title: 'User Management',
      items: [
        { type: 'NEW_KYC_SUBMISSION', label: 'KYC Submissions', description: 'When users submit KYC documents' },
      ]
    },
    {
      title: 'Loan Management',
      items: [
        { type: 'NEW_LOAN_APPLICATION', label: 'Loan Applications', description: 'When borrowers apply for loans' },
      ]
    },
    {
      title: 'Escrow & Approvals',
      items: [
        { type: 'ESCROW_PENDING_APPROVAL', label: 'Escrow Approvals', description: 'When escrow needs approval' },
      ]
    },
    {
      title: 'Payment Monitoring',
      items: [
        { type: 'PAYMENT_OVERDUE', label: 'Overdue Payments', description: 'When payments are overdue' },
      ]
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.midnightBlue} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.midnightBlue} />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {notificationCategories.map((category, index) => (
                <View key={index} style={styles.category}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  {category.items.map((item) => (
                    <View key={item.type} style={styles.settingItem}>
                      <View style={styles.settingTextContainer}>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingDescription}>{item.description}</Text>
                      </View>
                      <Switch
                        value={preferences[item.type] !== false}
                        onValueChange={() => handleToggle(item.type)}
                        trackColor={{ false: colors.lightGray, true: colors.blueGreen }}
                        thumbColor={preferences[item.type] !== false ? colors.midnightBlue : colors.gray}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.midnightBlue,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.gray,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
  },
  saveButton: {
    backgroundColor: colors.midnightBlue,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AdminNotificationSettingsModal;

