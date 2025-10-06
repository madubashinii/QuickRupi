import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Constants
const STATUS_CONFIG = {
  'On time': { color: colors.blueGreen, icon: 'checkmark-circle', bgColor: '#E8F5F3' },
  'Due soon': { color: '#FFB347', icon: 'time', bgColor: '#FFF3E0' },
  'Overdue': { color: colors.red, icon: 'alert-circle', bgColor: '#FFEBEE' },
  'Paid': { color: colors.forestGreen, icon: 'checkmark-done', bgColor: '#E8F5E8' },
  'Pending': { color: '#FF6B35', icon: 'hourglass', bgColor: '#FFF0E6' },
  default: { color: colors.gray, icon: 'help-circle', bgColor: '#F5F5F5' }
};

const SAMPLE_SCHEDULE = [
  { dueDate: '2024-01-15', amount: 25000, status: 'Paid', paidDate: '2024-01-14' },
  { dueDate: '2024-02-15', amount: 25000, status: 'Pending', paidDate: null },
  { dueDate: '2024-03-15', amount: 25000, status: 'Pending', paidDate: null },
  { dueDate: '2024-04-15', amount: 25000, status: 'Pending', paidDate: null }
];

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});

const calculateProgress = (repaid, total) => Math.min(Math.max((repaid / total) * 100, 0), 100);

const getProgressColor = (progress) => {
  if (progress >= 100) return colors.forestGreen;
  if (progress >= 75) return colors.blueGreen;
  if (progress >= 50) return '#FFB347';
  return colors.red;
};

// Reusable Components
const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  return (
    <View style={[styles.statusChip, { backgroundColor: config.bgColor, borderColor: config.color }]}>
      <Ionicons name={config.icon} size={12} color={config.color} style={styles.statusIcon} />
      <Text style={[styles.statusChipText, { color: config.color }]}>{status}</Text>
    </View>
  );
};

const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[
      styles.progressBarFill, 
      { 
        width: `${calculateProgress(progress, 100)}%`, 
        backgroundColor: getProgressColor(progress) 
      }
    ]} />
  </View>
);

const DetailRow = ({ label, value, isHighlight = false }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>{value}</Text>
  </View>
);

const RepaymentRow = ({ installment }) => (
  <View style={styles.repaymentRow}>
    <Text style={styles.repaymentDateText}>{formatDate(installment.dueDate)}</Text>
    <Text style={styles.repaymentAmountText}>{formatCurrency(installment.amount)}</Text>
    <StatusChip status={installment.status} />
    <Text style={styles.repaymentPaidDateText}>{installment.paidDate ? formatDate(installment.paidDate) : '-'}</Text>
  </View>
);

// Section Components
const BorrowerSection = ({ investment }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Borrower Information</Text>
    <View style={styles.infoCard}>
      <Text style={styles.borrowerName}>{investment.borrowerName}</Text>
      <Text style={styles.borrowerLocation}>{investment.borrowerLocation || 'Colombo, Sri Lanka'}</Text>
      <StatusChip status={investment.status} />
    </View>
  </View>
);

const LoanInfoSection = ({ investment, progress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Loan Information</Text>
    <View style={styles.infoCard}>
      <DetailRow label="Amount Funded" value={formatCurrency(investment.amountFunded)} isHighlight />
      <DetailRow label="APR (actual agreed)" value={`${investment.apr}%`} isHighlight />
      <DetailRow label="Term (months)" value={`${investment.termMonths} months`} />
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
        </View>
        <ProgressBar progress={progress} />
        <Text style={styles.progressText}>
          {formatCurrency(investment.amountRepaid)} of {formatCurrency(investment.repaymentAmount)}
        </Text>
      </View>
    </View>
  </View>
);

const PurposeSection = ({ investment }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Purpose</Text>
    <View style={styles.infoCard}>
      <Text style={styles.purposeTitle}>Borrower's loan purpose description</Text>
      <Text style={styles.purposeDescription}>
        {investment.purpose || 'Business expansion and working capital requirements for small retail operations.'}
      </Text>
      <Text style={styles.businessType}>
        Business type: {investment.businessType || 'Retail & Trade'}
      </Text>
    </View>
  </View>
);

const RepaymentStatusSection = ({ investment }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Repayment Status</Text>
    <View style={styles.infoCard}>
      <DetailRow 
        label="Next Due" 
        value={`${formatDate(investment.nextDueDate || '2024-02-15')} - ${formatCurrency(investment.nextDueAmount || 25000)}`} 
        isHighlight 
      />
    </View>
  </View>
);

const RepaymentScheduleSection = ({ schedule }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Repayment Schedule</Text>
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleHeaderText}>Due Date</Text>
        <Text style={styles.scheduleHeaderText}>Amount</Text>
        <Text style={styles.scheduleHeaderText}>Status</Text>
        <Text style={styles.scheduleHeaderText}>Paid Date</Text>
      </View>
      {schedule.map((installment, index) => (
        <RepaymentRow key={index} installment={installment} />
      ))}
    </View>
  </View>
);

// Main Modal Component
export const OngoingLoanDetailsModal = ({ visible, onClose, investment }) => {
  if (!visible || !investment) return null;

  const progress = calculateProgress(investment.amountRepaid, investment.repaymentAmount);
  const schedule = investment.repaymentSchedule || SAMPLE_SCHEDULE;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="document-text" size={24} color={colors.midnightBlue} style={styles.titleIcon} />
                <Text style={styles.modalTitle}>Ongoing Loan – Details</Text>
              </View>
              <Text style={styles.loanId}>Loan #{investment.loanId || 'LN008'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={colors.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
              <BorrowerSection investment={investment} />
              <LoanInfoSection investment={investment} progress={progress} />
              <PurposeSection investment={investment} />
              <RepaymentStatusSection investment={investment} />
              <RepaymentScheduleSection schedule={schedule} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    marginBottom: spacing.xs,
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  loanId: {
    fontSize: fontSize.base,
    color: colors.gray,
    fontWeight: '600',
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
  
  // Content Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  
  // Borrower Info
  borrowerName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  borrowerLocation: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  
  // Status Chip
  statusChip: {
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
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  
  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
  },
  detailLabel: {
    fontSize: fontSize.base,
    color: colors.gray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  highlightValue: {
    color: colors.forestGreen,
    fontWeight: 'bold',
  },
  
  // Progress Section
  progressSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.tiffanyBlue,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.base,
    color: colors.gray,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    backgroundColor: colors.tiffanyBlue,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    height: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    fontWeight: '500',
  },
  
  // Purpose Section
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
  
  // Schedule Table
  scheduleCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  scheduleHeader: {
    flexDirection: 'row',
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  scheduleHeaderText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  repaymentRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
    alignItems: 'center',
  },
  repaymentDateText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    textAlign: 'center',
  },
  repaymentAmountText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  repaymentPaidDateText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default OngoingLoanDetailsModal;
