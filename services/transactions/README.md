# Transaction Service

Transaction management for QuickRupi. Handles wallet transactions with real-time updates.

## Quick Import

```javascript
import { 
  createTransaction,
  subscribeToUserTransactions,
  formatTransactionForDisplay,
  exportAndShareCSV,
  exportAndSharePDF,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS
} from '../../services/transactions';
import { useAuth } from '../../context/AuthContext';
```

## Transaction Schema

```javascript
{
  transactionId: string,        // Auto-generated
  userId: string,               // From Firebase Auth
  amount: number,               
  type: "topup" | "withdraw" | "investment" | "repayment",
  loanId: string | null,        // For investment/repayment
  status: "pending" | "completed" | "failed",
  timestamp: Firestore timestamp,
  description: string | null,
  paymentMethodId: string | null
}
```

## Usage Example

```javascript
const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUserTransactions(
      user.uid,
      ({ transactions, hasMore, lastVisible }) => {
        const formatted = transactions.map(formatTransactionForDisplay);
        setTransactions(formatted);
      },
      10 // Limit
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleLoadMore = async () => {
    const { transactions: more } = await getMoreTransactions(
      user.uid,
      lastTransaction,
      10
    );
    setTransactions(prev => [...prev, ...more]);
  };

  return (/* UI */);
};
```

## Core Functions

All functions require authenticated `userId` from `useAuth()`.

**Create Transaction**
```javascript
await createTransaction({
  userId: user.uid,
  type: TRANSACTION_TYPES.TOPUP,
  amount: 5000,
  paymentMethodId: 'pm_123',
  description: 'Wallet top-up'
});
```

**Query Transactions**
```javascript
const txns = await getTransactionsByUserId(user.uid, {
  type: TRANSACTION_TYPES.INVESTMENT,
  status: TRANSACTION_STATUS.COMPLETED,
  limitCount: 50
});
```

**Update Status**
```javascript
await updateTransactionStatus(transactionId, TRANSACTION_STATUS.FAILED);
```

## Utility Functions

**Format for UI Display**
```javascript
const formatted = formatTransactionForDisplay(transaction);
// Adds: isPositive, icon, formattedAmount, displayDescription, statusColor
```

**Client-side Filtering**
```javascript
const deposits = applyTransactionFilter(transactions, 'deposits');
// Keys: all, deposits, payouts, repayments, fees

const filtered = filterTransactionsByDateRange(transactions, startDate, endDate);
```

## Export Functions

**CSV Export**
```javascript
const handleExport = async () => {
  const result = await exportAndShareCSV(transactions, 'all');
  // Handles: generation → cache → share → cleanup
};
```

**PDF Export**
```javascript
const handlePDFExport = async () => {
  const result = await exportAndSharePDF(transactions, 'all');
  // Professional A4 document with summary & styling
};
```

## Validation

All operations auto-validate. Manual validation:
- `validateTransactionType(type)`
- `validateTransactionStatus(status)` 
- `validateTransactionData(data)`

## Key Features

- ✅ Real-time Firestore snapshots
- ✅ Automatic validation
- ✅ Pagination support
- ✅ CSV/PDF export with native share
- ✅ Client-side filtering
- ✅ UTC timestamps (serverTimestamp)
- ✅ Sorted newest first