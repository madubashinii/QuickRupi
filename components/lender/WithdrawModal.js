import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getDefaultPaymentMethod, getUserPaymentMethods, TYPES } from '../../services/paymentMethods/paymentMethodsService';
import { withdrawFunds, checkSufficientBalance } from '../../services/wallet/walletService';

const WithdrawModal = ({ visible, onClose, onConfirm, walletBalance, userId }) => {
  const [amount, setAmount] = useState('');
  const [defaultBank, setDefaultBank] = useState(null);
  const [allBanks, setAllBanks] = useState([]);
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefaultBank = async () => {
      if (!userId) {
        console.log('WithdrawModal: No userId provided');
        return;
      }
      
      setIsLoadingBank(true);
      try {
        console.log('WithdrawModal: Fetching default bank for userId:', userId);
        
        // Try to get default bank
        const bank = await getDefaultPaymentMethod(userId, TYPES.BANK);
        console.log('WithdrawModal: Default bank fetched:', bank ? 'Found' : 'Not found');
        
        if (bank) {
          console.log('WithdrawModal: Bank details:', {
            id: bank.id,
            bankName: bank.bankName,
            isDefault: bank.isDefault,
            isActive: bank.isActive,
            type: bank.type
          });
          setDefaultBank(bank);
        } else {
          // If no default found, fetch all banks and use the first one
          console.log('WithdrawModal: No default bank, fetching all banks...');
          const banks = await getUserPaymentMethods(userId, TYPES.BANK, true);
          console.log('WithdrawModal: All banks fetched:', banks ? banks.length : 0);
          
          setAllBanks(banks || []);
          
          if (banks && banks.length > 0) {
            console.log('WithdrawModal: Using first bank as fallback:', {
              id: banks[0].id,
              bankName: banks[0].bankName,
              isDefault: banks[0].isDefault
            });
            setDefaultBank(banks[0]);
          } else {
            console.log('WithdrawModal: No bank accounts found for user');
            setDefaultBank(null);
          }
        }
      } catch (error) {
        console.error('WithdrawModal: Failed to fetch bank:', error);
        console.error('WithdrawModal: Error details:', error.message);
        setDefaultBank(null);
      } finally {
        setIsLoadingBank(false);
      }
    };
    
    if (visible) {
      fetchDefaultBank();
    }
  }, [userId, visible]);

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
      await withdrawFunds(userId, parseFloat(amount), defaultBank?.paymentMethodId);
      
      // Pass updated data back to parent (parent will show success notification)
      onConfirm({ amount: parseFloat(amount), account: defaultBank });
      setAmount('');
      setError(null);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to process withdrawal');
      Alert.alert('Error', error.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const handleRefreshBank = async () => {
    if (!userId) return;
    
    setIsLoadingBank(true);
    try {
      console.log('WithdrawModal: Manual refresh - Fetching bank accounts...');
      
      // First try default
      const bank = await getDefaultPaymentMethod(userId, TYPES.BANK);
      
      if (bank) {
        console.log('WithdrawModal: Refresh found default bank');
        setDefaultBank(bank);
      } else {
        // Fallback to all banks
        const banks = await getUserPaymentMethods(userId, TYPES.BANK, true);
        console.log('WithdrawModal: Refresh found banks:', banks ? banks.length : 0);
        
        setAllBanks(banks || []);
        setDefaultBank(banks && banks.length > 0 ? banks[0] : null);
      }
    } catch (error) {
      console.error('WithdrawModal: Refresh failed:', error);
      Alert.alert('Error', 'Failed to load bank account. Please try again.');
    } finally {
      setIsLoadingBank(false);
    }
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
              
              {isLoadingBank ? (
                <View style={styles.loadingBankContainer}>
                  <ActivityIndicator size="small" color={colors.blueGreen} />
                  <Text style={styles.loadingText}>Loading bank account...</Text>
                </View>
              ) : defaultBank ? (
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
                      {defaultBank.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="checkmark-circle" size={12} color={colors.blueGreen} />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noBankContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.red} />
                  <Text style={styles.noAccountText}>No bank account found</Text>
                  <Text style={styles.noAccountSubtext}>Please add a bank account in Profile → Payment Methods</Text>
                  <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshBank}>
                    <Ionicons name="refresh" size={16} color={colors.blueGreen} />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, (isProcessing || !defaultBank) && styles.buttonDisabled]} 
              onPress={handleConfirm}
              disabled={isProcessing || !defaultBank}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {defaultBank ? 'Confirm Withdraw' : 'No Bank Account'}
                </Text>
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
  loadingBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: fontSize.xs,
    color: colors.blueGreen,
    fontWeight: '600',
  },
  noBankContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  noAccountText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  noAccountSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.blueGreen,
  },
  refreshButtonText: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    fontWeight: '600',
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
