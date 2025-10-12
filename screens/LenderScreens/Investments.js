import React, { useState, useCallback, useEffect } from 'react';
import { fetchApprovedLoans, fetchOngoingLoans, fetchCompletedLoans } from '../../services/lender/lenderLoanService';
import { exportAndShareLoanPDF } from '../../services/lender/loanPdfService';
import { getRepaymentSchedule } from '../../services/repayment/repaymentService';
import { useAuth } from '../../context/AuthContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import InvestmentCard from '../../components/lender/InvestmentCard';
import LoanRequestCard from '../../components/lender/LoanRequestCard';
import FinishedInvestmentCard from '../../components/lender/FinishedInvestmentCard';
import StatsModal from '../../components/lender/StatsModal';
import { TABS, FILTER_OPTIONS, formatCurrency, sortByKey, SORT_CONFIG } from '../../components/lender/investmentUtils';
import { OngoingHeaderBar, BrowseHeaderBar, FinishedHeaderBar } from '../../components/lender/InvestmentHeaders';
import { FilterMenu, SortMenu, SortModal, FinishedLoanDetailsModal } from '../../components/lender/InvestmentModals';
import LoanFundModal from '../../components/lender/LoanFundModal';
import { EmptyState, BrowseEmptyState } from '../../components/lender/InvestmentEmptyStates';

const BACKGROUND_HEIGHT = 280;

// UI Components
/**
 * Displays a loading state with a header component
 * @param {Object} props
 * @param {React.ReactNode} props.HeaderComponent - Component to display above loading indicator
 */
const LoadingView = ({ HeaderComponent }) => (
  <View style={styles.content}>
    {HeaderComponent}
    <ActivityIndicator size="large" color={colors.midnightBlue} />
  </View>
);

/**
 * Reusable list component with pull-to-refresh
 * @param {Object} props
 * @param {Array<{id: string|number}>} props.data - Array of items to display
 * @param {Function} props.renderItem - Function to render each item
 * @param {boolean} props.refreshing - Whether refresh is in progress
 * @param {Function} props.onRefresh - Function to call on pull-to-refresh
 * @param {Object} [props.contentContainerStyle] - Optional styles for container
 */
const InvestmentList = ({ 
  data, 
  renderItem, 
  refreshing, 
  onRefresh, 
  contentContainerStyle 
}) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
    contentContainerStyle={contentContainerStyle}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    onEndReachedThreshold={0.1}
  />
);
/**
 * Displays a metric chip with a label and value
 * @param {Object} props
 * @param {string} props.label - Label text to display
 * @param {string|number} props.value - Value to display
 * @param {boolean} [props.isAPR=false] - Whether to display value as percentage
 * @param {string} [props.backgroundColor=colors.tiffanyBlue] - Background color
 * @param {string} [props.textColor=colors.midnightBlue] - Text color
 * @param {string} [props.labelColor=colors.forestGreen] - Label color
 */
const Chip = ({ label, value, isAPR = false, backgroundColor = colors.tiffanyBlue, textColor = colors.midnightBlue, labelColor = colors.forestGreen }) => (
  <View style={[
    styles.chip, 
    { backgroundColor },
    label === 'Active' && styles.activeChip,
    label === 'Pending' && styles.pendingChip,
    label === 'Repaid' && styles.repaidChip,
    label === 'Avg APR' && styles.aprChip,
  ]}>
    <Text style={[styles.chipValue, { color: textColor }]} numberOfLines={1}>
      {value}{isAPR ? '%' : ''}
    </Text>
    <Text style={[styles.chipLabel, { color: labelColor }]} numberOfLines={1}>{label}</Text>
  </View>
);

/**
 * Tab button component for navigation
 * @param {Object} props
 * @param {string} props.tab - Tab name to display
 * @param {boolean} props.isActive - Whether this tab is currently active
 * @param {Function} props.onPress - Function to call when tab is pressed
 */
