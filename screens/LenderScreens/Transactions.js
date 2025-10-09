import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import AddFundsModal from '../../components/lender/AddFundsModal';
import WithdrawModal from '../../components/lender/WithdrawModal';
import { initializeUserWallet, subscribeToWallet } from '../../services/wallet';
import { subscribeToUserTransactions, getMoreTransactions, formatTransactionForDisplay, applyTransactionFilter } from '../../services/transactions';

// Constants
const BACKGROUND_HEIGHT = 370;

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'repayments', label: 'Repayments' },
  { key: 'fees', label: 'Fees' },
];

// Helper Functions
const formatTransactionDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // Handle Firestore timestamp
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// Helper Functions - Notifications
const showSuccessNotification = (title, message) => {
  Alert.alert(
    `✅ ${title}`,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

const showErrorNotification = (title, message) => {
  Alert.alert(
    `⚠️ ${title}`,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

// Event Handlers
const useTransactionHandlers = (setShowAddFundsModal, setShowWithdrawModal) => ({
  handleAddFunds: () => setShowAddFundsModal(true),
  handleWithdraw: () => setShowWithdrawModal(true),
  handleExport: () => {
    showSuccessNotification('Export', 'Transaction export feature coming soon!');
  },
  handleAddFundsConfirm: (data) => {
    // Balance and transactions update automatically via real-time listeners
    if (data.success !== false) {
      showSuccessNotification(
        'Funds Added',
        `LKR ${data.amount.toLocaleString()} added to your wallet successfully!`
      );
    }
  },
  handleWithdrawConfirm: (data) => {
    // Balance and transactions update automatically via real-time listeners
    if (data.success !== false) {
      showSuccessNotification(
        'Withdrawal Successful',
        `LKR ${data.amount.toLocaleString()} withdrawn successfully!`
      );
    }
  },
});

// Components
const TransactionItem = ({ transaction }) => {
  const indicatorColor = transaction.isPositive ? colors.blueGreen : colors.red;
  const amountColor = transaction.isPositive ? colors.blueGreen : colors.red;
  const iconBgColor = transaction.isPositive ? colors.blueGreen : colors.red;
  const showStatusBadge = transaction.status === 'pending' || transaction.status === 'failed';
  
  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIndicator, { backgroundColor: indicatorColor }]} />
      <View style={[styles.transactionIconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={transaction.icon} size={20} color={colors.white} />
      </View>
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionType}>{transaction.displayDescription}</Text>
          {showStatusBadge && (
            <View style={[styles.statusBadge, { backgroundColor: transaction.statusColor }]}>
              <Text style={styles.statusBadgeText}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.transactionDate}>{formatTransactionDate(transaction.timestamp)}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {transaction.formattedAmount}
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

const EmptyState = ({ filterBy }) => {
  const emptyMessages = {
    all: {
      title: 'No transactions yet',
      subtitle: 'Your transaction history will appear here'
    },
    deposits: {
      title: 'No deposits found',
      subtitle: 'Topup your wallet or receive loan repayments'
    },
    payouts: {
      title: 'No payouts found',
      subtitle: 'No withdrawals or investments yet'
    },
    repayments: {
      title: 'No repayments found',
      subtitle: 'Loan repayments will appear here'
    },
    fees: {
      title: 'No fees found',
      subtitle: 'Transaction fees will appear here'
    }
  };

  const message = emptyMessages[filterBy] || emptyMessages.all;

  return (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={colors.gray} />
      <Text style={styles.emptyStateText}>{message.title}</Text>
      <Text style={styles.emptyStateSubtext}>{message.subtitle}</Text>
    </View>
  );
};

const LoadingSkeleton = () => (
  <View style={styles.transactionsList}>
    {[1, 2, 3, 4, 5].map((item) => (
      <View key={item} style={styles.skeletonItem}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonDetails}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
        <View style={styles.skeletonAmount} />
      </View>
    ))}
  </View>
);

const LoadMoreButton = ({ onPress, isLoading, disabled }) => (
  <TouchableOpacity
    style={[styles.loadMoreButton, disabled && styles.loadMoreButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={colors.white} />
    ) : (
      <>
        <Text style={styles.loadMoreText}>Load More</Text>
        <Ionicons name="chevron-down" size={18} color={colors.white} />
      </>
    )}
  </TouchableOpacity>
);

const TransactionsList = ({ transactions, loading, filterBy, hasMore, isLoadingMore, onLoadMore }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <View style={styles.transactionsList}>
      {transactions.length > 0 ? (
        <>
          {transactions.map(transaction => (
            <TransactionItem key={transaction.transactionId} transaction={transaction} />
          ))}
          {hasMore ? (
            <LoadMoreButton 
              onPress={onLoadMore}
              isLoading={isLoadingMore}
              disabled={isLoadingMore}
            />
          ) : (
            <View style={styles.endOfListContainer}>
              <View style={styles.endOfListDivider} />
              <Text style={styles.endOfListText}>End of transactions</Text>
              <View style={styles.endOfListDivider} />
            </View>
          )}
        </>
      ) : (
        <EmptyState filterBy={filterBy} />
      )}
    </View>
  );
};

// Main Component
const Transactions = () => {
  // Wallet State
  const [walletBalance, setWalletBalance] = useState('LKR 0.00');
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState(null);
  
  // Transaction State
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  
  // Pagination State
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisibleTransaction, setLastVisibleTransaction] = useState(null);
  
  // UI State
  const [filterBy, setFilterBy] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
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
    const unsubscribeWallet = subscribeToWallet('L001', (walletData) => {
      if (walletData.balance !== null) {
        setWalletBalance(`LKR ${walletData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    });

    // Subscribe to real-time transaction updates with pagination (10 transactions)
    const unsubscribeTransactions = subscribeToUserTransactions('L001', (data) => {
      try {
        const { transactions: transactionsData, hasMore, lastVisible } = data;
        // Format transactions for display
        const formattedTransactions = transactionsData.map(formatTransactionForDisplay);
        setTransactions(formattedTransactions);
        setHasMoreTransactions(hasMore);
        setLastVisibleTransaction(lastVisible);
        setTransactionsLoading(false);
        setTransactionsError(null);
      } catch (error) {
        console.error('Transaction formatting error:', error);
        setTransactionsError(error.message);
        setTransactionsLoading(false);
      }
    }, 10);

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeWallet();
      unsubscribeTransactions();
    };
  }, []);

  // Handle Load More
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreTransactions || !lastVisibleTransaction) return;

    setIsLoadingMore(true);
    try {
      const { transactions: newTransactions, hasMore, lastVisible } = await getMoreTransactions(
        'L001',
        lastVisibleTransaction,
        10
      );
      
      const formattedNewTransactions = newTransactions.map(formatTransactionForDisplay);
      setTransactions(prev => [...prev, ...formattedNewTransactions]);
      setHasMoreTransactions(hasMore);
      setLastVisibleTransaction(lastVisible);
    } catch (error) {
      console.error('Load more error:', error);
      showErrorNotification('Load Failed', 'Failed to load more transactions');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Show combined loading state
  if (walletLoading || transactionsLoading) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blueGreen} />
          <Text style={styles.loadingText}>Initializing wallet and loading transactions...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  // Show combined error state
  if (walletError || transactionsError) {
    return (
      <AnimatedScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          {walletError && (
            <Text style={styles.errorText}>Wallet: {walletError}</Text>
          )}
          {transactionsError && (
            <Text style={styles.errorText}>Transactions: {transactionsError}</Text>
          )}
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setWalletError(null);
              setTransactionsError(null);
              setWalletLoading(true);
              setTransactionsLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AnimatedScreen>
    );
  }

  // Apply filter to transactions
  const filteredTransactions = applyTransactionFilter(transactions, filterBy);

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
        <TransactionsList 
          transactions={filteredTransactions} 
          loading={transactionsLoading}
          filterBy={filterBy}
          hasMore={hasMoreTransactions}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
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
    marginVertical: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.blueGreen,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  transactionType: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    flex: 1,
  },
  transactionDate: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  transactionAmount: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  
  // Load More Button
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueGreen,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  
  // End of List
  endOfListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  endOfListDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  endOfListText: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginHorizontal: spacing.md,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Loading Skeleton
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: spacing.md,
  },
  skeletonDetails: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    width: '40%',
  },
  skeletonAmount: {
    height: 16,
    width: 80,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
  },
});

export default Transactions;
