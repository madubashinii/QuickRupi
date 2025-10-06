import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import ROIGrowthChart from '../../components/lender/ROIGrowthChart';
import MonthlyReturnsChart from '../../components/lender/MonthlyReturnsChart';
import AddFundsModal from '../../components/lender/AddFundsModal';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
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
  upcomingRepayments: [
    {
      id: 1,
      borrower: 'John Silva',
      amount: 'LKR 15,000',
      dueDate: 'Dec 15, 2024',
      status: 'due',
    },
    {
      id: 2,
      borrower: 'Maria Perera',
      amount: 'LKR 8,500',
      dueDate: 'Dec 12, 2024',
      status: 'overdue',
    },
  ],
  recentTransactions: [
    {
      id: 1,
      icon: 'trending-up',
      title: 'Investment Return',
      amount: 'LKR 2,450',
      date: 'Today, 2:30 PM',
      type: 'credit',
    },
    {
      id: 2,
      icon: 'card',
      title: 'Loan Disbursed',
      amount: 'LKR 15,000',
      date: 'Yesterday, 4:15 PM',
      type: 'debit',
    },
  ],
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
const handleSeeAllRepayments = () => console.log('See all repayments');
const handleSeeAllTransactions = () => console.log('See all transactions');
const handlePortfolioReport = () => console.log('Portfolio report');
const handleTaxSummary = () => console.log('Tax summary');
const handleExportData = () => console.log('Export data');

// Reusable Components
const ProfileImage = () => (
  <View style={styles.profileImageContainer}>
    <View style={styles.profileImage}>
      <Ionicons name="person" size={24} color={colors.white} />
    </View>
  </View>
);

const ActionButton = ({ icon, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color={colors.white} />
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

const TransactionItem = ({ icon, title, amount, date, type }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons name={icon} size={20} color={colors.white} />
    </View>
    <View style={styles.transactionContent}>
      <Text style={styles.transactionTitle}>{title}</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <Text style={[styles.transactionAmount, { color: type === 'credit' ? colors.blueGreen : colors.midnightBlue }]}>
      {type === 'credit' ? '+' : '-'}{amount}
    </Text>
  </View>
);

const RepaymentItem = ({ borrower, amount, dueDate, status }) => (
  <View style={styles.repaymentItem}>
    <View style={styles.repaymentContent}>
      <Text style={styles.repaymentBorrower}>{borrower}</Text>
      <Text style={styles.repaymentDate}>Due: {dueDate}</Text>
    </View>
    <View style={styles.repaymentRight}>
      <Text style={styles.repaymentAmount}>{amount}</Text>
      <View style={[styles.statusBadge, { backgroundColor: status === 'overdue' ? colors.red : colors.blueGreen }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
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
  const { user, portfolio, upcomingRepayments, recentTransactions, roiGrowthData, monthlyReturnsData, reportOptions } = mockData;
  const navigation = useNavigation();
  
  // State for modals
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  // Handlers
  const handleAddFunds = () => setShowAddFundsModal(true);
  const handleCloseAddFundsModal = () => setShowAddFundsModal(false);
  const handleConfirmAddFunds = (data) => {
    console.log('Add Funds confirmed:', data);
    setShowAddFundsModal(false);
    // Here you would typically call an API to add funds
  };

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
              <ActionButton icon="notifications-outline" onPress={handleNotificationPress(navigation)} />
              <ActionButton icon="chatbubble-outline" onPress={handleMessagePress(navigation)} />
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{portfolio.totalValue}</Text>
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
          <StatCard value={portfolio.activeLoans} label="Active Loans" trend={portfolio.activeLoansTrend} />
          <StatCard value={portfolio.returns} label="Returns" trend={portfolio.returnsTrend} />
        </View>

        {/* Upcoming Repayments */}
        <View style={styles.section}>
          <SectionHeader title="Upcoming Repayments" onSeeMore={handleSeeAllRepayments} />
          <View style={styles.repaymentList}>
            {upcomingRepayments.map((repayment) => (
              <RepaymentItem 
                key={repayment.id}
                borrower={repayment.borrower} 
                amount={repayment.amount} 
                dueDate={repayment.dueDate} 
                status={repayment.status} 
              />
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader title="Recent Transactions" onSeeMore={handleSeeAllTransactions} />
          <View style={styles.transactionList}>
            {recentTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id}
                icon={transaction.icon} 
                title={transaction.title} 
                amount={transaction.amount} 
                date={transaction.date} 
                type={transaction.type} 
              />
            ))}
          </View>
        </View>

        {/* Performance Charts */}
        <View style={styles.section}>
          <SectionHeader title="Performance Analytics" />
          <View style={styles.chartsContainer}>
            <ROIGrowthChart data={roiGrowthData} />
            <MonthlyReturnsChart data={monthlyReturnsData} />
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
        walletBalance={portfolio.totalValue}
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
  },
  balanceCard: {
    ...cardStyle,
    marginHorizontal: spacing.lg,
    marginTop: 40,
    padding: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceAmount: {
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    fontWeight: 'bold',
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
  // Repayment Styles
  repaymentList: {
    ...cardStyle,
  },
  repaymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  repaymentContent: {
    flex: 1,
  },
  repaymentBorrower: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  repaymentDate: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  repaymentRight: {
    alignItems: 'flex-end',
  },
  repaymentAmount: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.white,
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
    backgroundColor: colors.blueGreen,
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
