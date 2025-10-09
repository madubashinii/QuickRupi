import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getDefaultPaymentMethod, TYPES } from '../../services/paymentMethods/paymentMethodsService';
import { addFunds, getWalletBalance } from '../../services/wallet';

const AddFundsModal = ({ visible, onClose, onConfirm, userId }) => {
  const [amount, setAmount] = useState('');
  const [defaultCard, setDefaultCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch default card when modal opens
  useEffect(() => {
    const fetchDefaultCard = async () => {
      if (!visible || !userId) return;
      
      setLoading(true);
      try {
        const card = await getDefaultPaymentMethod(userId, TYPES.CARD);
        setDefaultCard(card);
      } catch (error) {
        console.error('Failed to fetch default card:', error);
        setDefaultCard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultCard();
  }, [visible, userId]);

  const handleConfirm = async () => {
    // Validate amount input
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!defaultCard) {
      Alert.alert('No Payment Method', 'Please add a payment method first');
      return;
    }
    
    // Set processing state and show loading indicator
    setIsProcessing(true);
    setError(null);

    try {
      const parsedAmount = parseFloat(amount);
      
      // Call wallet service to add funds
      await addFunds(userId, parsedAmount);
      
      // Get updated balance
      const updatedBalance = await getWalletBalance(userId);
      
      // Show success message
      Alert.alert('Success', `LKR ${parsedAmount.toFixed(2)} added successfully!`);
      
      // Pass updated data back to parent
      onConfirm({ 
        amount: parsedAmount, 
        paymentMethod: 'card',
        newBalance: updatedBalance 
      });
      
      // Reset and close modal
      setAmount('');
      onClose();
    } catch (err) {
      // Handle error: show message, no rollback needed (addFunds atomic)
      console.error('Add funds failed:', err);
      setError(err.message || 'Failed to add funds');
      Alert.alert('Error', err.message || 'Failed to add funds. Please try again.');
    } finally {
      // Always reset processing state
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  // Card Preview Component
  const CardPreview = ({ card }) => (
    <View style={styles.cardPreview}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="card" size={20} color={colors.white} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardBrand}>{card.brand}</Text>
          <Text style={styles.cardNumber}>•••• {card.last4}</Text>
        </View>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardNickname}>{card.nickname}</Text>
        <Text style={styles.cardholder}>{card.cardholder}</Text>
        <Text style={styles.expiry}>Expires {card.expiry}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Funds</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Deposit Amount</Text>
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

            <Text style={styles.sectionTitle}>Payment Method</Text>
            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color={colors.blueGreen} />
                <Text style={styles.loadingText}>Loading card...</Text>
              </View>
            ) : defaultCard ? (
              <CardPreview card={defaultCard} />
            ) : (
              <View style={styles.noCardContainer}>
                <Ionicons name="card-outline" size={40} color={colors.gray} />
                <Text style={styles.noCardText}>No default card found</Text>
                <Text style={styles.noCardSubtext}>Please add a payment method first</Text>
              </View>
            )}

            {/* Error display area for API failures */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]} 
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Add Funds</Text>
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
    width: '85%',
    maxWidth: 350,
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
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.blueGreen,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
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
  cardPreview: {
    backgroundColor: colors.midnightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    marginRight: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: fontSize.sm,
    color: colors.lightGray,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  defaultBadge: {
    backgroundColor: colors.blueGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.sm,
  },
  cardNickname: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardholder: {
    fontSize: fontSize.sm,
    color: colors.lightGray,
    fontWeight: '500',
    marginBottom: 2,
  },
  expiry: {
    fontSize: fontSize.sm,
    color: colors.lightGray,
    fontWeight: '500',
  },
  loadingCard: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  noCardContainer: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  noCardText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginTop: spacing.sm,
  },
  noCardSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.red,
    fontWeight: '500',
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
  confirmButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
});

export default AddFundsModal;
