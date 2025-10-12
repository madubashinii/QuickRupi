import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { 
  TYPES, 
  createPaymentMethod, 
  updatePaymentMethod,
  getUserPaymentMethods,
  detectCardBrand,
  validateCardFormData,
  validateBankFormData,
  checkForDuplicates,
  prepareCardDataForFirestore,
  prepareBankDataForFirestore
} from '../../services/paymentMethods/paymentMethodsService';

// Constants
const USER_ID = 'L001'; // Development user ID
const DEFAULT_BANKS = [
  'Bank of Ceylon (BOC)',
  'Commercial Bank (COMB)',
  'DFCC Bank (DFCC)',
  'Hatton National Bank (HNB)',
  'National Development Bank (NDB)',
  'Nations Trust Bank (NTB)',
  'People\'s Bank (PB)',
  'Sampath Bank (SAMP)',
  'Seylan Bank (SEYB)'
];
const formatCardNumber = (text) => text.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (text) => {
  const cleaned = text.replace(/\D/g, '');
  return cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
};
const getMaskedCardDisplay = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned ? cleaned.split('').map(() => '•').join('').replace(/(.{4})/g, '$1 ').trim() : '';
};

const INITIAL_BANK_DATA = {
  accountHolderName: '',
  bankName: '',
  branch: '',
  accountNumber: '',
  accountType: 'savings',
  isDefault: false,
};

const INITIAL_CARD_DATA = {
  cardNickname: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardholderName: '',
  isDefault: false,
};


