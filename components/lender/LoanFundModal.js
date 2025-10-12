import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getWalletByUserId } from '../../services/wallet/walletService';
import { fundLoan } from '../../services/lender/loanFundingService';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};

const LoanFundModal = ({ visible, onClose, request, onConfirm, userId }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!visible || !userId) return;
      
      setLoadingWallet(true);
      try {
        const wallet = await getWalletByUserId(userId);
        setWalletBalance(wallet?.balance || 0);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
        setWalletBalance(0);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletBalance();
  }, [visible, userId]);

  // Calculate financial details
  const fundAmount = request?.amountRequested || 0;
  const balanceAfter = walletBalance - fundAmount;
  const estimatedReturn = fundAmount * (1 + (parseFloat(request?.interestRate) || 0) / 100);
  const estimatedInterest = estimatedReturn - fundAmount;
  const hasInsufficientBalance = walletBalance < fundAmount;

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'Please agree to the platform terms before proceeding.');
      return;
    }

    if (hasInsufficientBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance in your wallet to fund this loan.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setFunding(true);
    
    try {
      const result = await fundLoan({
        loanId: request.id,
        lenderId: userId,
        borrowerId: request.borrowerId,
        amount: request.amountRequested
      });

      if (result.success) {
        Alert.alert(
          'Success!', 
          `${result.message}\n\nAmount: LKR ${result.data.fundedAmount.toLocaleString()}\nNew Balance: LKR ${result.data.newWalletBalance.toLocaleString()}`,
          [{ text: 'OK', onPress: () => {
            handleClose();
            if (onConfirm) onConfirm(result.data);
          }}]
        );
      }
    } catch (error) {
      console.error('Funding failed:', error);
      Alert.alert(
        'Funding Failed', 
        error.message || 'An error occurred while funding the loan. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setFunding(false);
    }
  };

  const handleClose = () => {
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="add-circle" size={24} color={colors.blueGreen} style={styles.titleIcon} />
                <View>
                  <Text style={styles.modalTitle}>Fund Loan Request</Text>
                  <Text style={styles.modalSubtitle}>#{request?.id || 'REQ001'}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close-circle" size={28} color={colors.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
              {/* Tiny Recap Row */}
              <View style={styles.recapRow}>
                <Text style={styles.recapText}>
                  {request?.borrowerName || 'Unknown'} • {request?.location || 'Unknown'} • {request?.termMonths || 0} mo
                </Text>
              </View>

              {/* 1) Wallet & Payment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wallet & Payment</Text>
                <View style={styles.infoCard}>
                  {loadingWallet ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.midnightBlue} />
                      <Text style={styles.loadingText}>Loading wallet balance...</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Wallet Balance:</Text>
                        <Text style={[styles.paymentValue, hasInsufficientBalance && styles.errorValue]}>
                          {formatCurrency(walletBalance)}
                        </Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Amount to fund:</Text>
                        <Text style={[styles.paymentValue, styles.highlightValue]}>{formatCurrency(fundAmount)}</Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Balance after:</Text>
                        <Text style={[styles.paymentValue, hasInsufficientBalance && styles.errorValue]}>
                          {formatCurrency(balanceAfter)}
                        </Text>
                      </View>
                      
                      {hasInsufficientBalance && (
                        <View style={styles.errorMessageContainer}>
                          <Ionicons name="warning" size={20} color={colors.red} />
                          <Text style={styles.errorMessage}>
                            Insufficient balance! You cannot fund this loan. Please add funds to your wallet.
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment method:</Text>
                        <View style={styles.paymentMethod}>
                          <Ionicons name="wallet" size={16} color={colors.blueGreen} />
                          <Text style={styles.paymentMethodText}>Use Wallet</Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* 2) Cost & Return Snapshot */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cost & Return Snapshot</Text>
                <View style={styles.infoCard}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Est. total return:</Text>
                    <Text style={[styles.paymentValue, styles.highlightValue]}>{formatCurrency(estimatedReturn)}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Est. interest:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(estimatedInterest)}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Est. ROI / APR:</Text>
                    <Text style={[styles.paymentValue, styles.highlightValue]}>{request?.interestRate || 0}%</Text>
                  </View>
                </View>
              </View>

              {/* 3) Risk + Policy Nudge */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk + Policy</Text>
                <View style={styles.infoCard}>
                  <View style={styles.policyContainer}>
                    <Text style={styles.policyText}>
                      After you fund: amount is held in escrow. Admin review required: escrow approval before disbursement. 
                      On approval: funds move from escrow → borrower, loan goes Active. 
                      If not approved/rejected: full refund back to your wallet.
                    </Text>
                  </View>
                </View>
              </View>

              {/* 4) Agreements */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Agreements</Text>
                <View style={styles.infoCard}>
                  <View style={styles.agreementRow}>
                    <Switch
                      value={agreedToTerms}
                      onValueChange={setAgreedToTerms}
                      trackColor={{ false: colors.lightGray, true: colors.blueGreen }}
                      thumbColor={agreedToTerms ? colors.white : colors.gray}
                    />
                    <Text style={styles.agreementText}>
                      I agree to the platform terms and acknowledge lending risk.
                    </Text>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Ionicons name="arrow-back" size={16} color={colors.midnightBlue} style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}> Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.fundButton, 
                (!agreedToTerms || hasInsufficientBalance || loadingWallet || funding) && styles.disabledButton
              ]} 
              onPress={handleConfirm}
              disabled={!agreedToTerms || hasInsufficientBalance || loadingWallet || funding}
            >
              {funding ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.fundButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={16} color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.fundButtonText}>
                    {loadingWallet ? 'Loading...' : hasInsufficientBalance ? 'Insufficient Balance' : 'Fund →'}
                  </Text>
                </>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '90%',
    height: '70%',
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.babyBlue,
    backgroundColor: colors.white,
  },
  recapRow: {
    backgroundColor: colors.tiffanyBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  recapText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
  },
  paymentLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
    flex: 0.6,
  },
  paymentValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    textAlign: 'right',
    flex: 0.4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
    justifyContent: 'flex-end',
  },
  paymentMethodText: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  highlightValue: {
    color: colors.forestGreen,
    fontWeight: 'bold',
  },
  errorValue: {
    color: colors.red,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.red,
  },
  errorMessage: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.red,
    fontWeight: '600',
    lineHeight: 18,
  },
  policyContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  policyText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  agreementText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '500',
    flex: 1,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.babyBlue,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  fundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  fundButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
});

export default LoanFundModal;
