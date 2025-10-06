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
export const formatCurrency = (amount) => `LKR ${amount.toLocaleString()}`;

export const sortByKey = (items, sortKey, dataKey = null) => {
  const key = dataKey || sortKey;
  switch (sortKey) {
    case 'newest':
      return [...items].sort((a, b) => new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt));
    case 'oldest':
      return [...items].sort((a, b) => new Date(a.requestDate || a.createdAt) - new Date(b.requestDate || b.createdAt));
    case 'repayment-shortest':
      return [...items].sort((a, b) => a.termMonths - b.termMonths);
    case 'repayment-longest':
      return [...items].sort((a, b) => b.termMonths - a.termMonths);
    case 'amount-high':
      return [...items].sort((a, b) => (b.amountRequested || b.amountFunded) - (a.amountRequested || a.amountFunded));
    case 'amount-low':
      return [...items].sort((a, b) => (a.amountRequested || a.amountFunded) - (b.amountRequested || b.amountFunded));
    case 'apr-high':
      return [...items].sort((a, b) => (b.estAPR || b.apr) - (a.estAPR || a.apr));
    case 'apr-low':
      return [...items].sort((a, b) => (a.estAPR || a.apr) - (b.estAPR || b.apr));
    default:
      return items;
  }
};

// Mock data for ongoing investments
export const mockOngoingInvestments = [
  {
    id: 1,
    borrowerName: 'John Silva',
    borrowerId: 'BRW-001',
    loanPurpose: 'Small Business Expansion',
    amountFunded: 50000,
    apr: 12.5,
    termMonths: 24,
    amountRepaid: 15000,
    repaymentAmount: 50000,
    nextDueDate: '2024-12-20',
    nextDueAmount: 2500,
    status: 'On time',
    fundedDate: '2024-01-15',
    isPartialFunding: false
  },
  {
    id: 2,
    borrowerName: 'Maria Perera',
    borrowerId: 'BRW-002',
    loanPurpose: 'Equipment Purchase',
    amountFunded: 25000,
    apr: 15.0,
    termMonths: 18,
    amountRepaid: 8000,
    repaymentAmount: 25000,
    nextDueDate: '2024-12-18',
    nextDueAmount: 1500,
    status: 'Due soon',
    fundedDate: '2024-03-10',
    isPartialFunding: true
  },
  {
    id: 3,
    borrowerName: 'David Fernando',
    borrowerId: 'BRW-003',
    loanPurpose: 'Working Capital',
    amountFunded: 75000,
    apr: 18.0,
    termMonths: 36,
    amountRepaid: 25000,
    repaymentAmount: 75000,
    nextDueDate: '2024-12-15',
    nextDueAmount: 3500,
    status: 'Overdue',
    fundedDate: '2024-02-20',
    isPartialFunding: false
  },
  {
    id: 4,
    borrowerName: 'Sarah Wijesinghe',
    borrowerId: 'BRW-004',
    loanPurpose: 'Inventory Purchase',
    amountFunded: 30000,
    apr: 14.0,
    termMonths: 12,
    amountRepaid: 12000,
    repaymentAmount: 30000,
    nextDueDate: '2024-12-22',
    nextDueAmount: 2000,
    status: 'On time',
    fundedDate: '2024-04-05',
    isPartialFunding: false
  }
];

// Mock data for loan requests
export const mockLoanRequests = [
  {
    id: 101,
    borrowerName: 'Kamal Perera',
    borrowerId: 'BRW-101',
    amountRequested: 75000,
    purpose: 'Restaurant Equipment Purchase',
    termMonths: 24,
    estAPR: 16.5,
    status: 'Approved',
    requestDate: '2024-12-10',
    riskLevel: 'Medium',
    location: 'Colombo 03'
  },
  {
    id: 102,
    borrowerName: 'Priya Fernando',
    borrowerId: 'BRW-102',
    amountRequested: 45000,
    purpose: 'Textile Business Expansion',
    termMonths: 18,
    estAPR: 14.2,
    status: 'Under Review',
    requestDate: '2024-12-08',
    riskLevel: 'Low',
    location: 'Kandy'
  },
  {
    id: 103,
    borrowerName: 'Ravi Silva',
    borrowerId: 'BRW-103',
    amountRequested: 120000,
    purpose: 'Construction Materials',
    termMonths: 36,
    estAPR: 18.8,
    status: 'Approved',
    requestDate: '2024-12-05',
    riskLevel: 'High',
    location: 'Galle'
  },
  {
    id: 104,
    borrowerName: 'Nisha Wijesinghe',
    borrowerId: 'BRW-104',
    amountRequested: 30000,
    purpose: 'Mobile Phone Shop Inventory',
    termMonths: 12,
    estAPR: 12.5,
    status: 'Approved',
    requestDate: '2024-12-12',
    riskLevel: 'Low',
    location: 'Negombo'
  },
  {
    id: 105,
    borrowerName: 'Dilshan Karunaratne',
    borrowerId: 'BRW-105',
    amountRequested: 85000,
    purpose: 'Fishing Boat Repair',
    termMonths: 30,
    estAPR: 17.2,
    status: 'Under Review',
    requestDate: '2024-12-07',
    riskLevel: 'Medium',
    location: 'Batticaloa'
  },
  {
    id: 106,
    borrowerName: 'Anjali Pathirana',
    borrowerId: 'BRW-106',
    amountRequested: 55000,
    purpose: 'Beauty Salon Setup',
    termMonths: 20,
    estAPR: 15.8,
    status: 'Approved',
    requestDate: '2024-12-11',
    riskLevel: 'Medium',
    location: 'Matara'
  }
];

