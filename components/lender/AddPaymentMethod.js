import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Constants & Utilities
const DEFAULT_BANKS = ['Commercial Bank', 'HNB', 'Sampath Bank', 'People\'s Bank', 'DFCC Bank'];

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

// Utility Functions 
const maskCardNumber = (number) => number.replace(/\d(?=\d{4})/g, '*');
const resetFormData = (setData, initialData) => setData(initialData);

// Add Payment Method Component
const AddPaymentMethod = ({ 
  visible, 
  onClose, 
  onSaveBank, 
  onSaveCard, 
  banks = DEFAULT_BANKS 
}) => {
  const [activeTab, setActiveTab] = useState('bank');
  const [bankData, setBankData] = useState(INITIAL_BANK_DATA);
  const [cardData, setCardData] = useState(INITIAL_CARD_DATA);

  // Handlers 
  const handleSaveBank = () => {
    onSaveBank(bankData);
    resetFormData(setBankData, INITIAL_BANK_DATA);
  };

  const handleSaveCard = () => {
    onSaveCard(cardData);
    resetFormData(setCardData, INITIAL_CARD_DATA);
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  if (!visible) return null;

  return (
    <View style={styles.container}>
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

      <ScrollView style={styles.formScrollView}>
        {activeTab === 'bank' ? (
          <BankAccountForm data={bankData} setData={setBankData} />
        ) : (
          <CardForm data={cardData} setData={setCardData} maskCardNumber={maskCardNumber} />
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
          style={styles.saveButton}
          onPress={activeTab === 'bank' ? handleSaveBank : handleSaveCard}
        >
          <Text style={styles.saveButtonText}>
            Save {activeTab === 'bank' ? 'Bank Account' : 'Card'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tab Button Component 
const TabButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Form Field Component (handles all input types)
const FormField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType, 
  maxLength, 
  secureTextEntry, 
  required = false,
  type = 'input' 
}) => {
  const isEmpty = required && !value;
  const isError = isEmpty;
  
  const renderInput = () => (
    <TextInput
      style={[styles.textInput, isError && styles.errorInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.gray}
    />
  );

  const renderDropdown = () => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownText}>{value || placeholder}</Text>
      <Ionicons name="chevron-down" size={20} color={colors.gray} />
    </View>
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </Text>
      {type === 'dropdown' ? renderDropdown() : renderInput()}
    </View>
  );
};


// Radio Button Component 
const RadioButton = ({ label, value, selectedValue, onSelect }) => (
  <TouchableOpacity style={styles.radioOption} onPress={() => onSelect(value)}>
    <View style={[styles.radioButton, selectedValue === value && styles.radioSelected]}>
      {selectedValue === value && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioText}>{label}</Text>
  </TouchableOpacity>
);

// Toggle Component 
const FormToggle = ({ label, value, onValueChange }) => (
  <View style={styles.toggleContainer}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.lightGray, true: colors.blueGreen }}
      thumbColor={value ? colors.white : colors.gray}
    />
  </View>
);

// Form Section Component (handles grouped form elements)
const FormSection = ({ label, children }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    {children}
  </View>
);

// Bank Account Form Component 
const BankAccountForm = ({ data, setData }) => (
  <View style={styles.formContainer}>
    <FormField
      label="Account Holder Name"
      value={data.accountHolderName}
      onChangeText={(text) => setData({ ...data, accountHolderName: text })}
      placeholder="Enter full name"
      required
    />

    <FormField
      label="Bank Name"
      value={data.bankName}
      placeholder="Select Bank"
      type="dropdown"
    />

    <FormField
      label="Branch"
      value={data.branch}
      onChangeText={(text) => setData({ ...data, branch: text })}
      placeholder="Enter branch name"
      required
    />

    <FormField
      label="Account Number"
      value={data.accountNumber}
      onChangeText={(text) => setData({ ...data, accountNumber: text })}
      placeholder="Enter account number"
      keyboardType="numeric"
      required
    />

    <FormSection label="Account Type">
      <View style={styles.radioContainer}>
        <RadioButton
          label="Savings"
          value="savings"
          selectedValue={data.accountType}
          onSelect={(value) => setData({ ...data, accountType: value })}
        />
        <RadioButton
          label="Current"
          value="current"
          selectedValue={data.accountType}
          onSelect={(value) => setData({ ...data, accountType: value })}
        />
      </View>
    </FormSection>

    <FormToggle
      label="Set as Default for Withdrawals"
      value={data.isDefault}
      onValueChange={(value) => setData({ ...data, isDefault: value })}
    />
  </View>
);

// Card Form Component 
const CardForm = ({ data, setData, maskCardNumber }) => (
  <View style={styles.formContainer}>
    <FormField
      label="Card Nickname (Optional)"
      value={data.cardNickname}
      onChangeText={(text) => setData({ ...data, cardNickname: text })}
      placeholder="e.g., Visa Personal"
    />

    <FormField
      label="Card Number"
      value={data.cardNumber}
      onChangeText={(text) => setData({ ...data, cardNumber: text })}
      placeholder="1234 5678 9012 3456"
      keyboardType="numeric"
      maxLength={19}
      required
    />
    {data.cardNumber && (
      <Text style={styles.maskedText}>
        {maskCardNumber(data.cardNumber.replace(/\s/g, ''))}
      </Text>
    )}

    <View style={styles.rowContainer}>
      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
        <FormField
          label="Expiry (MM/YY)"
          value={data.expiry}
          onChangeText={(text) => setData({ ...data, expiry: text })}
          placeholder="12/25"
          keyboardType="numeric"
          maxLength={5}
          required
        />
      </View>
      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
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
    </View>

    <FormField
      label="Cardholder Name"
      value={data.cardholderName}
      onChangeText={(text) => setData({ ...data, cardholderName: text })}
      placeholder="Enter cardholder name"
      required
    />

    <FormToggle
      label="Set as Default for Deposits"
      value={data.isDefault}
      onValueChange={(value) => setData({ ...data, isDefault: value })}
    />
  </View>
);

// Shared Styles
const centerContent = {
  justifyContent: 'center',
  alignItems: 'center',
};

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
  maskedText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
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
    ...centerContent,
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
    ...centerContent,
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
    ...centerContent,
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
});

export default AddPaymentMethod;
