import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { SORT_CONFIG, FILTER_OPTIONS } from './investmentUtils';
export { OngoingLoanDetailsModal } from './OngoingLoanDetailsModal';
export { LoanRequestDetailsModal } from './LoanRequestDetailsModal';
export { FinishedLoanDetailsModal } from './FinishedLoanDetailsModal';

// Reusable Modal Component
export const BaseModal = ({ visible, onClose, title, titleIcon, children, modalStyle }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1}>
          <View style={[styles.baseModal, modalStyle]}>
            <View style={styles.menuHeader}>
              <View style={styles.titleContainer}>
                {titleIcon && <Ionicons name={titleIcon} size={24} color={colors.midnightBlue} style={styles.titleIcon} />}
                <Text style={styles.menuTitle}>{title}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={colors.gray} />
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// Filter Menu Component
export const FilterMenu = ({ visible, onClose, filterBy, onFilterChange }) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Filter Investments"
      titleIcon="filter"
      modalStyle={styles.filterMenu}
    >
      <View style={styles.menuOptions}>
        {FILTER_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.menuOption,
              filterBy === option.key && styles.activeMenuOption
            ]}
            onPress={() => {
              onFilterChange(option.key);
              onClose();
            }}
          >
            <Text style={[
              styles.menuOptionText,
              filterBy === option.key && styles.activeMenuOptionText
            ]}>
              {option.label}
            </Text>
            {filterBy === option.key && (
              <Ionicons name="checkmark" size={20} color={colors.midnightBlue} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

// Sort Menu Component (for Ongoing tab)
export const SortMenu = ({ visible, onClose, sortBy, onSortChange }) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Sort Investments"
      titleIcon="swap-vertical"
      modalStyle={styles.filterMenu}
    >
      <View style={styles.menuOptions}>
        {SORT_CONFIG.ongoing.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.menuOption,
              sortBy === option.key && styles.activeMenuOption
            ]}
            onPress={() => {
              onSortChange(option.key);
              onClose();
            }}
          >
            <Text style={[
              styles.menuOptionText,
              sortBy === option.key && styles.activeMenuOptionText
            ]}>
              {option.label}
            </Text>
            {sortBy === option.key && (
              <Ionicons name="checkmark" size={20} color={colors.midnightBlue} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

// Sort Modal Component (for Browse tab)
export const SortModal = ({ visible, onClose, onSortSelect, currentSort }) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Sort by"
      titleIcon="swap-vertical"
      modalStyle={styles.sortModal}
    >
      <View style={styles.sortOptionsContainer}>
        {SORT_CONFIG.browse.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortOption,
              currentSort === option.key && styles.selectedSortOption
            ]}
            onPress={() => {
              onSortSelect(option.key);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.sortOptionContent}>
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={currentSort === option.key ? colors.midnightBlue : colors.gray} 
              />
              <Text style={[
                styles.sortOptionText,
                currentSort === option.key && styles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
            </View>
            {currentSort === option.key && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={24} color={colors.midnightBlue} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

// Funding Sheet Component
export const FundingSheet = ({ request, visible, onClose, onConfirm }) => {
  const [fundingAmount, setFundingAmount] = useState('');
  const [showSheet, setShowSheet] = useState(visible);

  React.useEffect(() => {
    setShowSheet(visible);
    if (visible && request) {
      setFundingAmount(request.amountRequested.toString());
    }
  }, [visible, request]);

  const handleConfirm = () => {
    const amount = parseFloat(fundingAmount);
    if (amount > 0 && amount <= request.amountRequested) {
      onConfirm(request, amount);
      setShowSheet(false);
      onClose();
    }
  };

  if (!showSheet || !request) return null;

  return (
    <View style={styles.sheetOverlay}>
      <View style={styles.fundingSheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Fund Loan Request</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sheetContent}>
          <Text style={styles.borrowerName}>{request.borrowerName}</Text>
          <Text style={styles.loanPurpose}>{request.purpose}</Text>
          
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount to Fund</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>LKR</Text>
              <Text style={styles.amountValue}>{fundingAmount}</Text>
            </View>
            <Text style={styles.maxAmount}>
              Max: LKR {request.amountRequested.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Est. APR</Text>
              <Text style={styles.detailValue}>{request.estAPR}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Term</Text>
              <Text style={styles.detailValue}>{request.termMonths} months</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Risk Level</Text>
              <Text style={styles.detailValue}>{request.riskLevel}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Funding</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base Modal Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.lg,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  menuTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  
  // Filter Menu Styles
  filterMenu: {
    minWidth: 250,
  },
  menuOptions: {
    gap: spacing.sm,
  },
  menuOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.babyBlue,
  },
  activeMenuOption: {
    backgroundColor: colors.midnightBlue,
  },
  menuOptionText: {
    fontSize: fontSize.base,
    color: colors.forestGreen,
    fontWeight: '500',
  },
  activeMenuOptionText: {
    color: colors.white,
  },
  
  // Sort Modal Styles
  sortModal: {
    width: '85%',
    maxWidth: 360,
    maxHeight: '85%',
  },
  sortOptionsContainer: {
    marginTop: spacing.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.babyBlue,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  selectedSortOption: {
    backgroundColor: colors.babyBlue,
    borderColor: colors.midnightBlue,
    elevation: 2,
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sortOptionText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    marginLeft: spacing.md,
    flex: 1,
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: colors.midnightBlue,
    fontWeight: '700',
  },
  checkmarkContainer: {
    marginLeft: spacing.sm,
  },
  
  // Funding Sheet Styles
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fundingSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  sheetContent: {
    padding: spacing.lg,
  },
  borrowerName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  loanPurpose: {
    fontSize: fontSize.base,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  amountSection: {
    marginVertical: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSize.base,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.babyBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    color: colors.midnightBlue,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  amountValue: {
    fontSize: fontSize.xl,
    color: colors.midnightBlue,
    fontWeight: 'bold',
    flex: 1,
  },
  maxAmount: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  loanDetails: {
    backgroundColor: colors.babyBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
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
  sheetActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.babyBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.midnightBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
});