const Tab = ({ tab, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={() => onPress(tab)}
  >
    <Text 
      style={[styles.tabText, isActive && styles.activeTabText]}
      numberOfLines={1}
    >
      {tab}
    </Text>
  </TouchableOpacity>
);

const Header = () => (
  <View style={styles.backgroundSection}>
    <Image 
      source={require('../../assets/lender/investments-hero.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    />
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1}>Investments</Text>
    </View>
  </View>
);

/**
 * Displays summary metrics in a horizontal strip
 * @param {Object} props
 * @param {Object} props.metrics - Metrics to display
 * @param {number} props.metrics.pending - Number of pending investments
 * @param {number} props.metrics.active - Number of active investments
 * @param {number} props.metrics.repaid - Number of repaid investments
 * @param {number} props.metrics.avgAPR - Average APR across investments
 */
const SummaryStrip = ({ metrics }) => (
  <View style={styles.summaryStrip}>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      <Chip 
        label="Pending" 
        value={metrics.pending} 
        backgroundColor="#FFB347"
        textColor={colors.white}
        labelColor={colors.white}
      />
      <Chip 
        label="Active" 
        value={metrics.active} 
        backgroundColor={colors.blueGreen}
        textColor={colors.white}
        labelColor={colors.white}
      />
      <Chip 
        label="Repaid" 
        value={metrics.repaid} 
        backgroundColor="#FFD700"
        textColor={colors.midnightBlue}
        labelColor={colors.midnightBlue}
      />
      <Chip 
        label="Avg APR" 
        value={metrics.avgAPR} 
        isAPR 
        backgroundColor={colors.midnightBlue}
        textColor={colors.white}
        labelColor={colors.white}
      />
    </ScrollView>
  </View>
);

/**
 * Navigation bar with tabs
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab name
 * @param {Function} props.onTabChange - Function to call when tab changes
 */
const TabNavigation = ({ activeTab, onTabChange }) => (
  <View style={styles.tabContainer}>
    {TABS.map(tab => (
      <Tab 
        key={tab}
        tab={tab}
        isActive={activeTab === tab}
        onPress={onTabChange}
      />
    ))}
  </View>
);

// Ongoing Investments Content
const OngoingContent = ({ onBrowsePress, refreshTrigger, onMetricsUpdate, userId }) => {
  const [sortBy, setSortBy] = useState('nextDue');
  const [filterBy, setFilterBy] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [error, setError] = useState(null);

  const loadOngoingInvestments = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const loans = await fetchOngoingLoans(userId);
      setInvestments(loans);
      
      // Calculate and update metrics
      if (onMetricsUpdate) {
        const updatedMetrics = calculateMetrics(loans);
        onMetricsUpdate(updatedMetrics);
      }
    } catch (err) {
      console.error("Failed to load ongoing investments. Please try again later.");
      setError("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOngoingInvestments();
  }, [refreshTrigger, userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngoingInvestments().finally(() => setRefreshing(false));
  }, []);

  const handleDetailsPress = useCallback((investment) => {
    // No-op for now - will be implemented when details view is ready
  }, []);

  const handleTopUpPress = useCallback((investment) => {
    // No-op for now - will be implemented when top-up feature is ready
  }, []);

  const handleFilterMenuToggle = useCallback(() => {
    setShowFilterMenu(!showFilterMenu);
  }, [showFilterMenu]);

  const handleSortMenuToggle = useCallback(() => {
    setShowSortMenu(!showSortMenu);
  }, [showSortMenu]);

  const renderInvestmentCard = useCallback(({ item }) => (
    <InvestmentCard
      investment={item}
      onDetailsPress={handleDetailsPress}
      onTopUpPress={handleTopUpPress}
    />
  ), [handleDetailsPress, handleTopUpPress]);

  if (loading) {
    return (
      <LoadingView 
        HeaderComponent={
          <OngoingHeaderBar
            onFilterPress={handleFilterMenuToggle}
            onSortPress={handleSortMenuToggle}
          />
        }
      />
    );
  }

  // Get filtered and sorted investments
  const getFilteredAndSortedInvestments = () => {
    let filtered = [...investments];

    // Apply filters
    if (filterBy !== 'all') {
      const now = new Date();
      filtered = filtered.filter(investment => {
        if (filterBy === 'dueThisWeek') {
          const nextPaymentDate = new Date(investment.nextPaymentDue);
          const daysDiff = Math.ceil((nextPaymentDate - now) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= 7;
        } else if (filterBy === 'overdue') {
          const nextPaymentDate = new Date(investment.nextPaymentDue);
          return nextPaymentDate < now;
        }
        return true;
      });
    }

    // Apply sorting
    return sortByKey(filtered, sortBy);
  };

  const filteredAndSortedInvestments = getFilteredAndSortedInvestments();

  // Custom empty state message based on filter
  const getEmptyStateMessage = () => {
    if (error) return "Failed to load investments";
    if (investments.length === 0) return "No investments found";
    
    switch (filterBy) {
      case 'dueThisWeek':
        return "No payments due this week";
      case 'overdue':
        return "No overdue payments";
      default:
        return "No investments match the selected filter";
    }
  };

  const renderOngoingEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message="Failed to load investments"
            icon="alert-circle"
            iconColor={colors.red}
            showBrowseButton={false}
          />
          <TouchableOpacity 
            style={[styles.actionButton, styles.retryButton]}
            onPress={loadOngoingInvestments}
          >
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (investments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message="Start your investment journey by browsing available loans"
            icon="wallet-outline"
            iconColor={colors.blueGreen}
            onBrowsePress={onBrowsePress}
            showBrowseButton={true}
          />
        </View>
      );
    }

    if (filteredAndSortedInvestments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message={getEmptyStateMessage()}
            icon="filter-outline"
            iconColor={colors.midnightBlue}
            showBrowseButton={false}
          />
          {filterBy !== 'all' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.clearFilterButton]}
              onPress={() => setFilterBy('all')}
            >
              <Text style={styles.actionButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
  };

  if (error || investments.length === 0 || filteredAndSortedInvestments.length === 0) {
    return (
      <View style={styles.ongoingContent}>
        <OngoingHeaderBar
          onFilterPress={handleFilterMenuToggle}
          onSortPress={handleSortMenuToggle}
        />
        {renderOngoingEmptyState()}
        <FilterMenu
          visible={showFilterMenu}
          onClose={() => setShowFilterMenu(false)}
          filterBy={filterBy}
          onFilterChange={(newFilter) => {
            setFilterBy(newFilter);
            setShowFilterMenu(false);
          }}
          options={FILTER_OPTIONS}
        />
        <SortMenu
          visible={showSortMenu}
          onClose={() => setShowSortMenu(false)}
          sortBy={sortBy}
          onSortChange={(newSort) => {
            setSortBy(newSort);
            setShowSortMenu(false);
          }}
          options={SORT_CONFIG.ongoing}
        />
      </View>
    );
  }


  return (
    <View style={styles.ongoingContent}>
      <OngoingHeaderBar
        onFilterPress={handleFilterMenuToggle}
        onSortPress={handleSortMenuToggle}
      />
      
      <InvestmentList
        data={filteredAndSortedInvestments}
        renderItem={renderInvestmentCard}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.investmentsList}
      />
      
      <FilterMenu
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
        filterBy={filterBy}
        onFilterChange={(newFilter) => {
          setFilterBy(newFilter);
          setShowFilterMenu(false);
        }}
        options={FILTER_OPTIONS}
      />
      <SortMenu
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        sortBy={sortBy}
        onSortChange={(newSort) => {
          setSortBy(newSort);
          setShowSortMenu(false);
        }}
        options={SORT_CONFIG.ongoing}
      />
    </View>
  );
};

