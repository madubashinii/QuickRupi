// Constants
export const TABS = ['Ongoing', 'Browse', 'Finished'];

export const STATUS_GROUPS = {
  active: ['Active', 'PendingRelease'],
  pending: ['Pending'],
  repaid: ['Repaid', 'Closed']
};

export const SORT_CONFIG = {
  ongoing: [
    { key: 'nextDue', label: 'Next Due' },
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'apr', label: 'APR' }
  ],
  browse: [
    { key: 'newest', label: 'Newest First', icon: 'calendar-outline' },
    { key: 'oldest', label: 'Oldest First', icon: 'calendar-outline' },
    { key: 'repayment-shortest', label: 'Repayment Period (Shortest → Longest)', icon: 'time-outline' },
    { key: 'repayment-longest', label: 'Repayment Period (Longest → Shortest)', icon: 'time-outline' },
    { key: 'amount-high', label: 'Amount Requested (High → Low)', icon: 'trending-up-outline' },
    { key: 'amount-low', label: 'Amount Requested (Low → High)', icon: 'trending-down-outline' },
    { key: 'apr-high', label: 'APR (High → Low)', icon: 'trending-up-outline' },
    { key: 'apr-low', label: 'APR (Low → High)', icon: 'trending-down-outline' },
  ]
};

export const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'dueThisWeek', label: 'Due this week' },
  { key: 'overdue', label: 'Overdue' }
];

export const BROWSE_STATUS_OPTIONS = [
  { key: 'all', label: 'All Status' },
  { key: 'approved', label: 'Approved' },
  { key: 'underReview', label: 'Under Review' }
];

// Utility functions
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  return `LKR ${Number(amount).toLocaleString()}`;
};

export const sortByKey = (items, sortKey, dataKey = null) => {
  if (!items || items.length === 0) return items;
  
  const key = dataKey || sortKey;
  
  switch (sortKey) {
    case 'newest':
      return [...items].sort((a, b) => {
        const dateA = new Date(a.requestDate || a.createdAt || 0);
        const dateB = new Date(b.requestDate || b.createdAt || 0);
        return dateB - dateA;
      });
      
    case 'oldest':
      return [...items].sort((a, b) => {
        const dateA = new Date(a.requestDate || a.createdAt || 0);
        const dateB = new Date(b.requestDate || b.createdAt || 0);
        return dateA - dateB;
      });
      
    case 'repayment-shortest':
      return [...items].sort((a, b) => (a.termMonths || 0) - (b.termMonths || 0));
      
    case 'repayment-longest':
      return [...items].sort((a, b) => (b.termMonths || 0) - (a.termMonths || 0));
      
    case 'amount-high':
      return [...items].sort((a, b) => {
        const amountA = a.amountRequested || a.amountFunded || 0;
        const amountB = b.amountRequested || b.amountFunded || 0;
        return amountB - amountA;
      });
      
    case 'amount-low':
      return [...items].sort((a, b) => {
        const amountA = a.amountRequested || a.amountFunded || 0;
        const amountB = b.amountRequested || b.amountFunded || 0;
        return amountA - amountB;
      });
      
    case 'apr-high':
      return [...items].sort((a, b) => {
        const aprA = parseFloat(a.interestRate || a.apr || 0);
        const aprB = parseFloat(b.interestRate || b.apr || 0);
        return aprB - aprA;
      });
      
    case 'apr-low':
      return [...items].sort((a, b) => {
        const aprA = parseFloat(a.interestRate || a.apr || 0);
        const aprB = parseFloat(b.interestRate || b.apr || 0);
        return aprA - aprB;
      });
      
    default:
      return items;
  }
};

// All mock data removed - components now use real data from Firebase service