import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import AddFundsModal from '../../components/lender/AddFundsModal';
import WithdrawModal from '../../components/lender/WithdrawModal';
import { initializeUserWallet, subscribeToWallet } from '../../services/wallet';

// Constants
const BACKGROUND_HEIGHT = 370;

// Data
const MOCK_DATA = {
  walletBalance: 'LKR 100,500.00',
  transactions: [
    { id: 1, type: 'Investment Return', amount: 3450, date: 'Today, 2:30 PM', isPositive: true, icon: 'trending-up' },
    { id: 2, type: 'Loan Disbursed', amount: 15000, date: 'Today, 1:30 PM', isPositive: false, icon: 'card' },
    { id: 3, type: 'Funds Added', amount: 60000, date: 'Yesterday, 8:40 PM', isPositive: true, icon: 'arrow-down-circle' },
    { id: 4, type: 'Investment Return', amount: 8500, date: 'Yesterday, 4:15 PM', isPositive: true, icon: 'trending-up' },
    { id: 5, type: 'Loan Disbursed', amount: 50000, date: 'Yesterday, 1:00 PM', isPositive: false, icon: 'card' },
    { id: 6, type: 'Service Fee', amount: 250, date: 'Dec 10, 3:20 PM', isPositive: false, icon: 'receipt' },
    { id: 7, type: 'Interest Payment', amount: 1200, date: 'Dec 9, 11:45 AM', isPositive: true, icon: 'cash' },
  ],
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'repayments', label: 'Repayments' },
  { key: 'fees', label: 'Fees' },
];

// Event Handlers
const useTransactionHandlers = (setShowAddFundsModal, setShowWithdrawModal) => ({
  handleAddFunds: () => setShowAddFundsModal(true),
  handleWithdraw: () => setShowWithdrawModal(true),
  handleExport: () => console.log('Export pressed'),
  handleAddFundsConfirm: (data) => {
    console.log('Add Funds confirmed - Amount:', data.amount);
    // Balance updates automatically via real-time listener
  },
  handleWithdrawConfirm: (data) => {
    console.log('Withdraw confirmed - Amount:', data.amount);
    // Balance updates automatically via real-time listener
  },
});

// Components
const TransactionItem = ({ transaction }) => {
  const indicatorColor = transaction.isPositive ? colors.blueGreen : colors.red;
  const amountColor = transaction.isPositive ? colors.blueGreen : colors.red;
  const sign = transaction.isPositive ? '+' : '-';
  
  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIndicator, { backgroundColor: indicatorColor }]} />
      <View style={styles.transactionIconContainer}>
        <Ionicons name={transaction.icon} size={20} color={colors.white} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>{transaction.type}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {sign} LKR {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
};

const WalletBalanceCard = ({ balance, onAddFunds, onWithdraw }) => (
  <View style={styles.contentSection}>
    <Text style={styles.balanceLabel}>Wallet Balance</Text>
    <Text style={styles.balanceAmount}>{balance}</Text>
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={onAddFunds}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.actionButtonText}>Add Funds</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onWithdraw}>
        <Ionicons name="card" size={20} color={colors.white} />
        <Text style={styles.actionButtonText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const FilterControls = ({ onFilterPress, onExportPress }) => (
  <View style={styles.controlsSection}>
    <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
      <Ionicons name="filter" size={16} color={colors.midnightBlue} />
      <Text style={styles.filterButtonText}>Filter</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.exportButton} onPress={onExportPress}>
      <Ionicons name="download-outline" size={16} color={colors.midnightBlue} />
      <Text style={styles.exportButtonText}>Export</Text>
    </TouchableOpacity>
  </View>
);

