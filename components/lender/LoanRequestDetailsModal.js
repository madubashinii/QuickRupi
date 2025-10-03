import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// ===== SOLID PRINCIPLES IMPLEMENTATION =====

// Single Responsibility: Data formatting utilities
const Formatter = {
  currency: (amount) => `LKR ${amount.toLocaleString()}`,
  percentage: (value) => `${value}%`,
  months: (value) => `${value} months`,
};

// Single Responsibility: Configuration management
const Config = {
  RISK_LEVELS: {
    'Low': { color: colors.forestGreen, bgColor: '#E8F5E8', icon: 'shield-checkmark' },
    'Medium': { color: '#FFB347', bgColor: '#FFF3E0', icon: 'shield-half' },
    'High': { color: colors.red, bgColor: '#FFEBEE', icon: 'shield' },
    default: { color: colors.gray, bgColor: '#F5F5F5', icon: 'help-circle' }
  },
  DEFAULT_VALUES: {
    requestId: 'REQ001',
    city: 'Colombo',
    occupation: 'Business Owner',
    incomeBand: 'LKR 50,000 - 100,000',
    monthlyIncome: 75000,
    employmentStatus: 'Self-Employed',
    purpose: 'Business expansion and working capital requirements for small retail operations.',
    businessType: 'Retail & Trade'
  }
};

// Single Responsibility: Data access abstraction
const DataAccessor = {
  getValue: (obj, key, fallback = '') => obj?.[key] ?? fallback,
  getRequestId: (request) => DataAccessor.getValue(request, 'requestId', Config.DEFAULT_VALUES.requestId),
  getCity: (request) => DataAccessor.getValue(request, 'city', Config.DEFAULT_VALUES.city),
  getOccupation: (request) => DataAccessor.getValue(request, 'occupation', Config.DEFAULT_VALUES.occupation),
  getIncomeBand: (request) => DataAccessor.getValue(request, 'incomeBand', Config.DEFAULT_VALUES.incomeBand),
  getMonthlyIncome: (request) => DataAccessor.getValue(request, 'monthlyIncome', Config.DEFAULT_VALUES.monthlyIncome),
  getEmploymentStatus: (request) => DataAccessor.getValue(request, 'employmentStatus', Config.DEFAULT_VALUES.employmentStatus),
  getPurpose: (request) => DataAccessor.getValue(request, 'purpose', Config.DEFAULT_VALUES.purpose),
  getBusinessType: (request) => DataAccessor.getValue(request, 'businessType', Config.DEFAULT_VALUES.businessType),
};

// Open/Closed: Extensible component interfaces
const ComponentFactory = {
  // Reusable atomic components
  RiskChip: ({ riskLevel }) => {
    const config = Config.RISK_LEVELS[riskLevel] || Config.RISK_LEVELS.default;
    return (
      <View style={[styles.riskChip, { backgroundColor: config.bgColor, borderColor: config.color }]}>
        <Ionicons name={config.icon} size={12} color={config.color} style={styles.riskIcon} />
        <Text style={[styles.riskChipText, { color: config.color }]}>{riskLevel}</Text>
      </View>
    );
  },

  DetailRow: ({ label, value, isHighlight = false, icon = null }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {icon && <Ionicons name={icon} size={14} color={colors.gray} style={styles.detailIcon} />}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>{value}</Text>
    </View>
  ),

  RiskRow: ({ riskLevel }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        <Ionicons name="shield" size={14} color={colors.gray} style={styles.detailIcon} />
        <Text style={styles.detailLabel}>Risk Level</Text>
      </View>
      <View style={styles.riskValueContainer}>
        <ComponentFactory.RiskChip riskLevel={riskLevel} />
      </View>
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
      <Text style={styles.requestId}>Request #{DataAccessor.getRequestId(request)}</Text>
      <Text style={styles.borrowerName}>{request.borrowerName}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color={colors.gray} style={styles.locationIcon} />
        <Text style={styles.location}>{request.location}</Text>
      </View>
    </View>
  ),
};

// Single Responsibility: Section components with clear boundaries
const SectionComponents = {
  Header: ({ request }) => (
    <View style={styles.section}>
      <ComponentFactory.HeaderCard request={request} />
    </View>
  ),

  LoanInfo: ({ request }) => (
    <ComponentFactory.Section title="Loan Request Information">
      <ComponentFactory.DetailRow 
        label="Amount Requested" 
        value={Formatter.currency(request.amountRequested)} 
        isHighlight 
        icon="wallet"
      />
      <ComponentFactory.DetailRow 
        label="Estimated APR" 
        value={Formatter.percentage(request.estAPR)} 
        isHighlight 
        icon="trending-up"
      />
      <ComponentFactory.DetailRow 
        label="Term (months)" 
        value={Formatter.months(request.termMonths)} 
        icon="calendar"
      />
      <ComponentFactory.RiskRow riskLevel={request.riskLevel} />
    </ComponentFactory.Section>
  ),

  BorrowerKYC: ({ request }) => (
    <ComponentFactory.Section title="Borrower Info (from KYC snapshot)">
      <ComponentFactory.DetailRow 
        label="Full Name" 
        value={request.borrowerName} 
        isHighlight 
        icon="person"
      />
      <ComponentFactory.DetailRow 
        label="City" 
        value={DataAccessor.getCity(request)} 
        icon="location"
      />
      <ComponentFactory.DetailRow 
        label="Occupation" 
        value={DataAccessor.getOccupation(request)} 
        icon="briefcase"
      />
      <ComponentFactory.DetailRow 
        label="Income Band" 
        value={DataAccessor.getIncomeBand(request)} 
        icon="cash"
      />
      <ComponentFactory.DetailRow 
        label="Monthly Income" 
        value={Formatter.currency(DataAccessor.getMonthlyIncome(request))} 
        isHighlight 
        icon="trending-up"
      />
      <ComponentFactory.DetailRow 
        label="Employment Status" 
        value={DataAccessor.getEmploymentStatus(request)} 
        icon="checkmark-circle"
      />
    </ComponentFactory.Section>
  ),

  Purpose: ({ request }) => (
    <ComponentFactory.Section title="Purpose">
      <Text style={styles.purposeTitle}>Business description / reason for loan</Text>
      <Text style={styles.purposeDescription}>
        {DataAccessor.getPurpose(request)}
      </Text>
      <Text style={styles.businessType}>
        Business type: {DataAccessor.getBusinessType(request)}
      </Text>
    </ComponentFactory.Section>
  ),
};

// Dependency Inversion: Abstract modal behavior
const ModalBehavior = {
  shouldRender: (visible, request) => visible && request,
  handleClose: (onClose) => onClose,
  handleFund: (onFundPress, request, onClose) => {
    onFundPress(request);
    onClose();
  },
};

// Main Modal Component - Single Responsibility for modal orchestration
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
                  <Text style={styles.modalTitle}>Browse Loan Request</Text>
                  <Text style={styles.modalTitle}>Details</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={ModalBehavior.handleClose(onClose)}>
              <Ionicons name="close-circle" size={28} color={colors.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
              <SectionComponents.Header request={request} />
              <SectionComponents.LoanInfo request={request} />
              <SectionComponents.BorrowerKYC request={request} />
              <SectionComponents.Purpose request={request} />
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
  
  // Risk Styles
  riskValueContainer: {
    flex: 0.4,
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  riskIcon: {
    marginRight: spacing.xs,
  },
  riskChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  businessType: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    fontWeight: '600',
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