// Browse Content Component
const BrowseContent = ({ onLoanFunded, userId }) => {
  const [loading, setLoading] = useState(true);
  const [loanRequests, setLoanRequests] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFundingSheet, setShowFundingSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [currentSort, setCurrentSort] = useState('newest');
  const [sortedRequests, setSortedRequests] = useState([]);
  
  const filteredRequests = sortedRequests; // Use sorted requests

  const loadApprovedLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const loans = await fetchApprovedLoans();
      setLoanRequests(loans);
      // Apply current sort when loading
      const sorted = sortByKey(loans, currentSort);
      setSortedRequests(sorted);
    } catch (err) {
      console.error("Failed to load loan requests. Please try again later.");
      setError("Failed to load loan requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedLoans();
  }, []);

  const sortRequests = useCallback((sortKey) => {
    const sorted = sortByKey(loanRequests, sortKey);
    setSortedRequests(sorted);
    setCurrentSort(sortKey);
  }, [loanRequests]);

  const handleRefresh = useCallback(() => {
    loadApprovedLoans();
  }, []);

  const handleFundPress = useCallback((request) => {
    setSelectedRequest(request);
    setShowFundingSheet(true);
  }, []);

  const handleDetailsPress = useCallback((request) => {
    console.log('Details pressed for:', request.borrowerName);
  }, []);

  const handleFundingConfirm = useCallback((fundingResult) => {
    loadApprovedLoans();
    setShowFundingSheet(false);
    if (onLoanFunded) onLoanFunded();
  }, [onLoanFunded, loadApprovedLoans]);

  const handleSortPress = useCallback(() => {
    setShowSortModal(true);
  }, []);

  const handleSortSelect = useCallback((sortKey) => {
    sortRequests(sortKey);
    setShowSortModal(false);
  }, [sortRequests]);

  const renderRequestCard = useCallback(({ item }) => (
    <LoanRequestCard
      request={item}
      onFundPress={handleFundPress}
      onDetailsPress={handleDetailsPress}
      userId={userId}
    />
  ), [handleFundPress, handleDetailsPress, userId]);

  if (loading) {
    return (
      <LoadingView 
        HeaderComponent={<BrowseHeaderBar onSortPress={handleSortPress} />}
      />
    );
  }

  const renderBrowseEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message="Failed to load loan requests"
            icon="alert-circle"
            iconColor={colors.red}
            showBrowseButton={false}
          />
          <TouchableOpacity 
            style={[styles.actionButton, styles.retryButton]}
            onPress={loadApprovedLoans}
          >
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredRequests.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message="No loan requests available at the moment"
            icon="time-outline"
            iconColor={colors.blueGreen}
            showBrowseButton={false}
          />
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]}
            onPress={loadApprovedLoans}
          >
            <Text style={styles.actionButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (error || filteredRequests.length === 0) {
    return (
      <View style={styles.browseContent}>
        <BrowseHeaderBar onSortPress={handleSortPress} />
        {renderBrowseEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.browseContent}>
      <BrowseHeaderBar onSortPress={handleSortPress} />
      
      <InvestmentList
        data={filteredRequests}
        renderItem={renderRequestCard}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.requestsList}
      />
      
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSortSelect={handleSortSelect}
        currentSort={currentSort}
      />
      
      <LoanFundModal
        request={selectedRequest}
        visible={showFundingSheet}
        onClose={() => setShowFundingSheet(false)}
        onConfirm={handleFundingConfirm}
        userId={userId}
      />
    </View>
  );
};



