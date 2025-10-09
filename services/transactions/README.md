# Transaction Service

Transaction management system for QuickRupi. Handles wallet top-ups, withdrawals, investments, and repayments with real-time updates.

## Quick Import

```javascript
import { 
  createTransaction,
  subscribeToUserTransactions,
  formatTransactionForDisplay,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS
} from '../../services/transactions';
```

## Transaction Schema

```javascript
{
  transactionId: string,        // Auto-generated
  userId: string,               // e.g., "L001"
  amount: number,               // Transaction amount
  type: "topup" | "withdraw" | "investment" | "repayment",
  loanId: string | null,        // Required for investment/repayment
  status: "pending" | "completed" | "failed",
  timestamp: Firestore timestamp,
  description: string | null,
  paymentMethodId: string | null
}
```

## Core Functions

### Create Transaction
```javascript
const transaction = await createTransaction({
  userId: 'L001',
  type: TRANSACTION_TYPES.TOPUP,
  amount: 5000,
  paymentMethodId: 'pm_123',    // Optional
  description: 'Wallet top-up'  // Optional
});
```

### Real-time Subscription
```javascript
const unsubscribe = subscribeToUserTransactions(
  'L001',
  ({ transactions, hasMore, lastVisible }) => {
    const formatted = transactions.map(formatTransactionForDisplay);
    setTransactions(formatted);
  },
  10 // Limit (optional, default: 10)
);

// Cleanup
return () => unsubscribe();
```

### Load More (Pagination)
```javascript
const { transactions, hasMore, lastVisible } = await getMoreTransactions(
  'L001',
  lastTransaction,
  10
);
```

### Other Operations
```javascript
// Get transactions with filters
const txns = await getTransactionsByUserId('L001', {
  type: TRANSACTION_TYPES.INVESTMENT,
  status: TRANSACTION_STATUS.COMPLETED,
  limitCount: 50
});

// Update status
await updateTransactionStatus(transactionId, TRANSACTION_STATUS.FAILED);

// Get single transaction
const txn = await getTransactionById(transactionId);
```

## Utility Functions

### Format for UI Display
Adds display properties: `isPositive`, `icon`, `formattedAmount`, `displayDescription`, `statusColor`

```javascript
const formatted = formatTransactionForDisplay(transaction);
// formatted.formattedAmount => "+ LKR 5,000"
// formatted.icon => "arrow-down-circle"
```

### Client-side Filtering
```javascript
// Filter by type
const deposits = applyTransactionFilter(transactions, 'deposits');

// Filter by date range
const filtered = filterTransactionsByDateRange(
  transactions,
  startDate,
  endDate
);
```

## Filter Keys
- `all` - All transactions
- `deposits` - Topups + Repayments
- `payouts` - Withdrawals + Investments
- `repayments` - Repayments only
- `fees` - Reserved for future use

## Validation

All create/update operations validate automatically. Manual validation available:
- `validateTransactionType(type)` 
- `validateTransactionStatus(status)`
- `validateTransactionData(data)` - Returns `{ valid, error? }`

## Export Functionality

### Quick Export (Recommended)
```javascript
import { exportAndShareCSV, getExportSummary } from '../services/transactions';

// One-line export with file handling
const handleExport = async () => {
  try {
    const summary = getExportSummary(transactions);
    console.log(`Exporting ${summary.count} transactions...`);
    
    const result = await exportAndShareCSV(transactions, 'deposits');
    console.log(`✅ ${result.message}`);
  } catch (error) {
    console.error('Export failed:', error.message);
  }
};
```

### Manual Export (Advanced)
```javascript
import { exportToCSV } from '../services/transactions';

const csvData = exportToCSV(transactions);
// csvData = { content, filename, mimeType, count, success }
// Handle file saving and sharing manually
```

### Export Features
- ✅ Saves to device cache directory
- ✅ Triggers native share dialog (iOS/Android)
- ✅ Automatic cleanup after sharing
- ✅ UTF-8 BOM for Excel compatibility
- ✅ Handles special characters
- ✅ Dynamic filenames with timestamps

### Export Workflow
1. Generate CSV → 2. Save to cache → 3. Share → 4. Cleanup

## Important Notes

- All transactions use Firestore `serverTimestamp()`
- Default sort: newest first
- Real-time updates via Firestore snapshots
- Built-in validation on all CRUD operations
- Export uses device cache directory (auto-cleared by OS)
- Pagination support with `hasMore` and `lastVisible`