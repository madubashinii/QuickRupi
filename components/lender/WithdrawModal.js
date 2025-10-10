import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getDefaultPaymentMethod, TYPES } from '../../services/paymentMethods/paymentMethodsService';
import { withdrawFunds, checkSufficientBalance } from '../../services/wallet/walletService';

const WithdrawModal = ({ visible, onClose, onConfirm, walletBalance, userId }) => {
  const [amount, setAmount] = useState('');
  const [defaultBank, setDefaultBank] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefaultBank = async () => {
      if (!userId) return;
      try {
        const bank = await getDefaultPaymentMethod(userId, TYPES.BANK);
        setDefaultBank(bank);
      } catch (error) {
        console.error('Failed to fetch default bank:', error);
      }
    };
    fetchDefaultBank();
  }, [userId]);

  useEffect(() => {
    if (amount) setError(null);
  }, [amount]);

  const getMaskedAccountNumber = (accountNumber) => {
    return `****${accountNumber.slice(-4)}`;
  };

  const handleConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!defaultBank) {
      setError('Please add a default bank account to withdraw funds');
      return;
    }

    try {
      const hasSufficient = await checkSufficientBalance(userId, parseFloat(amount));
      if (!hasSufficient) {
        setError('Insufficient balance for this withdrawal');
        return;
      }

      setIsProcessing(true);
      await withdrawFunds(userId, parseFloat(amount));
      
      Alert.alert('Success', 'Withdrawal successful');
      onConfirm({ amount: parseFloat(amount), account: defaultBank });
      setAmount('');
      setError(null);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setError(null);
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

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.error || '#dc2626'} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.accountSection}>
              <Text style={styles.sectionTitle}>Withdrawal Method</Text>
              
              {defaultBank ? (
                <View style={styles.accountOption}>
                  <View style={styles.accountInfo}>
                    <Ionicons name="business" size={18} color={colors.blueGreen} />
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountText}>
                        {defaultBank.bankName}
                      </Text>
                      <Text style={styles.accountSubtext}>
                        {defaultBank.accountNumberMasked || getMaskedAccountNumber(defaultBank.accountNumber)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noBankContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.gray} />
                  <Text style={styles.noAccountText}>No default bank account</Text>
                </View>
              )}

            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, isProcessing && styles.buttonDisabled]} 
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Withdraw</Text>
              )}
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
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: '#dc2626',
    flex: 1,
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
  noBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  noAccountText: {
    fontSize: fontSize.base,
    color: colors.gray,
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default WithdrawModal;