// Finished Content Component
const FinishedContent = ({ onBrowsePress, userId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [finishedLoans, setFinishedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalPrincipal: 0, totalInterest: 0, avgAPR: 0 });

  const loadFinishedLoans = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const loans = await fetchCompletedLoans(userId);
      setFinishedLoans(loans);
      
      // Calculate summary
      const newSummary = loans.reduce((acc, loan) => {
        acc.totalPrincipal += loan.amountFunded;
        acc.totalInterest += loan.totalInterestEarned;
        acc.aprSum = (acc.aprSum || 0) + loan.apr;
        acc.count = (acc.count || 0) + 1;
        return acc;
      }, { totalPrincipal: 0, totalInterest: 0, aprSum: 0, count: 0 });

      setSummary({
        totalPrincipal: newSummary.totalPrincipal,
        totalInterest: newSummary.totalInterest,
        avgAPR: newSummary.count > 0 ? Math.round((newSummary.aprSum / newSummary.count) * 10) / 10 : 0
      });
    } catch (err) {
      console.error("Failed to load completed investments. Please try again later.");
      setError("Failed to load completed investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinishedLoans();
  }, [userId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFinishedLoans();
    setRefreshing(false);
  }, []);

  const handleDownloadPDF = useCallback(async (investment) => {
    if (!investment.repaymentId) {
      Alert.alert(
        'No Data Available',
        'Repayment schedule is not available for this loan.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Fetch repayment data
      const repaymentData = await getRepaymentSchedule(investment.repaymentId);
      
      // Generate and share PDF (native share dialog provides user feedback)
      await exportAndShareLoanPDF(investment, repaymentData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert(
        'Export Failed',
        'Failed to generate loan report. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleDetailsPress = useCallback((investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
  }, []);

  const handleStatsPress = useCallback(() => {
    setShowStatsModal(true);
  }, []);

  const renderFinishedCard = useCallback(({ item }) => (
    <FinishedInvestmentCard
      investment={item}
      onDownloadPDF={handleDownloadPDF}
      onDetailsPress={handleDetailsPress}
    />
  ), [handleDownloadPDF, handleDetailsPress]);

  if (loading) {
    return (
      <LoadingView 
        HeaderComponent={<FinishedHeaderBar onStatsPress={handleStatsPress} />}
      />
    );
  }

  const renderFinishedEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <EmptyState 
            message="Failed to load completed investments"
            icon="alert-circle"
            iconColor={colors.red}
            showBrowseButton={false}
          />
          <TouchableOpacity 
            style={[styles.actionButton, styles.retryButton]}
            onPress={loadFinishedLoans}
          >
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <EmptyState 
          message="Your completed investments will appear here"
          subMessage="Start investing to track your returns"
          icon="trophy-outline"
          iconColor={colors.gold}
          showBrowseButton={true}
          onBrowsePress={onBrowsePress}
        />
      </View>
    );
  };

  if (error || finishedLoans.length === 0) {
    return (
      <View style={styles.finishedContent}>
        <FinishedHeaderBar onStatsPress={handleStatsPress} />
        {renderFinishedEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.finishedContent}>
      <FinishedHeaderBar onStatsPress={handleStatsPress} />
      
      <InvestmentList
        data={finishedLoans}
        renderItem={renderFinishedCard}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.finishedList}
      />
      
      <StatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        summary={summary}
      />
      
      <FinishedLoanDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedInvestment(null);
        }}
        investment={selectedInvestment}
      />
    </View>
  );
};

