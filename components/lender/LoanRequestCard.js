import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { LoanRequestDetailsModal } from './LoanRequestDetailsModal';
import LoanFundModal from './LoanFundModal';
import { getUserDoc } from '../../services/firestoreService';

// Constants
const DETAIL_ICONS = {
  amount: 'wallet',
  apr: 'trending-up',
  term: 'calendar',
  risk: 'shield'
};

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};

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
    <>
      <View style={styles.detailLabelContainer}>
        <>
          <Ionicons name={icon} size={12} color={colors.gray} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>{label}</Text>
        </>
      </View>
      <Text style={[styles.detailValue, isApr && styles.aprValue]}>{value}</Text>
    </>
  </View>
);

// Loan Request Card Component
const LoanRequestCard = ({ request, onFundPress, onDetailsPress, userId }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [borrowerName, setBorrowerName] = useState(request.borrowerName || 'Unknown');

  useEffect(() => {
    const fetchBorrowerName = async () => {
      if (!request.borrowerId) {
        console.log('No borrowerId found in request:', request);
        return;
      }

      try {
        const userData = await getUserDoc(request.borrowerId);
        
        // Extract firstName and lastName from nested personalDetails or root level
        const firstName = userData?.personalDetails?.firstName || userData?.firstName;
        const lastName = userData?.personalDetails?.lastName || userData?.lastName;
        const nameWithInitials = userData?.personalDetails?.initials || userData?.nameWithInitials;
        
        console.log('Fetched borrower data (LoanRequestCard):', { 
          borrowerId: request.borrowerId, 
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
            console.log('✅ Using firstName/lastName (LoanRequestCard):', displayName);
          }
          
          // Priority 2-5: Fallbacks
          if (!displayName) {
            displayName = nameWithInitials || userData.fullName || userData.name || request.borrowerName || request.borrowerId;
            console.log('Using fallback name (LoanRequestCard):', displayName);
          }
          
          setBorrowerName(displayName);
        } else {
          console.log('❌ No user data found for borrowerId:', request.borrowerId);
          setBorrowerName(request.borrowerName || request.borrowerId);
        }
      } catch (error) {
        console.error(`❌ Error fetching borrower ${request.borrowerId}:`, error);
        setBorrowerName(request.borrowerName || request.borrowerId);
      }
    };

    fetchBorrowerName();
  }, [request.borrowerId]);

  const handleDetailsPress = () => {
    setShowDetailsModal(true);
    if (onDetailsPress) {
      onDetailsPress(request);
    }
  };

  const handleFundPress = () => {
    setShowFundModal(true);
  };

  const handleFundPressFromDetails = () => {
    setShowDetailsModal(false); // Close details modal first
    setShowFundModal(true);     // Then open fund modal
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const handleCloseFundModal = () => {
    setShowFundModal(false);
  };

  const handleConfirmFunding = (fundingData) => {
    console.log('Funding confirmed:', fundingData);
    setShowFundModal(false);
    // Here you would typically call an API to process the funding
  };

  return (
    <View style={styles.loanRequestCard}>
      <>
        <View style={styles.cardHeader}>
          <View style={styles.borrowerInfo}>
            <Text style={styles.borrowerName}>{borrowerName}</Text>
          </View>
        </View>

        <Text style={styles.purpose}>{request.purpose}</Text>
        {request.description && (
          <Text style={styles.description}>{request.description}</Text>
        )}

        <View style={styles.requestDetails}>
          <>
            <DetailRow 
              icon={DETAIL_ICONS.amount} 
              label="Amount Requested" 
              value={formatCurrency(request.amountRequested)} 
            />
            <DetailRow 
              icon={DETAIL_ICONS.apr} 
              label="Interest Rate" 
              value={`${request.apr || request.interestRate}%`} 
              isApr 
            />
            <DetailRow 
              icon={DETAIL_ICONS.term} 
              label="Term" 
              value={`${request.termMonths} months`} 
            />
          </>
        </View>

        <View style={styles.cardActions}>
          <>
            <TouchableOpacity style={styles.detailsButton} onPress={handleDetailsPress}>
              <>
                <Ionicons name="eye" size={14} color={colors.midnightBlue} style={styles.buttonIcon} />
                <Text style={styles.detailsButtonText}>Details</Text>
              </>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fundButton} onPress={handleFundPress}>
              <>
                <Ionicons name="add-circle" size={14} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.fundButtonText}>Fund</Text>
              </>
            </TouchableOpacity>
          </>
        </View>

        {/* Loan Request Details Modal */}
        <LoanRequestDetailsModal
          visible={showDetailsModal}
          onClose={handleCloseDetailsModal}
          request={request}
          onFundPress={handleFundPressFromDetails}
        />

        {/* Loan Fund Modal */}
        <LoanFundModal
          visible={showFundModal}
          onClose={handleCloseFundModal}
          request={request}
          onConfirm={handleConfirmFunding}
          userId={userId}
        />
      </>
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
  description: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.sm,
    lineHeight: 16,
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