// Mock data for finished investments
export const mockFinishedInvestments = [
  {
    id: 201,
    borrowerName: 'Samantha Perera',
    borrowerId: 'BRW-201',
    loanPurpose: 'Restaurant Renovation',
    principalAmount: 80000,
    interestEarned: 24000,
    totalReturn: 104000,
    startDate: '2023-01-15',
    endDate: '2024-01-15',
    termMonths: 12,
    actualAPR: 15.2,
    status: 'Repaid',
    finalRating: 'Excellent',
    location: 'Colombo 07'
  },
  {
    id: 202,
    borrowerName: 'Rajesh Fernando',
    borrowerId: 'BRW-202',
    loanPurpose: 'Textile Manufacturing',
    principalAmount: 150000,
    interestEarned: 45000,
    totalReturn: 195000,
    startDate: '2022-06-10',
    endDate: '2024-06-10',
    termMonths: 24,
    actualAPR: 18.5,
    status: 'Repaid',
    finalRating: 'Good',
    location: 'Kandy'
  },
  {
    id: 203,
    borrowerName: 'Priya Silva',
    borrowerId: 'BRW-203',
    loanPurpose: 'Beauty Salon Equipment',
    principalAmount: 45000,
    interestEarned: 11250,
    totalReturn: 56250,
    startDate: '2023-03-20',
    endDate: '2024-03-20',
    termMonths: 12,
    actualAPR: 12.8,
    status: 'Closed',
    finalRating: 'Good',
    location: 'Negombo'
  },
  {
    id: 204,
    borrowerName: 'Dilshan Wijesinghe',
    borrowerId: 'BRW-204',
    loanPurpose: 'Fishing Equipment',
    principalAmount: 120000,
    interestEarned: 36000,
    totalReturn: 156000,
    startDate: '2022-09-05',
    endDate: '2024-09-05',
    termMonths: 24,
    actualAPR: 16.8,
    status: 'Repaid',
    finalRating: 'Excellent',
    location: 'Galle'
  },
  {
    id: 205,
    borrowerName: 'Nisha Karunaratne',
    borrowerId: 'BRW-205',
    loanPurpose: 'Mobile Phone Shop',
    principalAmount: 60000,
    interestEarned: 15000,
    totalReturn: 75000,
    startDate: '2023-08-12',
    endDate: '2024-08-12',
    termMonths: 12,
    actualAPR: 13.5,
    status: 'Repaid',
    finalRating: 'Good',
    location: 'Matara'
  },
  {
    id: 206,
    borrowerName: 'Kamal Pathirana',
    borrowerId: 'BRW-206',
    loanPurpose: 'Construction Materials',
    principalAmount: 200000,
    interestEarned: 80000,
    totalReturn: 280000,
    startDate: '2021-12-01',
    endDate: '2024-12-01',
    termMonths: 36,
    actualAPR: 19.2,
    status: 'Repaid',
    finalRating: 'Excellent',
    location: 'Batticaloa'
  }
];

// Mock data - replace with actual data source
export const mockInvestments = [
  { id: 1, amount: 10000, apr: 12.5, status: 'Active' },
  { id: 2, amount: 5000, apr: 15.0, status: 'PendingRelease' },
  { id: 3, amount: 8000, apr: 10.0, status: 'Repaid' },
  { id: 4, amount: 12000, apr: 18.0, status: 'Active' },
  { id: 5, amount: 3000, apr: 14.0, status: 'Closed' },
  { id: 6, amount: 7000, apr: 16.0, status: 'Pending' },
];
