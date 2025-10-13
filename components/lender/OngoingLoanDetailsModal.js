import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { getRepaymentSchedule } from '../../services/repayment/repaymentService';
import { getUserDoc } from '../../services/firestoreService';

// Constants
const STATUS_CONFIG = {
  'Pending': { color: '#FF6B35', icon: 'hourglass', bgColor: '#FFF0E6' },
  'Due soon': { color: '#FFB347', icon: 'time', bgColor: '#FFF3E0' },
  'Overdue': { color: colors.red, icon: 'alert-circle', bgColor: '#FFEBEE' },
  'Paid': { color: colors.forestGreen, icon: 'checkmark-done', bgColor: '#E8F5E8' },
  default: { color: colors.gray, icon: 'help-circle', bgColor: '#F5F5F5' }
};

// Repayment schedule will be fetched from the service

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};
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

const RepaymentRow = ({ installment }) => {
  const isPaid = installment.status === 'Paid';
  
  return (
    <View style={[styles.repaymentRow, isPaid && styles.paidRow]}>
      <Text style={[styles.repaymentDate, isPaid && styles.paidText]}>
        {formatDate(installment.dueDate)}
      </Text>
      <Text style={[styles.repaymentAmount, isPaid && styles.paidText]}>
        {formatCurrency(installment.totalPayment)}
      </Text>
      <View style={styles.statusContainer}>
        <StatusChip status={installment.status} />
      </View>
      <View style={styles.paidDateContainer}>
        {installment.paidDate ? (
          <>
            {isPaid && (
              <Ionicons 
                name="checkmark-circle" 
                size={14} 
                color={colors.forestGreen} 
                style={styles.paidDateIcon} 
              />
            )}
            <Text style={[styles.repaymentPaidDate, isPaid && styles.paidDateHighlight]}>
              {formatDate(installment.paidDate)}
            </Text>
          </>
        ) : (
          <Text style={styles.repaymentPaidDate}>-</Text>
        )}
      </View>
    </View>
  );
};

// Section Components
const BorrowerSection = ({ investment, borrowerName }) => (
  <View style={styles.section}>
    <View style={styles.headerCard}>
      <Text style={styles.requestId}>Loan #{investment.loanId || 'LN008'}</Text>
      <Text style={styles.borrowerName}>{borrowerName}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color={colors.gray} style={styles.locationIcon} />
        <Text style={styles.location}>{investment.borrowerLocation || 'Colombo, Sri Lanka'}</Text>
      </View>
    </View>
  </View>
);

const LoanInfoSection = ({ investment, progress, amountRepaid, totalAmount }) => (
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
          {formatCurrency(amountRepaid)} of {formatCurrency(totalAmount)}
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

const RepaymentStatusSection = ({ repaymentData, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repayment Status</Text>
        <View style={styles.infoCard}>
          <ActivityIndicator size="small" color={colors.midnightBlue} />
        </View>
      </View>
    );
  }

  if (error || !repaymentData) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repayment Status</Text>
        <View style={styles.infoCard}>
          <Text style={styles.errorText}>Failed to load repayment status</Text>
        </View>
      </View>
    );
  }

  // Find all pending payments
  const pendingPayments = repaymentData.schedule.filter(payment => 
    payment.status === 'Pending' || payment.status === 'Due soon'
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Get the next payment
  const nextPayment = pendingPayments[0];

  // Calculate total pending amount
  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.totalPayment, 0);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Repayment Status</Text>
      <View style={styles.infoCard}>
        <DetailRow 
          label="Next Due" 
          value={nextPayment ? `${formatDate(nextPayment.dueDate)} - ${formatCurrency(nextPayment.totalPayment)}` : 'No pending payments'} 
          isHighlight 
          icon="calendar"
        />
        {pendingPayments.length > 0 && (
          <DetailRow 
            label="Pending Payments" 
            value={`${pendingPayments.length} (${formatCurrency(totalPending)})`}
            icon="alert-circle"
          />
        )}
      </View>
    </View>
  );
};

const RepaymentScheduleSection = ({ repaymentData, loading, error }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Repayment Schedule</Text>
    <View style={styles.repaymentTable}>
      <View style={styles.repaymentHeader}>
        <Text style={styles.repaymentHeaderText}>Due Date</Text>
        <Text style={styles.repaymentHeaderText}>Amount</Text>
        <Text style={styles.repaymentHeaderText}>Status</Text>
        <Text style={styles.repaymentHeaderText}>Paid Date</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.midnightBlue} />
          <Text style={styles.loadingText}>Loading repayment schedule...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color={colors.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        repaymentData?.schedule?.map((installment, index) => (
          <RepaymentRow key={index} installment={installment} />
        ))
      )}
    </View>
  </View>
);