const calculateMetrics = (loans) => {
  if (!loans || loans.length === 0) {
    return { active: 0, pending: 0, repaid: 0, avgAPR: 0 };
  }

  const metrics = loans.reduce((acc, loan) => {
    // Count by status
    if (loan.status === 'Awaiting admin escrow approval') {
      acc.pending++;
    } else if (loan.status === 'Money cleared for disbursement' || loan.status === 'Repayment in progress') {
      acc.active++;
    }

    // Add to total APR for average calculation
    if (loan.apr) {
      acc.totalAPR += loan.apr;
      acc.aprCount++;
    }

    return acc;
  }, {
    active: 0,
    pending: 0,
    repaid: 0,
    totalAPR: 0,
    aprCount: 0
  });

  // Calculate average APR
  metrics.avgAPR = metrics.aprCount > 0 
    ? Math.round((metrics.totalAPR / metrics.aprCount) * 10) / 10 
    : 0;

  // Remove helper properties
  delete metrics.totalAPR;
  delete metrics.aprCount;

  return metrics;
};

const Investments = ({ route }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [ongoingRefreshTrigger, setOngoingRefreshTrigger] = useState(0);
  const [metrics, setMetrics] = useState({ active: 0, pending: 0, repaid: 0, avgAPR: 0 });
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    if (route?.params?.initialTab && TABS.includes(route.params.initialTab)) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Load finished loans count for metrics
  useEffect(() => {
    if (!user?.uid) return;
    
    const loadFinishedCount = async () => {
      try {
        const loans = await fetchCompletedLoans(user.uid);
        const count = loans.length;
        setFinishedCount(count);
        // Update metrics immediately with the finished count
        setMetrics(prev => ({ ...prev, repaid: count }));
      } catch (err) {
        console.error("Failed to load finished loans count:", err);
        setFinishedCount(0);
      }
    };
    loadFinishedCount();
  }, [ongoingRefreshTrigger, user?.uid]); // Refresh when ongoing loans are updated

  const handleBrowsePress = useCallback(() => {
    setActiveTab('Browse');
  }, []);

  const handleLoanFunded = useCallback(() => {
    // Trigger Ongoing tab refresh when a loan is funded from Browse tab
    setOngoingRefreshTrigger(prev => prev + 1);
  }, []);

  const handleMetricsUpdate = useCallback((newMetrics) => {
    // Merge ongoing metrics with finished count
    setMetrics({
      ...newMetrics,
      repaid: finishedCount
    });
  }, [finishedCount]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Ongoing':
        return (
          <OngoingContent 
            onBrowsePress={handleBrowsePress} 
            refreshTrigger={ongoingRefreshTrigger}
            onMetricsUpdate={handleMetricsUpdate}
            userId={user?.uid}
          />
        );
      case 'Browse':
        return <BrowseContent onLoanFunded={handleLoanFunded} userId={user?.uid} />;
      case 'Finished':
        return <FinishedContent onBrowsePress={handleBrowsePress} userId={user?.uid} />;
      default:
        return (
          <OngoingContent 
            onBrowsePress={handleBrowsePress} 
            refreshTrigger={ongoingRefreshTrigger}
            onMetricsUpdate={handleMetricsUpdate}
            userId={user?.uid}
          />
        );
    }
  };

  return (
    <AnimatedScreen style={styles.container}>
      <Header />
      <SummaryStrip metrics={metrics} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </AnimatedScreen>
  );
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