const FilterModal = ({ visible, onClose, filterBy, onFilterChange }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Transactions</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterOptionsContainer}>
          {FILTER_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterOption, filterBy === option.key && styles.activeFilterOption]}
              onPress={() => {
                onFilterChange(option.key);
                onClose();
              }}
            >
              <Text style={[styles.filterOptionText, filterBy === option.key && styles.activeFilterOptionText]}>
                {option.label}
              </Text>
              {filterBy === option.key && <Ionicons name="checkmark" size={20} color={colors.blueGreen} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

const TransactionsList = ({ transactions }) => (
  <View style={styles.transactionsList}>
    {transactions.map(transaction => (
      <TransactionItem key={transaction.id} transaction={transaction} />
    ))}
  </View>
);

// Main Component
const Transactions = () => {
  const { transactions } = MOCK_DATA;
  const [walletBalance, setWalletBalance] = useState('LKR 0.00');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState(null);
  const { handleAddFunds, handleWithdraw, handleExport, handleAddFundsConfirm, handleWithdrawConfirm } = useTransactionHandlers(setShowAddFundsModal, setShowWithdrawModal);

  // Initialize wallet and subscribe to real-time updates
  useEffect(() => {
    const setupWallet = async () => {
      try {
        await initializeUserWallet('L001');
        setWalletLoading(false);
      } catch (error) {
        console.error('Wallet initialization failed:', error);
        setWalletError(error.message);
        setWalletLoading(false);
      }
    };

    setupWallet();

    // Subscribe to real-time wallet updates
      // DEV MODE: Currently hardcoded to "L001"
      // TODO: Replace with role-based check once user collection is complete:
      // if (currentUser.role === 'lender') { await initializeUserWallet(currentUser.id); }
    const unsubscribe = subscribeToWallet('L001', (walletData) => {
      if (walletData.balance !== null) {
        setWalletBalance(`LKR ${walletData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading while wallet initializes
  if (walletLoading) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blueGreen} />
          <Text style={styles.loadingText}>Initializing wallet...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  // Show error if wallet initialization failed
  if (walletError) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={styles.errorTitle}>Wallet Error</Text>
          <Text style={styles.errorText}>{walletError}</Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderSection />
        <WalletBalanceCard 
          balance={walletBalance} 
          onAddFunds={handleAddFunds} 
          onWithdraw={handleWithdraw} 
        />
        <FilterControls 
          onFilterPress={() => setShowFilterModal(true)} 
          onExportPress={handleExport} 
        />
        <FilterModal 
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
        />
        <AddFundsModal
          visible={showAddFundsModal}
          onClose={() => setShowAddFundsModal(false)}
          onConfirm={handleAddFundsConfirm}
          userId="L001"
        />
        <WithdrawModal
          visible={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={handleWithdrawConfirm}
          walletBalance={walletBalance}
          userId="L001"
        />
        <TransactionsList transactions={transactions} />
      </ScrollView>
    </AnimatedScreen>
  );
};

const HeaderSection = () => (
  <View style={styles.backgroundSection}>
    <Image 
      source={require('../../assets/lender/wallet-transactions.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    />
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Transactions</Text>
    </View>
  </View>
);

// Styles
const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.midnightBlue,
    fontSize: fontSize.base,
    marginTop: spacing.md,
  },
  errorTitle: {
    color: colors.red,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.gray,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  
  // Header
  backgroundSection: {
    height: BACKGROUND_HEIGHT,
    position: 'relative',
    backgroundColor: colors.babyBlue,
  },
  backgroundImage: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    width: '100%',
    height: '90%',
    opacity: 1.0,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  
  // Wallet Balance
  contentSection: {
    marginHorizontal: spacing.lg,
    marginTop: -60,
    padding: spacing.lg,
    ...cardStyle,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.blueGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  
  // Filter Controls
  controlsSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  exportButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    maxHeight: '70%',
    width: '90%',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  filterOptionsContainer: {
    padding: spacing.lg,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  activeFilterOption: {
    backgroundColor: colors.babyBlue,
  },
  filterOptionText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '500',
  },
  activeFilterOptionText: {
    color: colors.blueGreen,
    fontWeight: '600',
  },
  
  // Transaction List
  transactionsList: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    position: 'relative',
  },
  transactionIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: borderRadius.sm,
    borderBottomLeftRadius: borderRadius.sm,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  transactionAmount: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
  },
});

export default Transactions;
