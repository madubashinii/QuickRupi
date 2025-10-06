import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

// Constants
const PERFORMANCE_CONFIG = [
  { key: 'principalAmount', label: 'Principal', isCurrency: true },
  { key: 'interestEarned', label: 'Interest Earned', isCurrency: true },
  { key: 'totalReturn', label: 'Total Return', isCurrency: true },
  { key: 'returnPercentage', label: 'Return %', isCurrency: false, isCalculated: true },
];

const DETAIL_CONFIG = [
  { key: 'actualAPR', label: 'Actual APR', suffix: '%' },
  { key: 'termMonths', label: 'Term', suffix: ' months' },
];

const ACTION_CONFIG = [
  { key: 'download', icon: 'document-text-outline', label: 'PDF', action: 'onDownloadPDF' },
  { key: 'details', icon: 'information-circle-outline', label: 'Details', action: 'onDetailsPress' },
];

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;
const calculateReturnPercentage = (interest, principal) => ((interest / principal) * 100).toFixed(1);

// Common styles
const cardStyle = {
  backgroundColor: colors.white,
  elevation: 2,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};


// Performance Item Component
const PerformanceItem = ({ label, value, isCurrency = false }) => (
  <View style={styles.performanceItem}>
    <Text style={styles.performanceLabel}>{label}</Text>
    <Text style={styles.performanceValue}>
      {isCurrency ? formatCurrency(value) : `${value}%`}
    </Text>
  </View>
);

// Performance Row Component
const PerformanceRow = ({ items }) => (
  <View style={styles.performanceRow}>
    {items.map((item, index) => (
      <PerformanceItem
        key={index}
        label={item.label}
        value={item.value}
        isCurrency={item.isCurrency}
      />
    ))}
  </View>
);

// Detail Row Component
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Action Button Component
const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons name={icon} size={16} color={colors.midnightBlue} />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

// Finished Investment Card Component
const FinishedInvestmentCard = ({ investment, onDownloadPDF, onDetailsPress }) => {
  const getPerformanceData = () => {
    const returnPercentage = calculateReturnPercentage(investment.interestEarned, investment.principalAmount);
    
    return PERFORMANCE_CONFIG.map(config => ({
      label: config.label,
      value: config.isCalculated ? returnPercentage : investment[config.key],
      isCurrency: config.isCurrency,
    }));
  };

  const getDetailData = () => {
    return DETAIL_CONFIG.map(config => ({
      label: config.label,
      value: `${investment[config.key]}${config.suffix}`,
    }));
  };

  const getActionData = () => {
    return ACTION_CONFIG.map(config => ({
      icon: config.icon,
      label: config.label,
      onPress: () => {
        if (config.action === 'onDownloadPDF') onDownloadPDF(investment);
        if (config.action === 'onDetailsPress') onDetailsPress(investment);
      },
    }));
  };

  const performanceData = getPerformanceData();
  const detailData = getDetailData();
  const actionData = getActionData();

  return (
    <View style={styles.finishedCard}>
      <View style={styles.cardHeader}>
        <View style={styles.borrowerInfo}>
          <Text style={styles.borrowerName}>{investment.borrowerName}</Text>
          <Text style={styles.borrowerId}>{investment.borrowerId}</Text>
        </View>
      </View>

      <Text style={styles.purpose}>{investment.loanPurpose}</Text>

      <View style={styles.performanceSection}>
        <PerformanceRow items={performanceData.slice(0, 2)} />
        <PerformanceRow items={performanceData.slice(2)} />
      </View>

      <View style={styles.detailsSection}>
        {detailData.map((detail, index) => (
          <DetailRow key={index} label={detail.label} value={detail.value} />
        ))}
      </View>

      <View style={styles.cardActions}>
        {actionData.map((action, index) => (
          <ActionButton
            key={index}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  finishedCard: {
    ...cardStyle,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
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
    marginBottom: 1,
  },
  borrowerId: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  purpose: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  performanceSection: {
    backgroundColor: colors.babyBlue,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: 'bold',
  },
  detailsSection: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default FinishedInvestmentCard;
