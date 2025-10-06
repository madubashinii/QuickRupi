import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const WithdrawModal = ({ visible, onClose, onConfirm, walletBalance }) => {
  const [amount, setAmount] = useState('');

  // Mock saved account data
  const savedAccount = {
    accountNumber: '1234567890',
    bank: 'Commercial Bank',
    branch: 'Colombo 03'
  };

  const getMaskedAccountNumber = (accountNumber) => {
    return `****${accountNumber.slice(-4)}`;
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(walletBalance.replace(/[^\d.]/g, ''))) {
      Alert.alert('Insufficient Balance', 'Amount cannot exceed wallet balance');
      return;
    }

    const accountData = savedAccount;
    onConfirm({
      amount: parseFloat(amount),
      account: accountData
    });
    
    setAmount('');
    onClose();
  };

  const handleCancel = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>LKR</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.gray}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <Text style={styles.balanceText}>Available: {walletBalance}</Text>

            <View style={styles.accountSection}>
              <Text style={styles.sectionTitle}>Withdrawal Method</Text>
              
              <View style={styles.accountOption}>
                <View style={styles.accountInfo}>
                  <Ionicons name="business" size={18} color={colors.blueGreen} />
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountText}>
                      {savedAccount.bank}
                    </Text>
                    <Text style={styles.accountSubtext}>
                      {getMaskedAccountNumber(savedAccount.accountNumber)} • {savedAccount.branch}
                    </Text>
                  </View>
                </View>
              </View>

            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  modalBody: {
    padding: spacing.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.blueGreen,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.babyBlue,
  },
  currencySymbol: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  balanceText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.lg,
    textAlign: 'right',
  },
  accountSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.md,
  },
  accountOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.blueGreen,
    backgroundColor: colors.babyBlue,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  accountText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  accountSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gray,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
});

export default WithdrawModal;
