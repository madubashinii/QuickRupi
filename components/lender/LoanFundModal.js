import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;

// Mock wallet data
const MOCK_WALLET = {
  balance: 120000,
  paymentMethod: 'wallet'
};

// Risk configuration
const RISK_CONFIG = {
  'Low': { color: colors.forestGreen, bgColor: '#E8F5E8', icon: 'shield-checkmark' },
  'Medium': { color: '#FFB347', bgColor: '#FFF3E0', icon: 'shield-half' },
  'High': { color: colors.red, bgColor: '#FFEBEE', icon: 'shield' },
  default: { color: colors.gray, bgColor: '#F5F5F5', icon: 'help-circle' }
};

// Loan Fund Modal Component
const LoanFundModal = ({ visible, onClose, request, onConfirm }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleConfirm = () => {
    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'Please agree to the platform terms before proceeding.');
      return;
    }

    const fundingData = {
      requestId: request.id,
      borrowerName: request.borrowerName,
      amountRequested: request.amountRequested,
      fundAmount: request.amountRequested, // Always fund the full amount
      timestamp: new Date().toISOString(),
      agreedToTerms: true
    };

    onConfirm(fundingData);
    handleClose();
  };

  // Calculate financial details
  const fundAmount = request?.amountRequested || 0;
  const walletBalance = MOCK_WALLET.balance;
  const balanceAfter = walletBalance - fundAmount;
  const estimatedReturn = fundAmount * (1 + (request?.estAPR || 0) / 100);
  const estimatedInterest = estimatedReturn - fundAmount;

  // Risk chip component
  const RiskChip = ({ riskLevel }) => {
    const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.default;
    return (
      <View style={[styles.riskChip, { backgroundColor: config.bgColor, borderColor: config.color }]}>
        <Ionicons name={config.icon} size={12} color={config.color} style={styles.riskIcon} />
        <Text style={[styles.riskChipText, { color: config.color }]}>{riskLevel}</Text>
      </View>
    );
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
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Wallet Balance:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(walletBalance)}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Amount to fund:</Text>
                    <Text style={[styles.paymentValue, styles.highlightValue]}>{formatCurrency(fundAmount)}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Balance after:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(balanceAfter)}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Payment method:</Text>
                    <View style={styles.paymentMethod}>
                      <Ionicons name="wallet" size={16} color={colors.blueGreen} />
                      <Text style={styles.paymentMethodText}>Use Wallet</Text>
                    </View>
                  </View>
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
                    <Text style={[styles.paymentValue, styles.highlightValue]}>{request?.estAPR || 0}% APR</Text>
                  </View>
                </View>
              </View>

              {/* 3) Risk + Policy Nudge */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk + Policy</Text>
                <View style={styles.infoCard}>
                  <View style={styles.riskRow}>
                    <Text style={styles.riskLabel}>Risk:</Text>
                    <RiskChip riskLevel={request?.riskLevel || 'Medium'} />
                  </View>
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
              style={[styles.fundButton, !agreedToTerms && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={!agreedToTerms}
            >
              <Ionicons name="add-circle" size={16} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.fundButtonText}>Fund →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Styles - Interface Segregation: Grouped by component responsibility
const styles = StyleSheet.create({
  // Modal Layout
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
  
  // Section Styles
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
  headerCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.babyBlue,
    backgroundColor: colors.tiffanyBlue,
  },
  
  // Header Styles
  requestId: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  borrowerName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  location: {
    fontSize: fontSize.base,
    color: colors.gray,
    fontWeight: '500',
  },
  
  // Recap Row
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

  // Payment Row Styles
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

  // Risk Row Styles
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
  },
  riskLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
  },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  riskIcon: {
    marginRight: spacing.xs,
  },
  riskChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // Policy Styles
  policyContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  policyText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
  },

  // Agreement Styles
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
  
  // Form Styles
  formSection: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  
  // Action Styles
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
