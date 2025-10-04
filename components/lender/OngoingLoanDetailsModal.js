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
    <View style={styles.statusChip}>
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

const DetailRow = ({ label, value, isHighlight = false, icon = null }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      {icon && <Ionicons name={icon} size={14} color={colors.gray} style={styles.detailIcon} />}
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>{value}</Text>
  </View>
);

const RepaymentRow = ({ installment }) => (
  <View style={styles.repaymentRow}>
    <Text style={styles.repaymentDate}>{formatDate(installment.dueDate)}</Text>
    <Text style={styles.repaymentAmount}>{formatCurrency(installment.amount)}</Text>
    <View style={styles.statusContainer}>
      <StatusChip status={installment.status} />
    </View>
    <Text style={styles.repaymentPaidDate}>{installment.paidDate ? formatDate(installment.paidDate) : '-'}</Text>
  </View>
);

// Section Components
const BorrowerSection = ({ investment }) => (
  <View style={styles.section}>
    <View style={styles.headerCard}>
      <Text style={styles.requestId}>Loan #{investment.loanId || 'LN008'}</Text>
      <Text style={styles.borrowerName}>{investment.borrowerName}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color={colors.gray} style={styles.locationIcon} />
        <Text style={styles.location}>{investment.borrowerLocation || 'Colombo, Sri Lanka'}</Text>
      </View>
    </View>
  </View>
);

const LoanInfoSection = ({ investment, progress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Loan Information</Text>
    <View style={styles.infoCard}>
      <DetailRow 
        label="Amount Funded" 
        value={formatCurrency(investment.amountFunded)} 
        isHighlight 
        icon="wallet"
      />
      <DetailRow 
        label="APR (actual agreed)" 
        value={`${investment.apr}%`} 
        isHighlight 
        icon="trending-up"
      />
      <DetailRow 
        label="Term (months)" 
        value={`${investment.termMonths} months`} 
        icon="calendar"
      />
      
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
        icon="calendar"
      />
    </View>
  </View>
);

const RepaymentScheduleSection = ({ schedule }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Repayment Schedule</Text>
    <View style={styles.repaymentTable}>
      <View style={styles.repaymentHeader}>
        <Text style={styles.repaymentHeaderText}>Due Date</Text>
        <Text style={styles.repaymentHeaderText}>Amount</Text>
        <Text style={styles.repaymentHeaderText}>Status</Text>
        <Text style={styles.repaymentHeaderText}>Paid Date</Text>
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
                <Ionicons name="document-text-outline" size={24} color={colors.midnightBlue} style={styles.titleIcon} />
                <View>
                  <Text style={styles.modalTitle}>Browse Ongoing Loan</Text>
                  <Text style={styles.modalTitle}>Details</Text>
                </View>
              </View>
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
    width: '95%',
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
  
  // Content Sections
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
  
  // Status Chip
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  
  // Repayment Table
  repaymentTable: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  repaymentHeader: {
    flexDirection: 'row',
    backgroundColor: colors.babyBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  repaymentHeaderText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    textAlign: 'center',
  },
  repaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  repaymentDate: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    textAlign: 'center',
  },
  repaymentAmount: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repaymentPaidDate: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default OngoingLoanDetailsModal;
