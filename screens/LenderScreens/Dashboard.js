import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import ROIGrowthChart from '../../components/lender/ROIGrowthChart';
import MonthlyReturnsChart from '../../components/lender/MonthlyReturnsChart';
import AddFundsModal from '../../components/lender/AddFundsModal';
import ExportModal from '../../components/lender/ExportModal';
import TaxSummaryModal from '../../components/lender/TaxSummaryModal';
import PortfolioReportModal from '../../components/lender/PortfolioReportModal';
import { subscribeToUserTransactions } from '../../services/transactions';
import { formatTransactionForDisplay } from '../../services/transactions/transactionUtils';
import { subscribeToWallet } from '../../services/wallet';
import { fetchOngoingLoans, fetchCompletedLoans, calculateROIGrowth, calculateMonthlyReturns } from '../../services/lender/lenderLoanService';
import { subscribeToUnreadCount } from '../../services/notifications/notificationService';
import { subscribeToConversationsForUser } from '../../services/chat';

// Constants
const BACKGROUND_HEIGHT = 380;
const PROFILE_IMAGE_SIZE = 50;
const ACTION_BUTTON_SIZE = 44;

// Mock Data
const mockData = {
  user: {
    name: 'Brian Gunasekara',
  },
  portfolio: {
    totalValue: 'LKR 255,680.00',
    activeLoans: 'LKR 1,25,000',
    activeLoansTrend: '+12%',
    returns: 'LKR 45,680',
    returnsTrend: '+8.5%',
  },
  roiGrowthData: [
    { month: 'Jul', roi: 12.5 },
    { month: 'Aug', roi: 14.2 },
    { month: 'Sep', roi: 16.8 },
    { month: 'Oct', roi: 15.3 },
    { month: 'Nov', roi: 17.9 },
    { month: 'Dec', roi: 18.5 },
  ],
  monthlyReturnsData: [
    { month: 'Jul', returns: 8500 },
    { month: 'Aug', returns: 12000 },
    { month: 'Sep', returns: 9800 },
    { month: 'Oct', returns: 15000 },
    { month: 'Nov', returns: 13200 },
    { month: 'Dec', returns: 18600 },
  ],
  reportOptions: [
    {
      id: 1,
      title: 'Portfolio Report',
      icon: 'document-text',
      description: 'Complete investment overview',
    },
    {
      id: 2,
      title: 'Tax Summary',
      icon: 'receipt',
      description: 'Annual tax documentation',
    },
    {
      id: 3,
      title: 'Export Data',
      icon: 'download',
      description: 'Download all transactions',
    },
  ],
};

// Handlers
const handleNotificationPress = (navigation) => () => navigation.navigate('Notifications');
const handleMessagePress = (navigation) => () => navigation.navigate('Messages');
const handleInvest = (navigation) => () => navigation.navigate('Investments', { initialTab: 'Browse' });
const handleSeeAllTransactions = (navigation) => () => navigation.navigate('Transactions');

// Reusable Components
const ProfileImage = () => (
  <View style={styles.profileImageContainer}>
    <View style={styles.profileImage}>
      <Ionicons name="person" size={24} color={colors.white} />
    </View>
  </View>
);

const ActionButton = ({ icon, onPress, badge }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color={colors.white} />
    {badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const StatCard = ({ value, label, trend }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statTrend}>
      <Ionicons name="trending-up" size={16} color={colors.blueGreen} />
      <Text style={styles.trendText}>{trend}</Text>
    </View>
  </View>
);

const SectionHeader = ({ title, onSeeMore }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeMore && (
      <TouchableOpacity onPress={onSeeMore}>
        <Text style={styles.seeMoreText}>See More</Text>
      </TouchableOpacity>
    )}
  </View>
);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 24) return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (hours < 48) return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TransactionItem = ({ transaction }) => (
  <View style={styles.transactionItem}>
    <View style={[styles.transactionIcon, { backgroundColor: transaction.isPositive ? colors.blueGreen : colors.red }]}>
      <Ionicons name={transaction.icon} size={20} color={colors.white} />
    </View>
    <View style={styles.transactionContent}>
      <Text style={styles.transactionTitle}>{transaction.displayDescription}</Text>
      <Text style={styles.transactionDate}>{formatTimestamp(transaction.timestamp)}</Text>
    </View>
    <Text style={[styles.transactionAmount, { color: transaction.isPositive ? colors.blueGreen : colors.red }]}>
      {transaction.formattedAmount}
    </Text>
  </View>
);

