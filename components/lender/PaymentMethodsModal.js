import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AddPaymentMethod from './AddPaymentMethod';

// Constants
const BANKS = ['Commercial Bank', 'HNB', 'Sampath Bank', 'People\'s Bank', 'DFCC Bank'];

// Payment Method Limits
const MAX_CARDS = 2;
const MAX_BANK_ACCOUNTS = 1;

const MOCK_CARDS = [
  {
    id: 1,
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    nickname: 'Visa Personal',
    cardholder: 'MARTINA ALEX',
    expiry: '12/30',
    isDefault: true,
  },
  {
    id: 2,
    type: 'card',
    brand: 'Mastercard',
    last4: '5555',
    nickname: 'Mastercard Business',
    cardholder: 'MARTINA ALEX',
    expiry: '06/31',
    isDefault: false,
  }
];

const MOCK_BANK = {
  id: 3,
  type: 'bank',
  bankName: 'Commercial Bank',
  last4: '7890',
  branch: 'Colombo 03',
  accountHolder: 'Brian Gunasekara',
  accountType: 'Savings',
  isDefault: true,
};

// Payment Methods Modal
const PaymentMethodsModal = ({ visible, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Current payment method counts
  const currentCards = MOCK_CARDS.length;
  const currentBanks = 1; // MOCK_BANK exists

  // Check if limits are reached
  const isCardLimitReached = currentCards >= MAX_CARDS;
  const isBankLimitReached = currentBanks >= MAX_BANK_ACCOUNTS;
  const canAddMore = !isCardLimitReached || !isBankLimitReached;

  // Handlers following Single Responsibility Principle
  const handleSave = () => setShowAddForm(false);
  const handleCancel = () => setShowAddForm(false);
  
  // Action handlers (these would typically call API services)
  const handleDelete = (type, id) => console.log(`Delete ${type} with id:`, id);
  const handleMakeDefault = (type, id) => console.log(`Make ${type} default with id:`, id);

  // Limits Info Component
  const LimitsInfo = () => (
    <View style={styles.limitsInfo}>
      <View style={styles.limitsHeader}>
        <Ionicons name="information-circle-outline" size={16} color={colors.blueGreen} />
        <Text style={styles.limitsTitle}>Payment Method Limits</Text>
      </View>
      <Text style={styles.limitsText}>
        You can add up to <Text style={styles.limitsHighlight}>{MAX_CARDS} cards</Text> and <Text style={styles.limitsHighlight}>{MAX_BANK_ACCOUNTS} bank account</Text>.
      </Text>
      <View style={styles.limitsStatus}>
        <Text style={styles.limitsStatusText}>
          Cards: {currentCards}/{MAX_CARDS} • Banks: {currentBanks}/{MAX_BANK_ACCOUNTS}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Payment Methods</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {!showAddForm ? (
            <>
              {/* Payment Method Limits Info */}
              <View style={styles.limitsContainer}>
                <LimitsInfo />
              </View>

              {/* Saved Payment Methods */}
              <ScrollView style={styles.modalBody}>
                <View style={styles.savedMethodsContainer}>
                  <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
                  
                  {MOCK_CARDS.map(card => (
                    <SavedCardCard 
                      key={card.id}
                      card={card} 
                      onDelete={() => handleDelete('card', card.id)}
                    />
                  ))}
                  
                  <SavedBankCard 
                    bank={MOCK_BANK} 
                    onDelete={() => handleDelete('bank', MOCK_BANK.id)}
                    onMakeDefault={() => handleMakeDefault('bank', MOCK_BANK.id)}
                  />
                </View>
              </ScrollView>

              {/* Add New Button */}
              <View style={styles.addNewContainer}>
                {canAddMore ? (
                  <TouchableOpacity 
                    style={styles.addNewButton}
                    onPress={() => setShowAddForm(true)}
                  >
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={styles.addNewButtonText}>Add New Payment Method</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.limitReachedContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                    <Text style={styles.limitReachedText}>All payment method slots are filled</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <AddPaymentMethod
              visible={showAddForm}
              onClose={handleCancel}
              onSaveBank={handleSave}
              onSaveCard={handleSave}
              banks={BANKS}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Action Button Component (Single Responsibility)
const ActionButton = ({ icon, text, onPress, variant = 'danger' }) => {
  const buttonStyle = variant === 'danger' ? styles.deleteButton : styles.primaryButton;
  const textStyle = variant === 'danger' ? styles.deleteButtonText : styles.primaryButtonText;
  const iconColor = variant === 'danger' ? colors.red : colors.blueGreen;
  
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

// Saved Card Card Component
const SavedCardCard = ({ card, onDelete }) => (
  <View style={styles.professionalCard}>
    <View style={styles.cardHeader}>
      <View style={styles.cardMainInfo}>
        <View style={styles.cardIcon}>
          <Ionicons name="card" size={18} color={colors.blueGreen} />
        </View>
        <View style={styles.cardPrimaryInfo}>
          <Text style={styles.cardBrand}>{card.brand}</Text>
          <Text style={styles.cardNumber}>•••• {card.last4}</Text>
        </View>
      </View>
      {card.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>DEFAULT</Text>
        </View>
      )}
    </View>
    
    <View style={styles.cardDetailsGrid}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Nickname</Text>
        <Text style={styles.detailValue}>{card.nickname}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Cardholder</Text>
        <Text style={styles.detailValue}>{card.cardholder}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Expires</Text>
        <Text style={styles.detailValue}>{card.expiry}</Text>
      </View>
    </View>
    
    <View style={styles.cardActions}>
      <ActionButton icon="trash-outline" text="Delete" onPress={onDelete} variant="danger" />
    </View>
  </View>
);

// Saved Bank Card Component
const SavedBankCard = ({ bank, onDelete, onMakeDefault }) => (
  <View style={styles.professionalCard}>
    <View style={styles.cardHeader}>
      <View style={styles.cardMainInfo}>
        <View style={styles.cardIcon}>
          <Ionicons name="business" size={18} color={colors.blueGreen} />
        </View>
        <View style={styles.cardPrimaryInfo}>
          <Text style={styles.cardBrand}>{bank.bankName}</Text>
          <Text style={styles.cardNumber}>•••• {bank.last4} · {bank.branch}</Text>
        </View>
      </View>
      {bank.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>DEFAULT</Text>
        </View>
      )}
    </View>
    
    <View style={styles.cardDetailsGrid}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Account Holder</Text>
        <Text style={styles.detailValue}>{bank.accountHolder}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Account Type</Text>
        <Text style={styles.detailValue}>{bank.accountType}</Text>
      </View>
    </View>
    
    <View style={styles.cardActions}>
      {!bank.isDefault && (
        <ActionButton icon="star-outline" text="Make Default" onPress={onMakeDefault} />
      )}
      <ActionButton icon="trash-outline" text="Delete" onPress={onDelete} variant="danger" />
    </View>
  </View>
);


// Shared Styles
const centerContent = {
  justifyContent: 'center',
  alignItems: 'center',
};

const styles = StyleSheet.create({
  // Modal Styles
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
    maxHeight: '100%',
    minHeight: 600,
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
        limitsContainer: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.lightGray,
        },
        limitsInfo: {
          backgroundColor: colors.babyBlue,
          borderRadius: borderRadius.md,
          padding: spacing.sm,
          marginBottom: spacing.sm,
        },
        limitsHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.xs,
        },
        limitsTitle: {
          fontSize: fontSize.sm,
          fontWeight: '600',
          color: colors.midnightBlue,
          marginLeft: spacing.xs,
        },
        limitsText: {
          fontSize: fontSize.sm,
          color: colors.gray,
          lineHeight: 18,
          marginBottom: spacing.xs,
        },
        limitsHighlight: {
          fontWeight: '600',
          color: colors.midnightBlue,
        },
        limitsStatus: {
          backgroundColor: colors.white,
          borderRadius: borderRadius.sm,
          padding: spacing.xs,
        },
        limitsStatusText: {
          fontSize: fontSize.xs,
          color: colors.gray,
          fontWeight: '500',
          textAlign: 'center',
        },
        modalBody: {
          flex: 1,
          padding: spacing.lg,
        },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  // Saved Methods Styles
  savedMethodsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.lg,
  },
  professionalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  cardPrimaryInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.midnightBlue,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: fontSize.sm,
    color: colors.gray,
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
  cardDetailsGrid: {
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
  },
        // Consolidated button styles
        primaryButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.sm,
          paddingVertical: 8,
          borderRadius: borderRadius.sm,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.blueGreen,
          gap: 4,
        },
        primaryButtonText: {
          fontSize: fontSize.sm,
          color: colors.blueGreen,
          fontWeight: '600',
        },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.red,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    color: colors.red,
    fontWeight: '600',
  },
  
  // Add New Button Styles
  addNewContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  addNewButton: {
    backgroundColor: colors.blueGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
        addNewButtonText: {
          fontSize: fontSize.base,
          color: colors.white,
          fontWeight: '600',
        },
        limitReachedContainer: {
          backgroundColor: colors.lightGray,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.md,
          borderRadius: borderRadius.md,
          gap: spacing.sm,
        },
        limitReachedText: {
          fontSize: fontSize.base,
          color: colors.gray,
          fontWeight: '500',
        },
});

export default PaymentMethodsModal;