const textStyle = {
  textAlign: 'center',
  flexShrink: 1,
};

const styles = StyleSheet.create({
  actionButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  retryButton: {
    backgroundColor: colors.red,
  },
  refreshButton: {
    backgroundColor: colors.blueGreen,
  },
  clearFilterButton: {
    backgroundColor: colors.midnightBlue,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  clearFilterButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.blueGreen,
  },
  clearFilterText: {
    color: colors.blueGreen,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
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
    top: 60,
    left: 0,
    right: 0,
    width: '102%',
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.midnightBlue,
    textAlign: 'left',
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  summaryStrip: {
    ...cardStyle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  chipsContainer: {
    paddingRight: spacing.md,
  },
  chip: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 80,
    maxWidth: 100,
    alignItems: 'center',
    flexShrink: 0,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  activeChip: {
    elevation: 4,
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    transform: [{ scale: 1.02 }],
  },
  pendingChip: {
    elevation: 3,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  repaidChip: {
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  aprChip: {
    elevation: 3,
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: colors.deepForestGreen,
  },
  chipValue: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    ...textStyle,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    marginTop: 2,
    ...textStyle,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.blueGreen,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    fontWeight: '500',
    ...textStyle,
  },
  activeTabText: {
    color: colors.midnightBlue,
    fontWeight: 'bold',
    ...textStyle,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: fontSize.lg,
    color: colors.forestGreen,
    fontWeight: '500',
  },
  // Ongoing Investments Styles
  ongoingContent: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.babyBlue,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.babyBlue,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  investmentsList: {
    padding: spacing.lg,
  },
  // Browse Components Styles
  browseContent: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  floatingSortButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.babyBlue,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  floatingSortButtonText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  requestsList: {
    padding: spacing.lg,
  },
  // Finished Components Styles
  finishedContent: {
    flex: 1,
    backgroundColor: colors.babyBlue,
  },
  finishedList: {
    padding: spacing.lg,
  },
});

export default Investments;
