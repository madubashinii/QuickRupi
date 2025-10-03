import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  RefreshControl,
  Animated,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import AnimatedScreen from '../../components/lender/AnimatedScreen';
import InvestmentCard from '../../components/lender/InvestmentCard';
import LoanRequestCard from '../../components/lender/LoanRequestCard';
import FinishedInvestmentCard from '../../components/lender/FinishedInvestmentCard';
import StatsModal from '../../components/lender/StatsModal';
import {
  TABS,
  STATUS_GROUPS,
  SORT_CONFIG,
  FILTER_OPTIONS,
  BROWSE_STATUS_OPTIONS,
  formatCurrency,
  sortByKey,
  mockOngoingInvestments,
  mockLoanRequests,
  mockFinishedInvestments,
  mockInvestments
} from '../../components/lender/investmentUtils';
import {
  OngoingHeaderBar,
  HeaderBar,
  BrowseHeaderBar,
  FinishedHeaderBar
} from '../../components/lender/InvestmentHeaders';
import {
  BaseModal,
  FilterMenu,
  SortMenu,
  SortModal,
  FundingSheet,
  FinishedLoanDetailsModal
} from '../../components/lender/InvestmentModals';
import {
  EmptyState,
  BrowseEmptyState
} from '../../components/lender/InvestmentEmptyStates';
import {
  useInvestmentMetrics,
  useOngoingInvestments,
  useBrowseRequests,
  useFinishedInvestmentsSummary
} from '../../components/lender/InvestmentHooks';

const BACKGROUND_HEIGHT = 280;



// UI Components
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

const SummaryStrip = ({ metrics }) => (
  <View style={styles.summaryStrip}>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      <Chip 
        label="Active" 
        value={metrics.active} 
        backgroundColor={colors.blueGreen}
        textColor={colors.white}
        labelColor={colors.white}
      />
      <Chip 
        label="Pending" 
        value={metrics.pending} 
        backgroundColor="#FFB347"
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




// Filter and Sort Controls
const FilterSortControls = ({ sortBy, filterBy, onSortChange, onFilterChange }) => (
  <View style={styles.controlsContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {FILTER_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.key}
          style={[styles.filterChip, filterBy === option.key && styles.activeFilterChip]}
          onPress={() => onFilterChange(option.key)}
        >
          <Text style={[styles.filterChipText, filterBy === option.key && styles.activeFilterChipText]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    
    <TouchableOpacity style={styles.sortButton} onPress={() => {}}>
      <Ionicons name="swap-vertical" size={16} color={colors.midnightBlue} />
      <Text style={styles.sortButtonText}>Sort</Text>
    </TouchableOpacity>
  </View>
);


// Ongoing Investments Content
const OngoingContent = ({ onBrowsePress }) => {
  const [sortBy, setSortBy] = useState('nextDue');
  const [filterBy, setFilterBy] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const filteredInvestments = useOngoingInvestments(mockOngoingInvestments, sortBy, filterBy);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDetailsPress = useCallback((investment) => {
    console.log('Details pressed for:', investment.borrowerName);
  }, []);

  const handleTopUpPress = useCallback((investment) => {
    console.log('Top-up pressed for:', investment.borrowerName);
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

  if (filteredInvestments.length === 0) {
    return (
      <View style={styles.ongoingContent}>
        <OngoingHeaderBar
          onFilterPress={handleFilterMenuToggle}
          onSortPress={handleSortMenuToggle}
        />
        <EmptyState onBrowsePress={onBrowsePress} />
        <FilterMenu
          visible={showFilterMenu}
          onClose={() => setShowFilterMenu(false)}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
        />
        <SortMenu
          visible={showSortMenu}
          onClose={() => setShowSortMenu(false)}
          sortBy={sortBy}
          onSortChange={setSortBy}
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
      
      <FlatList
        data={filteredInvestments}
        renderItem={renderInvestmentCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.investmentsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          // Implement infinite scroll here
          console.log('Load more investments');
        }}
        onEndReachedThreshold={0.1}
      />
      
      <FilterMenu
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
      />
      <SortMenu
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </View>
  );
};






// Browse Content Component
const BrowseContent = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showFundingSheet, setShowFundingSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [currentSort, setCurrentSort] = useState('newest');
  const [sortedRequests, setSortedRequests] = useState(mockLoanRequests);
  
  const filteredRequests = sortedRequests; // Use sorted requests

  const sortRequests = useCallback((sortKey) => {
    const sortedRequests = sortByKey(mockLoanRequests, sortKey);
    setSortedRequests(sortedRequests);
    setCurrentSort(sortKey);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      sortRequests(currentSort); // Re-sort after refresh
    }, 1000);
  }, [currentSort, sortRequests]);

  const handleFundPress = useCallback((request) => {
    setSelectedRequest(request);
    setShowFundingSheet(true);
  }, []);

  const handleDetailsPress = useCallback((request) => {
    console.log('Details pressed for:', request.borrowerName);
    // Handle details navigation here
  }, []);

  const handleFundingConfirm = useCallback((request, amount) => {
    console.log('Funding confirmed:', request.borrowerName, 'Amount:', amount);
    // Handle funding logic here
  }, []);

  const handleSortPress = useCallback(() => {
    setShowSortModal(true);
  }, []);

  const handleSortSelect = useCallback((sortKey) => {
    sortRequests(sortKey);
  }, [sortRequests]);

  const renderRequestCard = useCallback(({ item }) => (
    <LoanRequestCard
      request={item}
      onFundPress={handleFundPress}
      onDetailsPress={handleDetailsPress}
    />
  ), [handleFundPress, handleDetailsPress]);

  return (
    <View style={styles.browseContent}>
      <BrowseHeaderBar onSortPress={handleSortPress} />
      
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.requestsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          console.log('Load more requests');
        }}
        onEndReachedThreshold={0.1}
      />
      
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSortSelect={handleSortSelect}
        currentSort={currentSort}
      />
      
      <FundingSheet
        request={selectedRequest}
        visible={showFundingSheet}
        onClose={() => setShowFundingSheet(false)}
        onConfirm={handleFundingConfirm}
      />
    </View>
  );
};

