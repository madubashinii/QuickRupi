import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { OngoingLoanDetailsModal } from './InvestmentModals';
import { getRepaymentSchedule } from '../../services/repayment/repaymentService';
import { getUserDoc } from '../../services/firestoreService';

// Constants
const STATUS_CONFIG = {
  'Awaiting admin escrow approval': { color: '#FFB347', icon: 'time', textColor: colors.white },
  'Money cleared for disbursement': { color: colors.blueGreen, icon: 'checkmark-circle', textColor: colors.white },
  'Repayment in progress': { color: colors.forestGreen, icon: 'sync', textColor: colors.white },
  default: { color: colors.gray, icon: 'help-circle', textColor: colors.white }
};

const DETAIL_ICONS = {
  amount: 'wallet',
  apr: 'trending-up',
  term: 'calendar',
  progress: 'bar-chart'
};

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};
const calculateProgress = (repaid, total) => Math.min(Math.max((repaid / total) * 100, 0), 100);

// Common styles
const cardStyle = {
  backgroundColor: colors.white,
  elevation: 2,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

// Status Chip Component
const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;

  return (
    <View style={[styles.statusChip, { backgroundColor: config.color }]}>
      <Ionicons name={config.icon} size={10} color={config.textColor} style={styles.statusIcon} />
      <Text style={[styles.statusChipText, { color: config.textColor }]}>{status}</Text>
    </View>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, height = 6 }) => (
  <View style={[styles.progressBarContainer, { height }]}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

// Detail Row Component
const DetailRow = ({ icon, label, value, isApr = false }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      <Ionicons name={icon} size={12} color={colors.gray} style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, isApr && styles.aprValue]}>{value}</Text>
  </View>
);

// Investment Card Component
const InvestmentCard = ({ investment, onDetailsPress }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Calculate progress and amounts based on repayment data
  const [repaymentData, setRepaymentData] = useState(null);
  const [borrowerName, setBorrowerName] = useState(investment.borrowerName || 'Unknown');

  useEffect(() => {
    const fetchBorrowerName = async () => {
      if (!investment.borrowerId) {
        console.log('No borrowerId found in investment:', investment);
        return;
      }

      try {
        const userData = await getUserDoc(investment.borrowerId);
        
        // Extract firstName and lastName from nested personalDetails or root level
        const firstName = userData?.personalDetails?.firstName || userData?.firstName;
        const lastName = userData?.personalDetails?.lastName || userData?.lastName;
        const nameWithInitials = userData?.personalDetails?.initials || userData?.nameWithInitials;
        
        console.log('Fetched borrower data (InvestmentCard):', { 
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
            console.log('✅ Using firstName/lastName (InvestmentCard):', displayName);
          }
          
          // Priority 2-5: Fallbacks
          if (!displayName) {
            displayName = nameWithInitials || userData.fullName || userData.name || investment.borrowerName || investment.borrowerId;
            console.log('Using fallback name (InvestmentCard):', displayName);
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

    fetchBorrowerName();
  }, [investment.borrowerId]);

  useEffect(() => {
    const fetchRepaymentData = async () => {
      if (!investment?.repaymentId) return;
      
      try {
        const data = await getRepaymentSchedule(investment.repaymentId);
        setRepaymentData(data);
      } catch (err) {
        console.error('Failed to fetch repayment data:', err);
      }
    };

    fetchRepaymentData();
  }, [investment?.repaymentId]);

  const calculateRepaymentProgress = () => {
    if (!repaymentData?.schedule) return 0;
    
    const totalInstallments = repaymentData.schedule.length;
    const paidInstallments = repaymentData.schedule.filter(payment => payment.status === 'Paid').length;
    
    return (paidInstallments / totalInstallments) * 100;
  };

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

  const progress = calculateRepaymentProgress();
  const { amountRepaid, totalAmount } = getTotalAmounts();

  const handleDetailsPress = () => {
    setShowDetailsModal(true);
    if (onDetailsPress) {
      onDetailsPress(investment);
    }
  };

  return (
    <>
      <View style={styles.investmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.borrowerInfo}>
            <Text style={styles.borrowerName}>{borrowerName}</Text>
          </View>
          <StatusChip status={investment.status} />
        </View>

        <View style={styles.investmentDetails}>
          <DetailRow 
            icon={DETAIL_ICONS.amount} 
            label="Amount Funded" 
            value={formatCurrency(investment.amountFunded)} 
          />
          <DetailRow 
            icon={DETAIL_ICONS.apr} 
            label="Interest Rate" 
            value={`${investment.apr}%`} 
            isApr 
          />
          <DetailRow 
            icon={DETAIL_ICONS.term} 
            label="Term" 
            value={`${investment.termMonths} months`} 
          />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLabelContainer}>
              <Ionicons name={DETAIL_ICONS.progress} size={12} color={colors.gray} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Progress</Text>
            </View>
            <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
          </View>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>
            {formatCurrency(amountRepaid)} of {formatCurrency(totalAmount)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDetailsPress}>
            <Ionicons name="eye" size={14} color={colors.midnightBlue} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      <OngoingLoanDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        investment={investment}
      />
    </>
  );
};

const styles = StyleSheet.create({
  investmentCard: {
    ...cardStyle,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  borrowerInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  investmentDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    paddingVertical: 1,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 4,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  aprValue: {
    color: colors.forestGreen,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  progressBarContainer: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.sm,
    marginBottom: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: colors.blueGreen,
    height: '100%',
    borderRadius: borderRadius.sm,
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
  },
  cardActions: {
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.babyBlue,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.babyBlue,
    justifyContent: 'center',
    width: '100%',
  },
  actionIcon: {
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
});
export default InvestmentCard;
