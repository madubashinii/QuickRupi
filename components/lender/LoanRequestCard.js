import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { LoanRequestDetailsModal } from './LoanRequestDetailsModal';

// Constants
const DETAIL_ICONS = {
  amount: 'wallet',
  apr: 'trending-up',
  term: 'calendar',
  risk: 'shield'
};

// Utility functions
const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;

// Common styles
const cardStyle = {
  backgroundColor: colors.white,
  elevation: 2,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};


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

// Loan Request Card Component
const LoanRequestCard = ({ request, onFundPress, onDetailsPress }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDetailsPress = () => {
    setShowDetailsModal(true);
    if (onDetailsPress) {
      onDetailsPress(request);
    }
  };

  const handleFundPress = () => {
    if (onFundPress) {
      onFundPress(request);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
  };

  return (
    <View style={styles.loanRequestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.borrowerInfo}>
          <Text style={styles.borrowerName}>{request.borrowerName}</Text>
        </View>
      </View>

      <Text style={styles.purpose}>{request.purpose}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={12} color={colors.gray} style={styles.locationIcon} />
        <Text style={styles.location}>{request.location}</Text>
      </View>

      <View style={styles.requestDetails}>
        <DetailRow 
          icon={DETAIL_ICONS.amount} 
          label="Amount Requested" 
          value={formatCurrency(request.amountRequested)} 
        />
        <DetailRow 
          icon={DETAIL_ICONS.apr} 
          label="Est. APR" 
          value={`${request.estAPR}%`} 
          isApr 
        />
        <DetailRow 
          icon={DETAIL_ICONS.term} 
          label="Term" 
          value={`${request.termMonths} months`} 
        />
        <DetailRow 
          icon={DETAIL_ICONS.risk} 
          label="Risk Level" 
          value={request.riskLevel} 
        />
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.detailsButton} onPress={handleDetailsPress}>
          <Ionicons name="eye" size={14} color={colors.midnightBlue} style={styles.buttonIcon} />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fundButton} onPress={handleFundPress}>
          <Ionicons name="add-circle" size={14} color={colors.white} style={styles.buttonIcon} />
          <Text style={styles.fundButtonText}>Fund</Text>
        </TouchableOpacity>
      </View>

      {/* Loan Request Details Modal */}
      <LoanRequestDetailsModal
        visible={showDetailsModal}
        onClose={handleCloseModal}
        request={request}
        onFundPress={handleFundPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loanRequestCard: {
    ...cardStyle,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.babyBlue,
  },
  cardHeader: {
    marginBottom: spacing.xs,
  },
  borrowerName: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  purpose: {
    fontSize: fontSize.sm,
    color: colors.forestGreen,
    marginBottom: 2,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  requestDetails: {
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.babyBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  fundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  detailsButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  fundButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default LoanRequestCard;
