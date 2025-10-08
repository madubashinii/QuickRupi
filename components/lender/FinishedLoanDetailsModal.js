import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Status Chip Component
const StatusChip = ({ status }) => (
  <View style={[styles.statusChip, styles.repaidChip]}>
    <Ionicons name="checkmark-circle" size={16} color={colors.forestGreen} />
    <Text style={styles.statusText}>Repaid</Text>
  </View>
);

// Summary Item Component
const SummaryItem = ({ label, value, isCurrency = false, isPercentage = false }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>
      {isCurrency ? formatCurrency(value) : isPercentage ? `${value}%` : value}
    </Text>
  </View>
);

// Repayment History Row Component
const RepaymentRow = ({ installment }) => (
  <View style={styles.repaymentRow}>
    <Text style={styles.repaymentDate}>{formatDate(installment.date)}</Text>
    <Text style={styles.repaymentAmount}>{formatCurrency(installment.amount)}</Text>
    <View style={styles.paidStatus}>
      <Ionicons name="checkmark-circle" size={16} color={colors.forestGreen} />
      <Text style={styles.paidText}>Paid</Text>
    </View>
  </View>
);

// Main Modal Component
export const FinishedLoanDetailsModal = ({ visible, onClose, investment }) => {
  if (!visible || !investment) return null;

  const handleDownloadReport = () => {
    Alert.alert(
      'Download Report',
      'PDF report download functionality will be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const returnPercentage = ((investment.interestEarned / investment.principalAmount) * 100).toFixed(1);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="document-text" size={24} color={colors.midnightBlue} />
              <Text style={styles.title}>Finished Loan – Details</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Loan ID and Borrower Info */}
            <View style={styles.loanInfoSection}>
              <Text style={styles.loanId}>Loan ID: {investment.loanId || 'BRW-201'}</Text>
              <View style={styles.borrowerInfo}>
                <Text style={styles.borrowerName}>{investment.borrowerName}</Text>
                <Text style={styles.borrowerLocation}>{investment.borrowerLocation || 'Colombo, Sri Lanka'}</Text>
              </View>
              <StatusChip status="repaid" />
            </View>

            {/* Loan Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loan Summary</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem 
                  label="Principal Funded" 
                  value={investment.principalAmount} 
                  isCurrency={true} 
                />
                <SummaryItem 
                  label="Interest Earned" 
                  value={investment.interestEarned} 
                  isCurrency={true} 
                />
                <SummaryItem 
                  label="Total Return" 
                  value={investment.principalAmount + investment.interestEarned} 
                  isCurrency={true} 
                />
                <SummaryItem 
                  label="Return %" 
                  value={returnPercentage} 
                  isPercentage={true} 
                />
                <SummaryItem 
                  label="Actual APR" 
                  value={investment.actualAPR || investment.estAPR} 
                  isPercentage={true} 
                />
                <SummaryItem 
                  label="Term" 
                  value={`${investment.termMonths} months`} 
                />
              </View>
            </View>

            {/* Purpose */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purpose</Text>
              <Text style={styles.purposeText}>{investment.loanPurpose}</Text>
            </View>

            {/* Repayment History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Repayment History</Text>
              <View style={styles.repaymentTable}>
                <View style={styles.repaymentHeader}>
                  <Text style={styles.repaymentHeaderText}>Date</Text>
                  <Text style={styles.repaymentHeaderText}>Amount</Text>
                  <Text style={styles.repaymentHeaderText}>Status</Text>
                </View>
                {investment.repaymentHistory?.map((installment, index) => (
                  <RepaymentRow key={index} installment={installment} />
                )) || (
                  // Fallback data if repayment history is not available
                  Array.from({ length: investment.termMonths || 6 }, (_, index) => (
                    <RepaymentRow 
                      key={index} 
                      installment={{
                        date: new Date(Date.now() - (investment.termMonths - index - 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: Math.round((investment.principalAmount + investment.interestEarned) / (investment.termMonths || 6))
                      }} 
                    />
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadReport}>
              <Ionicons name="download-outline" size={20} color={colors.white} />
              <Text style={styles.downloadButtonText}>Download Report (PDF)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    margin: spacing.xs,
    height: '70%',
    width: '90%',
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginLeft: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loanInfoSection: {
    marginBottom: spacing.lg,
  },
  loanId: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
  },
  borrowerInfo: {
    marginBottom: spacing.sm,
  },
  borrowerName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: 2,
  },
  borrowerLocation: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  repaidChip: {
    backgroundColor: colors.babyBlue,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    backgroundColor: colors.babyBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.tiffanyBlue,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: 'bold',
  },
  purposeText: {
    fontSize: fontSize.base,
    color: colors.forestGreen,
    lineHeight: 20,
    backgroundColor: colors.babyBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
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
  paidStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidText: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.babyBlue,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  downloadButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