// Finished Summary Row Component
const FinishedSummaryRow = ({ summary }) => {
  const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;

  return (
    <View style={styles.finishedSummaryRow}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name="wallet-outline" size={24} color={colors.midnightBlue} />
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Principal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.totalPrincipal)}</Text>
        </View>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name="trending-up-outline" size={24} color={colors.blueGreen} />
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Interest</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.totalInterest)}</Text>
        </View>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name="analytics-outline" size={24} color={colors.forestGreen} />
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Average APR</Text>
          <Text style={styles.summaryValue}>{summary.avgAPR}%</Text>
        </View>
      </View>
    </View>
  );
};


// Finished Content Component
const FinishedContent = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  
  const summary = useFinishedInvestmentsSummary(mockFinishedInvestments);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDownloadPDF = useCallback((investment) => {
    console.log('Download PDF for:', investment.borrowerName);
    // Handle PDF download logic here
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

  return (
    <View style={styles.finishedContent}>
      <FinishedHeaderBar onStatsPress={handleStatsPress} />
      
      <FlatList
        data={mockFinishedInvestments}
        renderItem={renderFinishedCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.finishedList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          console.log('Load more finished investments');
        }}
        onEndReachedThreshold={0.1}
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

const Investments = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const metrics = useInvestmentMetrics(mockInvestments);

  const handleBrowsePress = useCallback(() => {
    setActiveTab('Browse');
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Ongoing':
        return <OngoingContent onBrowsePress={handleBrowsePress} />;
      case 'Browse':
        return <BrowseContent />;
      case 'Finished':
        return <FinishedContent />;
      default:
        return <OngoingContent onBrowsePress={handleBrowsePress} />;
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
  finishedSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: fontSize.base,
    color: colors.midnightBlue,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finishedList: {
    padding: spacing.lg,
  },
});

export default Investments;