const ReportButton = ({ title, icon, onPress, description }) => (
  <TouchableOpacity style={styles.reportButton} onPress={onPress}>
    <View style={styles.reportIconContainer}>
      <Ionicons name={icon} size={28} color={colors.white} />
    </View>
    <View style={styles.reportContent}>
      <Text style={styles.reportButtonText}>{title}</Text>
      <Text style={styles.reportDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
  </TouchableOpacity>
);

const Dashboard = () => {
  const { user, reportOptions } = mockData;
  const navigation = useNavigation();
  
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTaxSummaryModal, setShowTaxSummaryModal] = useState(false);
  const [showPortfolioReportModal, setShowPortfolioReportModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeInvestments, setActiveInvestments] = useState(0);
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);
  const [previousActiveInvestments, setPreviousActiveInvestments] = useState(0);
  const [previousReturns, setPreviousReturns] = useState(0);
  const [roiGrowthData, setRoiGrowthData] = useState([]);
  const [monthlyReturnsData, setMonthlyReturnsData] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const userId = 'L001';
    
    // Subscribe to wallet balance
    const unsubscribeWallet = subscribeToWallet(userId, (walletData) => {
      setWalletBalance(walletData.balance || 0);
    });
    
    // Subscribe to transactions
    const unsubscribeTransactions = subscribeToUserTransactions(userId, (data) => {
      const formatted = data.transactions.map(formatTransactionForDisplay);
      setTransactions(formatted.slice(0, 2));
    }, 2);

    // Subscribe to unread notification count
    const unsubscribeNotifications = subscribeToUnreadCount(userId, (count) => {
      setUnreadCount(count);
    });
    
    // Subscribe to unread message count
    const unsubscribeMessages = subscribeToConversationsForUser(userId, 'lender', (conversations) => {
      const totalUnread = conversations.reduce((sum, conv) => {
        // Only count unread messages for the lender
        const lenderUnreadCount = conv.unreadCount?.[userId] || 0;
        
        // Additional check: ensure the conversation has the lender as a participant
        const hasLender = conv.participantIds?.includes(userId);
        
        return hasLender ? sum + lenderUnreadCount : sum;
      }, 0);
      setUnreadMessagesCount(totalUnread);
    });
    
    // Fetch active investments and stats
    const loadActiveInvestments = async () => {
      try {
        const loans = await fetchOngoingLoans(userId);
        const totalInvested = loans.reduce((sum, loan) => sum + (loan.amountFunded || 0), 0);
        setActiveInvestments(totalInvested);
        setActiveLoansCount(loans.length);
        setPreviousActiveInvestments(totalInvested * 0.88); // Mock 12% increase
      } catch (error) {
        console.error('Failed to load active investments:', error);
        setActiveInvestments(0);
        setActiveLoansCount(0);
      }
    };
    
    // Fetch completed loans for returns
    const loadReturns = async () => {
      try {
        const completedLoans = await fetchCompletedLoans(userId);
        const returns = completedLoans.reduce((sum, loan) => sum + (loan.interestEarned || 0), 0);
        setTotalReturns(returns);
        setPreviousReturns(returns * 0.915); // Mock 8.5% increase
      } catch (error) {
        console.error('Failed to load returns:', error);
        setTotalReturns(0);
      }
    };
    
    // Fetch ROI growth data
    const loadROIGrowth = async () => {
      try {
        const roiData = await calculateROIGrowth(userId);
        setRoiGrowthData(roiData);
      } catch (error) {
        console.error('Failed to load ROI growth:', error);
        setRoiGrowthData([]);
      }
    };
    
    // Fetch monthly returns data
    const loadMonthlyReturns = async () => {
      try {
        const returnsData = await calculateMonthlyReturns(userId);
        setMonthlyReturnsData(returnsData);
      } catch (error) {
        console.error('Failed to load monthly returns:', error);
        setMonthlyReturnsData([]);
      }
    };
    
    loadActiveInvestments();
    loadReturns();
    loadROIGrowth();
    loadMonthlyReturns();
    
    return () => {
      unsubscribeWallet();
      unsubscribeTransactions();
      unsubscribeNotifications();
      unsubscribeMessages();
    };
  }, []);

  // Calculate total portfolio value
  useEffect(() => {
    setTotalPortfolio(walletBalance + activeInvestments);
  }, [walletBalance, activeInvestments]);

  const handleAddFunds = () => setShowAddFundsModal(true);
  const handleCloseAddFundsModal = () => setShowAddFundsModal(false);
  const handleConfirmAddFunds = (data) => {
    console.log('Add Funds confirmed:', data);
    setShowAddFundsModal(false);
  };

  const handleExportData = () => setShowExportModal(true);
  const handleCloseExportModal = () => setShowExportModal(false);

  const handleTaxSummary = () => setShowTaxSummaryModal(true);
  const handleCloseTaxSummaryModal = () => setShowTaxSummaryModal(false);

  const handlePortfolioReport = () => setShowPortfolioReportModal(true);
  const handleClosePortfolioReportModal = () => setShowPortfolioReportModal(false);

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Background Section with PNG */}
        <View style={styles.backgroundSection}>
          <Image 
            source={require('../../assets/lender/Investing-bro.png')} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          {/* Header Section overlaid on background */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <ProfileImage />
              <View>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <ActionButton icon="notifications-outline" onPress={handleNotificationPress(navigation)} badge={unreadCount} />
              <ActionButton icon="chatbubble-outline" onPress={handleMessagePress(navigation)} badge={unreadMessagesCount} />
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              LKR {totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.portfolioBreakdown}>
            <View style={styles.breakdownItem}>
              <Ionicons name="wallet-outline" size={14} color={colors.deepForestGreen} style={styles.breakdownIcon} />
              <View>
                <Text style={styles.breakdownLabel}>Wallet</Text>
                <Text style={styles.breakdownValue}>LKR {walletBalance.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <Ionicons name="trending-up-outline" size={14} color={colors.deepForestGreen} style={styles.breakdownIcon} />
              <View>
                <Text style={styles.breakdownLabel}>Investments</Text>
                <Text style={styles.breakdownValue}>LKR {activeInvestments.toLocaleString()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddFunds}>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.primaryButtonText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleInvest(navigation)}>
              <Ionicons name="arrow-up" size={20} color={colors.midnightBlue} />
              <Text style={styles.secondaryButtonText}>Invest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard 
            value={`LKR ${activeInvestments.toLocaleString()}`} 
            label={`Active Loans (${activeLoansCount})`}
            trend={previousActiveInvestments > 0 ? `+${(((activeInvestments - previousActiveInvestments) / previousActiveInvestments) * 100).toFixed(1)}%` : '+0%'} 
          />
          <StatCard 
            value={`LKR ${totalReturns.toLocaleString()}`} 
            label="Returns" 
            trend={previousReturns > 0 ? `+${(((totalReturns - previousReturns) / previousReturns) * 100).toFixed(1)}%` : '+0%'} 
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader title="Recent Transactions" onSeeMore={handleSeeAllTransactions(navigation)} />
          <View style={styles.transactionList}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.transactionId} transaction={transaction} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Performance Charts */}
        <View style={styles.section}>
          <SectionHeader title="Performance Analytics" />
          <View style={styles.chartsContainer}>
            {roiGrowthData.length > 0 && <ROIGrowthChart data={roiGrowthData} />}
            {monthlyReturnsData.length > 0 && <MonthlyReturnsChart data={monthlyReturnsData} />}
          </View>
        </View>

        {/* Export / Reports */}
        <View style={styles.section}>
          <SectionHeader title="Export / Reports" />
          <View style={styles.reportsContainer}>
            {reportOptions.map((report) => (
              <ReportButton 
                key={report.id}
                title={report.title} 
                icon={report.icon} 
                description={report.description}
                onPress={() => {
                  if (report.id === 1) handlePortfolioReport();
                  else if (report.id === 2) handleTaxSummary();
                  else if (report.id === 3) handleExportData();
                }} 
              />
            ))}
          </View>
        </View>

      </ScrollView>
      
      {/* Add Funds Modal */}
      <AddFundsModal
        visible={showAddFundsModal}
        onClose={handleCloseAddFundsModal}
        onConfirm={handleConfirmAddFunds}
        userId="L001"
      />

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={handleCloseExportModal}
        transactions={transactions}
        filterType="all"
        userId="L001"
        showOnlyAll={true}
      />

      {/* Tax Summary Modal */}
      <TaxSummaryModal
        visible={showTaxSummaryModal}
        onClose={handleCloseTaxSummaryModal}
        userId="L001"
      />

      {/* Portfolio Report Modal */}
      <PortfolioReportModal
        visible={showPortfolioReportModal}
        onClose={handleClosePortfolioReportModal}
        userId="L001"
      />
    </AnimatedScreen>
  );
};

