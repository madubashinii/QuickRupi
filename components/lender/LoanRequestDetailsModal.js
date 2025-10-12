import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';


//  Data formatting utilities
const Formatter = {
  currency: (amount) => `LKR ${amount.toLocaleString()}`,
  percentage: (value) => `${value}%`,
  months: (value) => `${value} months`,
};

// Extensible component interfaces
const ComponentFactory = {
  // Reusable atomic components

  DetailRow: ({ label, value, isHighlight = false, icon = null }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {icon && <Ionicons name={icon} size={14} color={colors.gray} style={styles.detailIcon} />}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>{value}</Text>
    </View>
  ),


  Section: ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.infoCard}>{children}</View>
    </View>
  ),

  HeaderCard: ({ request }) => (
    <View style={styles.headerCard}>
      <>
        <Text style={styles.requestId}>Request #{request.id}</Text>
        <Text style={styles.borrowerName}>{request.borrowerName}</Text>
      </>
    </View>
  ),
};

//  Section components with clear boundaries
const SectionComponents = {
  Header: ({ request }) => (
    <View style={styles.section}>
      <ComponentFactory.HeaderCard request={request} />
    </View>
  ),

  LoanInfo: ({ request }) => (
    <ComponentFactory.Section title="Loan Request Information">
      <>
        <ComponentFactory.DetailRow 
          label="Amount Requested" 
          value={Formatter.currency(request.amountRequested)} 
          isHighlight 
          icon="wallet"
        />
        <ComponentFactory.DetailRow 
          label="Interest Rate" 
          value={Formatter.percentage(request.interestRate)} 
          isHighlight 
          icon="trending-up"
        />
        <ComponentFactory.DetailRow 
          label="Term (months)" 
          value={Formatter.months(request.termMonths)} 
          icon="calendar"
        />
      </>
    </ComponentFactory.Section>
  ),

  BorrowerInfo: ({ request }) => (
    <ComponentFactory.Section title="Borrower Information">
      <>
        <ComponentFactory.DetailRow 
          label="Full Name" 
          value={request.borrowerName} 
          isHighlight 
          icon="person"
        />
      </>
    </ComponentFactory.Section>
  ),

  Purpose: ({ request }) => (
    <ComponentFactory.Section title="Purpose">
      <>
        <Text style={styles.purposeTitle}>Purpose</Text>
        <Text style={styles.purposeDescription}>
          {request.purpose}
        </Text>
        {request.description && (
          <Text style={styles.description}>
            {request.description}
          </Text>
        )}
      </>
    </ComponentFactory.Section>
  ),
};

//  Abstract modal behavior
const ModalBehavior = {
  shouldRender: (visible, request) => visible && request,
  handleClose: (onClose) => onClose,
  handleFund: (onFundPress, request, onClose) => {
    onFundPress(request);
    onClose();
  },
};

// Main Modal Component 
export const LoanRequestDetailsModal = ({ visible, onClose, request, onFundPress }) => {
  if (!ModalBehavior.shouldRender(visible, request)) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="document-text-outline" size={24} color={colors.midnightBlue} style={styles.titleIcon} />
                <View>
                  <>
                    <Text style={styles.modalTitle}>Browse Loan Request</Text>
                    <Text style={styles.modalTitle}>Details</Text>
                  </>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={ModalBehavior.handleClose(onClose)}>
              <Ionicons name="close-circle" size={28} color={colors.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
              <>
                <SectionComponents.Header request={request} />
                <SectionComponents.LoanInfo request={request} />
                <SectionComponents.BorrowerInfo request={request} />
                <SectionComponents.Purpose request={request} />
              </>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={ModalBehavior.handleClose(onClose)}>
              <Ionicons name="arrow-back" size={16} color={colors.midnightBlue} style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}> Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.fundButton} 
              onPress={() => ModalBehavior.handleFund(onFundPress, request, onClose)}
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

// Styles
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
  
  // Detail Row Styles
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
    minHeight: 48,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.6,
    paddingRight: spacing.sm,
  },
  detailIcon: {
    marginRight: spacing.sm,
    width: 16,
    textAlign: 'center',
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
    textAlign: 'right',
    flex: 0.4,
    marginLeft: spacing.sm,
  },
  highlightValue: {
    color: colors.forestGreen,
    fontWeight: 'bold',
  },
  
  // Purpose Styles
  purposeTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
  },
  purposeDescription: {
    fontSize: fontSize.base,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
    marginTop: spacing.xs,
    fontStyle: 'italic',
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

export default LoanRequestDetailsModal;