// Add Payment Method Component
const AddPaymentMethod = ({ 
  visible, 
  onClose, 
  onSave,
  mode = 'add', // 'add' or 'edit'
  initialData = null, // payment method data when editing
  banks = DEFAULT_BANKS 
}) => {
  const [activeTab, setActiveTab] = useState('bank');
  const [bankData, setBankData] = useState(INITIAL_BANK_DATA);
  const [cardData, setCardData] = useState(INITIAL_CARD_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBankModal, setShowBankModal] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      if (initialData.type === 'bank') {
        setActiveTab('bank');
        setBankData({
          accountHolderName: initialData.accountHolder || '',
          bankName: initialData.bankName || '',
          branch: initialData.branch || '',
          accountNumber: initialData.accountNumberMasked || '', // Use masked for display
          accountType: initialData.accountType || 'savings',
          isDefault: initialData.isDefault || false,
        });
      } else if (initialData.type === 'card') {
        setActiveTab('card');
        // Format expiry for display (MMYY -> MM/YY)
        const formattedExpiry = initialData.expiry 
          ? (initialData.expiry.length === 4 
              ? `${initialData.expiry.slice(0, 2)}/${initialData.expiry.slice(2)}` 
              : initialData.expiry)
          : '';
        
        setCardData({
          cardNickname: initialData.nickname || '',
          cardNumber: `•••• •••• •••• ${initialData.last4 || ''}`, // Display masked
          expiry: formattedExpiry,
          cvv: '', // Never populate CVV for security
          cardholderName: initialData.cardholder || '',
          isDefault: initialData.isDefault || false,
        });
      }
    } else {
      // Reset to initial state when adding new
      setBankData(INITIAL_BANK_DATA);
      setCardData(INITIAL_CARD_DATA);
      setActiveTab('bank');
    }
  }, [mode, initialData, visible]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  const handleSave = async () => {
    const isBank = activeTab === 'bank';
    const data = isBank ? bankData : cardData;
    const type = isBank ? TYPES.BANK : TYPES.CARD;
    const limit = isBank ? 1 : 2;
    const prepareData = isBank ? prepareBankDataForFirestore : prepareCardDataForFirestore;

    try {
      setLoading(true);
      setErrors({});

      if (mode === 'edit') {
        // Edit mode: Only validate editable fields
        const editErrors = [];
        
        if (isBank) {
          if (!data.accountHolderName?.trim()) editErrors.push('Account holder name is required');
          if (!data.branch?.trim()) editErrors.push('Branch is required');
        } else {
          // For cards, validate only editable fields
          if (!data.cardholderName?.trim()) editErrors.push('Cardholder name is required');
          if (!data.expiry || data.expiry.length !== 5) editErrors.push('Valid expiry date is required (MM/YY)');
        }

        if (editErrors.length > 0) {
          setErrors({ [activeTab]: editErrors });
          return;
        }

        // Prepare update data with only editable fields
        const updateData = {
          isDefault: data.isDefault,
        };

        if (isBank) {
          updateData.accountHolder = data.accountHolderName;
          updateData.branch = data.branch;
          updateData.accountType = data.accountType;
        } else {
          updateData.nickname = data.cardNickname;
          updateData.cardholder = data.cardholderName;
          updateData.expiry = data.expiry.replace('/', '');
        }

        // Update payment method in Firestore
        await updatePaymentMethod(initialData.id, updateData);
        
        // Reset form data
        isBank ? setBankData(INITIAL_BANK_DATA) : setCardData(INITIAL_CARD_DATA);
        
        // Refresh parent data
        if (onSave) await onSave({ id: initialData.id, ...updateData });

        Alert.alert(
          'Success', 
          `${isBank ? 'Bank account' : 'Card'} updated successfully!`, 
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        // Add mode: Full validation required
        const validation = isBank ? validateBankFormData(data) : validateCardFormData(data);
        
        if (!validation.isValid) {
          setErrors({ [activeTab]: validation.errors });
          return;
        }
        // Add mode: Create new payment method
        
        // Check limits
        const existing = await getUserPaymentMethods(USER_ID, type);
        if (existing.length >= limit) {
          Alert.alert('Limit Reached', `You can only have ${limit} ${isBank ? 'bank account' : 'cards'}. Please remove an existing one first.`);
          return;
        }

        // Check for duplicates
        if (await checkForDuplicates(getUserPaymentMethods, USER_ID, type, data)) {
          Alert.alert('Duplicate', `This ${isBank ? 'account' : 'card'} is already registered.`);
          return;
        }

        // Validate card brand for cards
        if (!isBank && !detectCardBrand(data.cardNumber)) {
          setErrors({ card: ['Invalid card number - unsupported card type'] });
          return;
        }

        const formData = prepareData(data, USER_ID);
        const paymentMethodId = await createPaymentMethod(formData);
        
        isBank ? setBankData(INITIAL_BANK_DATA) : setCardData(INITIAL_CARD_DATA);
        
        if (onSave) await onSave({ id: paymentMethodId, ...formData });

        Alert.alert('Success', `${isBank ? 'Bank account' : 'Card'} added successfully!`, [{ text: 'OK', onPress: onClose }]);
      }

    } catch (error) {
      console.error('Save error:', error);
      setErrors({ [activeTab]: [error.message || 'Failed to save'] });
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {mode === 'add' && (
        <View style={styles.tabContainer}>
          <TabButton 
            label="Bank Account" 
            isActive={activeTab === 'bank'} 
            onPress={() => handleTabChange('bank')} 
          />
          <TabButton 
            label="Card" 
            isActive={activeTab === 'card'} 
            onPress={() => handleTabChange('card')} 
          />
        </View>
      )}

      <ScrollView 
        style={styles.formScrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'bank' ? (
          <BankAccountForm 
            data={bankData} 
            setData={setBankData} 
            errors={errors.bank}
            onBankModalOpen={() => setShowBankModal(true)}
            mode={mode}
          />
        ) : (
          <CardForm 
            data={cardData} 
            setData={setCardData}
            errors={errors.card}
            mode={mode}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              {mode === 'edit' ? 'Update' : 'Save'} {activeTab === 'bank' ? 'Bank Account' : 'Card'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bank Selection Modal */}
      {showBankModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Bank</Text>
                <TouchableOpacity onPress={() => setShowBankModal(false)}>
                  <Ionicons name="close" size={24} color={colors.gray} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {banks.map((bank, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.bankItem}
                    onPress={() => {
                      setBankData({ ...bankData, bankName: bank });
                      setShowBankModal(false);
                    }}
                  >
                    <Text style={styles.bankItemText}>{bank}</Text>
                    {bankData.bankName === bank && <Ionicons name="checkmark" size={20} color={colors.blueGreen} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

// Reusable Components
const TabButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity style={[styles.tab, isActive && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
  </TouchableOpacity>
);

const FormField = ({ label, value, onChangeText, placeholder, keyboardType, maxLength, secureTextEntry, required }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>
      {label}{required && <Text style={styles.requiredAsterisk}> *</Text>}
    </Text>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.gray}
      autoCapitalize={keyboardType === 'numeric' ? 'none' : 'words'}
      autoCorrect={false}
    />
  </View>
);

const RadioButton = ({ label, value, selected, onSelect }) => (
  <TouchableOpacity style={styles.radioOption} onPress={() => onSelect(value)}>
    <View style={[styles.radioButton, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioText}>{label}</Text>
  </TouchableOpacity>
);

const ErrorDisplay = ({ errors }) => errors?.length > 0 && (
  <View style={styles.errorContainer}>
    {errors.map((error, idx) => <Text key={idx} style={styles.errorText}>• {error}</Text>)}
  </View>
);

const BankAccountForm = ({ data, setData, errors, onBankModalOpen, mode = 'add' }) => (
  <View style={styles.formContainer}>
    <ErrorDisplay errors={errors} />
    <FormField 
      label="Account Holder Name" 
      value={data.accountHolderName} 
      onChangeText={(text) => setData({ ...data, accountHolderName: text })} 
      placeholder="Enter full name" 
      required 
    />
    
    <TouchableOpacity 
      style={styles.inputGroup} 
      onPress={mode === 'add' ? onBankModalOpen : null}
      disabled={mode === 'edit'}
    >
      <Text style={styles.inputLabel}>Bank Name<Text style={styles.requiredAsterisk}> *</Text></Text>
      <View style={[styles.dropdownContainer, mode === 'edit' && styles.disabledInput]}>
        <Text style={[styles.dropdownText, !data.bankName && styles.placeholderText]}>
          {data.bankName || 'Select Bank'}
        </Text>
        {mode === 'add' && <Ionicons name="chevron-down" size={20} color={colors.gray} />}
        {mode === 'edit' && <Ionicons name="lock-closed" size={16} color={colors.gray} />}
      </View>
    </TouchableOpacity>

    <FormField 
      label="Branch" 
      value={data.branch} 
      onChangeText={(text) => setData({ ...data, branch: text })} 
      placeholder="Enter branch name" 
      required 
    />
    
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        Account Number<Text style={styles.requiredAsterisk}> *</Text>
      </Text>
      <TextInput
        style={[styles.textInput, mode === 'edit' && styles.disabledInput]}
        value={data.accountNumber}
        onChangeText={mode === 'add' ? (text) => setData({ ...data, accountNumber: text }) : null}
        placeholder="Enter account number"
        keyboardType="numeric"
        placeholderTextColor={colors.gray}
        editable={mode === 'add'}
      />
      {mode === 'edit' && (
        <View style={styles.fieldNote}>
          <Ionicons name="lock-closed" size={12} color={colors.gray} />
          <Text style={styles.fieldNoteText}>Account number cannot be changed</Text>
        </View>
      )}
    </View>
    
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Account Type</Text>
      <View style={styles.radioContainer}>
        <RadioButton 
          label="Savings" 
          value="savings" 
          selected={data.accountType === 'savings'} 
          onSelect={(v) => setData({ ...data, accountType: v })} 
        />
        <RadioButton 
          label="Current" 
          value="current" 
          selected={data.accountType === 'current'} 
          onSelect={(v) => setData({ ...data, accountType: v })} 
        />
      </View>
    </View>

    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>Set as Default for Withdrawals</Text>
      <Switch 
        value={data.isDefault} 
        onValueChange={(v) => setData({ ...data, isDefault: v })} 
        trackColor={{ false: colors.lightGray, true: colors.blueGreen }} 
        thumbColor={colors.white} 
      />
    </View>
  </View>
);

const CardForm = ({ data, setData, errors, mode = 'add' }) => (
  <View style={styles.formContainer}>
    <ErrorDisplay errors={errors} />
    <FormField 
      label="Card Nickname (Optional)" 
      value={data.cardNickname} 
      onChangeText={(text) => setData({ ...data, cardNickname: text })} 
      placeholder="e.g., Visa Personal" 
    />
    
    {/* Masked Card Number Input */}
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Card Number<Text style={styles.requiredAsterisk}> *</Text></Text>
      {mode === 'add' ? (
        <View style={styles.cardNumberContainer}>
          <TextInput
            style={[styles.textInput, styles.hiddenInput]}
            value={data.cardNumber}
            onChangeText={(text) => setData({ ...data, cardNumber: formatCardNumber(text) })}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
            placeholderTextColor={colors.gray}
          />
          <View style={styles.maskedOverlay} pointerEvents="none">
            <Text style={styles.maskedInputText}>{getMaskedCardDisplay(data.cardNumber)}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.textInput, styles.disabledInput]}>
          <Text style={styles.maskedInputText}>{data.cardNumber}</Text>
        </View>
      )}
      {data.cardNumber && mode === 'add' && (
        <View style={styles.cardInfoContainer}>
          <Ionicons name="shield-checkmark" size={12} color={colors.blueGreen} />
          <Text style={styles.cardInfoText}>Secured with encryption</Text>
        </View>
      )}
      {mode === 'edit' && (
        <View style={styles.fieldNote}>
          <Ionicons name="lock-closed" size={12} color={colors.gray} />
          <Text style={styles.fieldNoteText}>Card number cannot be changed</Text>
        </View>
      )}
    </View>
    
    <View style={styles.rowContainer}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <FormField 
          label="Expiry (MM/YY)" 
          value={data.expiry} 
          onChangeText={(text) => setData({ ...data, expiry: formatExpiry(text) })} 
          placeholder="12/25" 
          keyboardType="numeric" 
          maxLength={5} 
          required 
        />
      </View>
      {mode === 'add' && (
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <FormField 
            label="CVV" 
            value={data.cvv} 
            onChangeText={(text) => setData({ ...data, cvv: text })} 
            placeholder="123" 
            keyboardType="numeric" 
            maxLength={3} 
            secureTextEntry 
            required 
          />
        </View>
      )}
    </View>

    <FormField 
      label="Cardholder Name" 
      value={data.cardholderName} 
      onChangeText={(text) => setData({ ...data, cardholderName: text })} 
      placeholder="Enter cardholder name" 
      required 
    />
    
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>Set as Default for Deposits</Text>
      <Switch 
        value={data.isDefault} 
        onValueChange={(v) => setData({ ...data, isDefault: v })} 
        trackColor={{ false: colors.lightGray, true: colors.blueGreen }} 
        thumbColor={colors.white} 
      />
    </View>
  </View>
);

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    margin: spacing.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  formScrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  formContainer: {
    paddingVertical: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    backgroundColor: colors.white,
    minHeight: 40,
    fontWeight: '400',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  fieldNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  fieldNoteText: {
    fontSize: fontSize.xs,
    color: colors.gray,
    fontStyle: 'italic',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    minHeight: 40,
  },
  dropdownText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
  },
  placeholderText: {
    color: colors.gray,
  },
  cardNumberContainer: {
    position: 'relative',
    width: '100%',
  },
  hiddenInput: {
    color: 'transparent',
    caretColor: colors.blueGreen,
  },
  maskedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  maskedInputText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  cardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  cardInfoText: {
    fontSize: fontSize.xs,
    color: colors.gray,
    fontStyle: 'italic',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.blueGreen,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueGreen,
  },
  radioText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.white,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    color: colors.gray,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.blueGreen,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: colors.red,
    fontSize: fontSize.sm,
  },
  errorInput: {
    borderColor: colors.red,
    borderWidth: 1.5,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.red,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    width: '90%',
    maxHeight: '70%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.lightGray,
  },
  bankItemText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '500',
  },
});

export default AddPaymentMethod;
