import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Constants
const STATUS_CONFIG = {
  'On time': { color: colors.blueGreen, icon: 'checkmark-circle', textColor: colors.white },
  'Due soon': { color: '#FFB347', icon: 'time', textColor: colors.white },
  'Overdue': { color: colors.red, icon: 'alert-circle', textColor: colors.white },
  default: { color: colors.gray, icon: 'help-circle', textColor: colors.white }
};

const DETAIL_ICONS = {
  amount: 'wallet',
  apr: 'trending-up',
  term: 'calendar',
  progress: 'bar-chart'
};

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
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
  const progress = calculateProgress(investment.amountRepaid, investment.repaymentAmount);

  return (
    <View style={styles.investmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.borrowerInfo}>
          <Text style={styles.borrowerName}>{investment.borrowerName}</Text>
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
          label="APR" 
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
          {formatCurrency(investment.amountRepaid)} of {formatCurrency(investment.repaymentAmount)}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDetailsPress(investment)}>
          <Ionicons name="eye" size={14} color={colors.midnightBlue} style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
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