// Common Styles
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
  container: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  backgroundSection: {
    height: BACKGROUND_HEIGHT,
    position: 'relative',
    backgroundColor: colors.babyBlue,
  },
  backgroundImage: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.9,
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: spacing.md,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    backgroundColor: colors.midnightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.tealGreen,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    backgroundColor: colors.midnightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.midnightBlue,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceCard: {
    ...cardStyle,
    marginHorizontal: spacing.lg,
    marginTop: 40,
    padding: spacing.md,
  },
  balanceLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  portfolioBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  breakdownIcon: {
    marginTop: 2,
  },
  breakdownLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.midnightBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.midnightBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  secondaryButtonText: {
    color: colors.midnightBlue,
    fontWeight: '600',
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    ...cardStyle,
    flex: 1,
    padding: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  // Section Styles
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  seeMoreText: {
    fontSize: fontSize.sm,
    color: colors.blueGreen,
    fontWeight: '600',
  },
  // Transaction Styles
  transactionList: {
    ...cardStyle,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: fontSize.base,
    color: colors.gray,
  },
  // Charts Styles
  chartsContainer: {
    gap: spacing.lg,
  },
  // Reports Styles
  reportsContainer: {
    gap: spacing.md,
  },
  reportButton: {
    ...cardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  reportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reportContent: {
    flex: 1,
  },
  reportButtonText: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  reportDescription: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
});

export default Dashboard;