// Main Modal Component
export const OngoingLoanDetailsModal = ({ visible, onClose, investment }) => {
  const [loading, setLoading] = useState(false);
  const [repaymentData, setRepaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [borrowerName, setBorrowerName] = useState(investment?.borrowerName || 'Unknown');

  // Fetch borrower name when modal opens
  useEffect(() => {
    const fetchBorrowerName = async () => {
      if (!investment?.borrowerId) {
        console.log('No borrowerId found in investment (modal):', investment);
        return;
      }

      try {
        const userData = await getUserDoc(investment.borrowerId);
        
        // Extract firstName and lastName from nested personalDetails or root level
        const firstName = userData?.personalDetails?.firstName || userData?.firstName;
        const lastName = userData?.personalDetails?.lastName || userData?.lastName;
        const nameWithInitials = userData?.personalDetails?.initials || userData?.nameWithInitials;
        
        console.log('Fetched borrower data (OngoingLoanDetailsModal):', { 
          borrowerId: investment.borrowerId, 
          firstName,
          lastName,
          nameWithInitials,
          personalDetails: userData?.personalDetails
        });
        
        if (userData) {
          let displayName = '';
          
          // Priority 1: Combine firstName and lastName from users collection (nested or root)
          if (firstName || lastName) {
            if (firstName && lastName) {
              displayName = `${firstName} ${lastName}`;
            } else if (firstName) {
              displayName = firstName;
            } else if (lastName) {
              displayName = lastName;
            }
            console.log('✅ Using firstName/lastName (OngoingLoanDetailsModal):', displayName);
          }
          
          // Priority 2-5: Fallbacks
          if (!displayName) {
            displayName = nameWithInitials || userData.fullName || userData.name || investment.borrowerName || investment.borrowerId;
            console.log('Using fallback name (OngoingLoanDetailsModal):', displayName);
          }
          
          setBorrowerName(displayName);
        } else {
          console.log('❌ No user data found for borrowerId:', investment.borrowerId);
          setBorrowerName(investment.borrowerName || investment.borrowerId);
        }
      } catch (error) {
        console.error(`❌ Error fetching borrower ${investment.borrowerId}:`, error);
        setBorrowerName(investment.borrowerName || investment.borrowerId);
      }
    };

    if (visible && investment?.borrowerId) {
      fetchBorrowerName();
    }
  }, [visible, investment?.borrowerId]);

  useEffect(() => {
    const fetchRepaymentData = async () => {
      if (!visible || !investment) {
        return;
      }
      
      if (!investment.repaymentId) {
        setError("No repayment schedule found for this loan");
        return;
      }
      
      setLoading(true);
      try {
        const data = await getRepaymentSchedule(investment.repaymentId);
        setRepaymentData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch repayment schedule:', err);
        setError("Failed to load repayment schedule");
        setRepaymentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRepaymentData();
  }, [visible, investment?.repaymentId]);

  if (!visible || !investment) return null;

  // Calculate progress based on number of months paid
  const calculateRepaymentProgress = () => {
    if (!repaymentData?.schedule) return 0;
    
    const totalInstallments = repaymentData.schedule.length;
    const paidInstallments = repaymentData.schedule.filter(payment => payment.status === 'Paid').length;
    
    return (paidInstallments / totalInstallments) * 100;
  };

  const progress = calculateRepaymentProgress();
  
  // Calculate total amounts for display
  const getTotalAmounts = () => {
    if (!repaymentData?.schedule) {
      return {
        amountRepaid: investment.amountRepaid || 0,
        totalAmount: investment.repaymentAmount || 0
      };
    }
    
    const paidPayments = repaymentData.schedule.filter(payment => payment.status === 'Paid');
    const amountRepaid = paidPayments.reduce((sum, payment) => sum + payment.totalPayment, 0);
    const totalAmount = repaymentData.totalAmount;
    
    return { amountRepaid, totalAmount };
  };
  
  const { amountRepaid, totalAmount } = getTotalAmounts();

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
              <BorrowerSection investment={investment} borrowerName={borrowerName} />
              <LoanInfoSection 
                investment={investment} 
                progress={progress}
                amountRepaid={amountRepaid}
                totalAmount={totalAmount}
              />
              <PurposeSection investment={investment} />
              <RepaymentStatusSection 
                repaymentData={repaymentData}
                loading={loading}
                error={error}
              />
              <RepaymentScheduleSection 
                repaymentData={repaymentData}
                loading={loading}
                error={error}
              />
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
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.red,
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
  paidRow: {
    backgroundColor: '#F0F9F4',
  },
  paidText: {
    color: colors.forestGreen,
    fontWeight: '500',
  },
  paidDateHighlight: {
    color: colors.forestGreen,
    fontWeight: '600',
  },
  paidDateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidDateIcon: {
    marginRight: spacing.xs,
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
