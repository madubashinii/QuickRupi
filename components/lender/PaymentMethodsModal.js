import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AddPaymentMethod from './AddPaymentMethod';
import { 
  getUserPaymentMethods, 
  createPaymentMethod, 
  deletePaymentMethod, 
  setDefaultPaymentMethod,
  TYPES
} from '../../services/paymentMethods/paymentMethodsService';

// Payment Method Limits
const MAX_CARDS = 2;
const MAX_BANK_ACCOUNTS = 1;


// Payment Methods Modal
const PaymentMethodsModal = ({ visible, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [limitsExpanded, setLimitsExpanded] = useState(false);
  const [editMode, setEditMode] = useState('add'); // 'add' or 'edit'
  const [editData, setEditData] = useState(null);

  // Load payment methods from Firestore
  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using hardcoded user ID for development
      const userId = 'L001';
      const methods = await getUserPaymentMethods(userId);
      setPaymentMethods(methods);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
    }
  }, [visible]);

  // Current payment method counts
  const currentCards = paymentMethods.filter(m => m.type === TYPES.CARD).length;
  const currentBanks = paymentMethods.filter(m => m.type === TYPES.BANK).length;

  // Check if limits are reached
  const isCardLimitReached = currentCards >= MAX_CARDS;
  const isBankLimitReached = currentBanks >= MAX_BANK_ACCOUNTS;
  const canAddMore = !isCardLimitReached || !isBankLimitReached;

  // CRUD Operations
  const handleCreatePaymentMethod = async (formData) => {
    try {
      // AddPaymentMethod component now handles the data transformation and saving
      // This function just refreshes the data after successful addition
      await loadPaymentMethods();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error refreshing payment methods:', err);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deletePaymentMethod(paymentMethodId);
              await loadPaymentMethods(); // Refresh data
              Alert.alert('Success', 'Payment method deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete payment method');
              console.error('Error deleting payment method:', err);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      setLoading(true);
      
      // Using hardcoded user ID for development
      const userId = 'L001';
      await setDefaultPaymentMethod(paymentMethodId, userId);
      await loadPaymentMethods(); // Refresh data
      Alert.alert('Success', 'Default payment method updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to set default payment method');
      console.error('Error setting default:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers following Single Responsibility Principle
  const handleCancel = () => {
    setShowAddForm(false);
    setEditMode('add');
    setEditData(null);
  };

  const handleEditPaymentMethod = (paymentMethod) => {
    setEditMode('edit');
    setEditData(paymentMethod);
    setShowAddForm(true);
  };

  // Security Notice Component
  const SecurityNotice = () => (
    <ExpandableSection
      title="Your Data is Safe With Us"
      icon="shield-checkmark"
      isExpanded={securityExpanded}
      onToggle={() => setSecurityExpanded(!securityExpanded)}
      variant="primary"
    >
      <Text style={styles.expandableDescription}>
        We use <Text style={styles.expandableHighlight}>bank-grade 256-bit encryption</Text> to protect your payment information. 
        Your sensitive data is encrypted before storage and never stored in plain text.
      </Text>
      <View style={styles.expandableFeatures}>
        <View style={styles.expandableFeature}>
          <Ionicons name="lock-closed" size={12} color={colors.green} />
          <Text style={styles.expandableFeatureText}>End-to-end encrypted</Text>
        </View>
        <View style={styles.expandableFeature}>
          <Ionicons name="eye-off" size={12} color={colors.green} />
          <Text style={styles.expandableFeatureText}>Never shared</Text>
        </View>
        <View style={styles.expandableFeature}>
          <Ionicons name="shield" size={12} color={colors.green} />
          <Text style={styles.expandableFeatureText}>PCI compliant</Text>
        </View>
      </View>
    </ExpandableSection>
  );

  // Limits Info Component
  const LimitsInfo = () => {
    const headerBadge = (
      <View style={styles.expandableBadge}>
        <Text style={styles.expandableBadgeText}>
          {currentCards}/{MAX_CARDS} • {currentBanks}/{MAX_BANK_ACCOUNTS}
        </Text>
      </View>
    );

    return (
      <ExpandableSection
        title="Payment Method Limits"
        icon="information-circle-outline"
        isExpanded={limitsExpanded}
        onToggle={() => setLimitsExpanded(!limitsExpanded)}
        variant="secondary"
        headerBadge={headerBadge}
      >
        <Text style={styles.expandableDescription}>
          You can add up to <Text style={styles.expandableHighlight}>{MAX_CARDS} cards</Text> and <Text style={styles.expandableHighlight}>{MAX_BANK_ACCOUNTS} bank account</Text>.
        </Text>
        <Text style={styles.expandableReason}>
          <Text style={styles.expandableReasonLabel}>Why these limits? </Text>
          To ensure your financial security and comply with regulatory requirements, we carefully monitor and limit the number of payment methods. This helps prevent unauthorized access and reduces fraud risk while keeping your account manageable.
        </Text>
      </ExpandableSection>
    );
  };

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

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadPaymentMethods} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showAddForm ? (
            <>
              {/* Security Notice */}
              <View style={styles.securityContainer}>
                <SecurityNotice />
              </View>

              {/* Payment Method Limits Info */}
              <View style={styles.limitsContainer}>
                <LimitsInfo />
              </View>

              {/* Saved Payment Methods */}
              <ScrollView style={styles.modalBody}>
                <View style={styles.savedMethodsContainer}>
                  <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
                  
                  {paymentMethods.filter(method => method.type === TYPES.CARD).map(card => (
                    <SavedCardCard 
                      key={card.id}
                      card={card} 
                      onEdit={() => handleEditPaymentMethod(card)}
                      onDelete={() => handleDeletePaymentMethod(card.id)}
                    />
                  ))}
                  
                   {paymentMethods.filter(method => method.type === TYPES.BANK).map(bank => (
                    <SavedBankCard 
                      key={bank.id}
                      bank={bank} 
                      onEdit={() => handleEditPaymentMethod(bank)}
                      onDelete={() => handleDeletePaymentMethod(bank.id)}
                      onMakeDefault={() => handleSetDefault(bank.id)}
                    />
                  ))}
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
              onSave={handleCreatePaymentMethod}
              mode={editMode}
              initialData={editData}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Reusable Expandable Section Component
const ExpandableSection = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children, 
  headerBadge,
  variant = 'primary' 
}) => {
  const containerStyle = variant === 'primary' 
    ? styles.expandableSection 
    : styles.expandableSectionSecondary;

  return (
    <View style={containerStyle}>
      <TouchableOpacity 
        style={styles.expandableHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.expandableHeaderContent}>
          <View style={styles.expandableIconContainer}>
            <Ionicons name={icon} size={18} color={colors.blueGreen} />
          </View>
          <Text style={styles.expandableTitle}>{title}</Text>
          {headerBadge}
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.blueGreen} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandableContent}>
          {children}
        </View>
      )}
    </View>
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
const SavedCardCard = ({ card, onDelete, onEdit }) => {
  // Get brand display name
  const getBrandDisplayName = (brand) => {
    const brandMap = {
      'visa': 'Visa',
      'mastercard': 'Mastercard', 
      'amex': 'American Express',
      'discover': 'Discover'
    };
    return brandMap[brand] || brand?.toUpperCase() || 'Card';
  };

  // Format expiry date
  const formatExpiry = (expiry) => {
    if (!expiry) return 'N/A';
    return expiry.length === 4 ? `${expiry.slice(0, 2)}/${expiry.slice(2)}` : expiry;
  };

  return (
    <View style={styles.professionalCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardMainInfo}>
          <View style={styles.cardIcon}>
            <Ionicons name="card" size={18} color={colors.blueGreen} />
          </View>
          <View style={styles.cardPrimaryInfo}>
            <Text style={styles.cardBrand}>{getBrandDisplayName(card.brand)}</Text>
            <Text style={styles.cardNumber}>•••• {card.last4 || '****'}</Text>
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
          <Text style={styles.detailValue}>{card.nickname || 'No nickname'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Cardholder</Text>
          <Text style={styles.detailValue}>{card.cardholder || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Expires</Text>
          <Text style={styles.detailValue}>{formatExpiry(card.expiry)}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <ActionButton icon="create-outline" text="Edit" onPress={onEdit} variant="primary" />
        <ActionButton icon="trash-outline" text="Delete" onPress={onDelete} variant="danger" />
      </View>
    </View>
  );
};

// Saved Bank Card Component
const SavedBankCard = ({ bank, onDelete, onMakeDefault, onEdit }) => {
  // Get masked account number for display
  const getMaskedAccountNumber = () => {
    // Use the masked version from Firestore if available
    if (bank.accountNumberMasked) {
      return bank.accountNumberMasked;
    }
    
    // Fallback: if we have the encrypted account number, we can't display it
    // This should not happen in normal flow, but provides safety
    return '••••****';
  };

  // Format account type display
  const formatAccountType = (accountType) => {
    const typeMap = {
      'savings': 'Savings Account',
      'checking': 'Checking Account', 
      'current': 'Current Account'
    };
    return typeMap[accountType] || accountType || 'Account';
  };

  return (
    <View style={styles.professionalCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardMainInfo}>
          <View style={styles.cardIcon}>
            <Ionicons name="business" size={18} color={colors.blueGreen} />
          </View>
          <View style={styles.cardPrimaryInfo}>
            <Text style={styles.cardBrand}>{bank.bankName || 'Bank Account'}</Text>
            <Text style={styles.cardNumber}>
              {getMaskedAccountNumber()}
              {bank.branch && ` • ${bank.branch}`}
            </Text>
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
          <Text style={styles.detailValue}>{bank.accountHolder || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Account Type</Text>
          <Text style={styles.detailValue}>{formatAccountType(bank.accountType)}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        {!bank.isDefault && (
          <ActionButton icon="star-outline" text="Make Default" onPress={onMakeDefault} variant="primary" />
        )}
        <ActionButton icon="create-outline" text="Edit" onPress={onEdit} variant="primary" />
        <ActionButton icon="trash-outline" text="Delete" onPress={onDelete} variant="danger" />
      </View>
    </View>
  );
};


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
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.gray,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.sm,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '100%',
    minHeight: 700,
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
        // Reusable Expandable Section Styles
        securityContainer: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        },
        limitsContainer: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.lightGray,
        },
        expandableSection: {
          backgroundColor: '#E8F5F1',
          borderRadius: borderRadius.md,
          borderLeftWidth: 4,
          borderLeftColor: colors.blueGreen,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          overflow: 'hidden',
        },
        expandableSectionSecondary: {
          backgroundColor: colors.babyBlue,
          borderRadius: borderRadius.md,
          marginBottom: spacing.sm,
          borderLeftWidth: 4,
          borderLeftColor: colors.blueGreen,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          overflow: 'hidden',
        },
        expandableHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.md,
        },
        expandableHeaderContent: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        expandableIconContainer: {
          backgroundColor: colors.white,
          borderRadius: borderRadius.round,
          padding: spacing.xs,
          marginRight: spacing.sm,
          shadowColor: colors.blueGreen,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        },
        expandableTitle: {
          fontSize: fontSize.base,
          fontWeight: '700',
          color: colors.midnightBlue,
          flex: 1,
        },
        expandableBadge: {
          backgroundColor: colors.white,
          borderRadius: borderRadius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          marginLeft: spacing.sm,
        },
        expandableBadgeText: {
          fontSize: 11,
          color: colors.gray,
          fontWeight: '600',
        },
        expandableContent: {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        },
        expandableDescription: {
          fontSize: fontSize.sm,
          color: colors.gray,
          lineHeight: 18,
          marginBottom: spacing.sm,
        },
        expandableHighlight: {
          fontWeight: '700',
          color: colors.blueGreen,
        },
        expandableReason: {
          fontSize: fontSize.xs,
          color: colors.gray,
          lineHeight: 16,
          fontStyle: 'italic',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          padding: spacing.sm,
          borderRadius: borderRadius.sm,
          marginTop: spacing.sm,
        },
        expandableReasonLabel: {
          fontWeight: '600',
          color: colors.midnightBlue,
          fontStyle: 'normal',
        },
        expandableFeatures: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        },
        expandableFeature: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: borderRadius.sm,
          gap: 4,
        },
        expandableFeatureText: {
          fontSize: 11,
          color: colors.gray,
          fontWeight: '600',
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
