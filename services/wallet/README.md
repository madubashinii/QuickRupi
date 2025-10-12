# Wallet Service

Wallet management for QuickRupi lenders. Real-time balance tracking with automatic transaction logging.

## Quick Import

```javascript
import { 
  initializeUserWallet,
  subscribeToWallet,
  addFunds,
  withdrawFunds,
  formatCurrency
} from '../../services/wallet';
import { useAuth } from '../../context/AuthContext';
```

## Business Rules

**WALLETS ARE FOR LENDERS ONLY**
- Only users with `role='lender'` have wallets
- Borrowers do NOT have wallets
- Balance cannot be negative
- All amounts must be positive
- Real-time updates via Firestore

## Wallet Schema

**Collection:** `wallets`

```javascript
{
  walletId: string,       // Auto-generated
  userId: string,         // From Firebase Auth (indexed)
  balance: number,        // Current balance (>= 0)
  currency: string,       // Default: "LKR"
  lastUpdated: Timestamp  // Auto-updated
}
```

## Usage Example

```javascript
const Transactions = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    // Initialize wallet
    const setup = async () => {
      await initializeUserWallet(user.uid);
    };
    setup();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToWallet(user.uid, (walletData) => {
      setBalance(walletData.balance);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddFunds = async (amount) => {
    const newBalance = await addFunds(user.uid, amount);
    // Balance updates automatically via subscription
  };

  const handleWithdraw = async (amount) => {
    const hasFunds = await checkSufficientBalance(user.uid, amount);
    if (!hasFunds) throw new Error('Insufficient balance');
    
    const newBalance = await withdrawFunds(user.uid, amount);
  };

  return (/* UI */);
};
```

## Core Functions

All functions require authenticated `userId` from `useAuth()`.

**Initialize Wallet**
```javascript
await initializeUserWallet(user.uid);
// Creates wallet if doesn't exist (balance: 0)
```

**Add Funds**
```javascript
const newBalance = await addFunds(user.uid, 5000, paymentMethodId);
// Returns new balance, creates transaction record
```

**Withdraw Funds**
```javascript
const newBalance = await withdrawFunds(user.uid, 1000, paymentMethodId);
// Returns new balance, creates transaction record
// Throws error if insufficient balance
```

**Real-time Updates**
```javascript
const unsubscribe = subscribeToWallet(user.uid, (walletData) => {
  setBalance(walletData.balance);
});
// Cleanup: unsubscribe()
```

**Query Balance**
```javascript
const balance = await getWalletBalance(user.uid);
// Returns number or null
```

## Validation Functions

```javascript
validateAmount(amount)              // Checks positive & finite
validateWalletData(data)            // Validates structure
checkSufficientBalance(userId, amt) // Async balance check
validateLenderRole(role)            // Checks role='lender'
```

## Utility Functions

**Format Currency**
```javascript
formatCurrency(10500.50)  // "LKR 10,500.50"
parseCurrencyString("LKR 10,500.50")  // 10500.5
```

**Balance Calculations**
```javascript
hasSufficientBalance(walletBalance, amount)  // UI validation
calculateNewBalance(current, amount, 'add')  // Preview
```

## Key Features

- ✅ Lender-only wallets
- ✅ Real-time Firestore sync
- ✅ Auto-creates transaction records
- ✅ Sends notifications on changes
- ✅ Automatic validation
- ✅ Balance >= 0 constraint
- ✅ UTC timestamps

## Error Handling

```javascript
try {
  await withdrawFunds(user.uid, amount);
} catch (error) {
  // Errors: "Invalid amount", "Insufficient balance", "Wallet not found"
  console.error(error.message);
}
```
