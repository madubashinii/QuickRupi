# Wallet Service

Minimal wallet management service for QuickRupi lenders.

##  Business Rules

** WALLETS ARE FOR LENDERS ONLY**
-  Only users with `role='lender'` can have wallets
-  Borrowers do NOT have wallets
-  Balance cannot be negative
-  All amounts must be positive numbers
-  Withdrawals require sufficient balance
-  Real-time updates via Firestore listeners

## Data Schemas

### Wallet Schema
**Collection**: `wallets`

```javascript
{
  walletId: string,       // Auto-generated document ID (primary key)
  userId: string,         // Reference to user (indexed)
  balance: number,        // Current wallet balance (>= 0)
  currency: string,       // Currency code (default: "LKR")
  lastUpdated: Timestamp  // Server timestamp (auto-updated)
}
```

### Transaction Data (passed to callbacks)
```javascript
{
  amount: number,         // Transaction amount
  newBalance: number,     // Updated balance (for addFunds)
  account: object,        // Payment method object (for withdrawals)
  paymentMethod: string   // Type: 'card' or 'bank'
}
```

## API Reference

### Validation Functions

#### `validateWalletData(data)`
```javascript
/**
 * Validates wallet data structure
 * @param {Object} data - Wallet object to validate
 * @returns {boolean} True if valid wallet structure
 */
```

#### `validateAmount(amount)`
```javascript
/**
 * Validates amount is positive and finite
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if valid amount
 */
```

#### `checkSufficientBalance(userId, amount)`
```javascript
/**
 * Checks if user has sufficient balance
 * @param {string} userId - User ID
 * @param {number} amount - Amount to check
 * @returns {Promise<boolean>} True if sufficient balance
 * @throws {Error} If wallet not found
 */
```

#### `validateLenderRole(userRole)`
```javascript
/**
 * Validates user role is 'lender'
 * @param {string} userRole - User role
 * @returns {boolean} True if role is 'lender'
 */
```

### Core Functions

#### `createWallet(userId, initialBalance = 0)`
```javascript
/**
 * Creates new wallet for lender
 * @param {string} userId - User ID (must be lender)
 * @param {number} initialBalance - Starting balance (default: 0)
 * @returns {Promise<Object>} Created wallet data
 */
```

#### `getWalletByUserId(userId)`
```javascript
/**
 * Retrieves wallet by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Wallet data or null
 */
```

#### `getWalletById(walletId)`
```javascript
/**
 * Retrieves wallet by wallet ID
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object|null>} Wallet data or null
 */
```

#### `updateWalletBalance(walletId, newBalance)`
```javascript
/**
 * Updates wallet balance
 * @param {string} walletId - Wallet ID
 * @param {number} newBalance - New balance value
 * @returns {Promise<void>}
 */
```

#### `addFunds(userId, amount)`
```javascript
/**
 * Adds funds to wallet
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add (must be positive)
 * @returns {Promise<number>} New balance
 * @throws {Error} If invalid amount or wallet not found
 */
```

#### `withdrawFunds(userId, amount)`
```javascript
/**
 * Withdraws funds from wallet
 * @param {string} userId - User ID
 * @param {number} amount - Amount to withdraw (must be positive)
 * @returns {Promise<number>} New balance
 * @throws {Error} If insufficient balance, invalid amount, or wallet not found
 */
```

#### `getWalletBalance(userId)`
```javascript
/**
 * Gets current wallet balance
 * @param {string} userId - User ID
 * @returns {Promise<number|null>} Balance or null if wallet not found
 */
```

#### `subscribeToWallet(userId, onUpdate)`
```javascript
/**
 * Subscribes to real-time wallet updates
 * @param {string} userId - User ID
 * @param {Function} onUpdate - Callback function (receives walletData)
 * @returns {Function} Unsubscribe function
 */
```

### Utility Functions

*Frontend helpers - Pure functions for UI calculations*

#### `formatCurrency(amount, currency = 'LKR')`
```javascript
/**
 * Formats amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'LKR')
 * @returns {string} Formatted string (e.g., "LKR 1,000.00")
 */
```

#### `parseCurrencyString(currencyString)`
```javascript
/**
 * Extracts numeric value from currency string
 * @param {string} currencyString - Formatted currency string
 * @returns {number} Numeric value
 */
```

#### `hasSufficientBalance(walletBalance, amount)`
```javascript
/**
 * Frontend validation (no DB query)
 * @param {number} walletBalance - Current balance
 * @param {number} amount - Amount to check
 * @returns {boolean} True if sufficient
 */
```

#### `calculateNewBalance(currentBalance, amount, operation = 'add')`
```javascript
/**
 * Calculates new balance (UI preview only)
 * @param {number} currentBalance - Current balance
 * @param {number} amount - Amount to add/subtract
 * @param {string} operation - 'add' or 'subtract'
 * @returns {number} Calculated balance
 */
```

## Usage Examples

### 1. Initialize Wallet (First Load)
```javascript
import { initializeUserWallet } from '../../services/wallet';

useEffect(() => {
  const setupWallet = async () => {
    await initializeUserWallet('L001'); // Creates if doesn't exist
  };
  setupWallet();
}, []);
```

### 2. Real-time Balance Updates
```javascript
import { subscribeToWallet } from '../../services/wallet';

useEffect(() => {
  const unsubscribe = subscribeToWallet('L001', (walletData) => {
    setBalance(walletData.balance);
  });
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### 3. Add Funds
```javascript
import { addFunds } from '../../services/wallet';

const handleAddFunds = async () => {
  const amount = 5000;
  const newBalance = await addFunds('L001', amount);
  console.log('New balance:', newBalance);
};
```

### 4. Withdraw with Validation
```javascript
import { checkSufficientBalance, withdrawFunds } from '../../services/wallet';

const handleWithdraw = async () => {
  const amount = 1000;
  
  // Check balance first
  const hasFunds = await checkSufficientBalance('L001', amount);
  if (!hasFunds) {
    setError('Insufficient balance');
    return;
  }
  
  // Proceed with withdrawal
  const newBalance = await withdrawFunds('L001', amount);
  console.log('Withdrawn successfully');
};
```

### 5. Format Currency for Display
```javascript
import { formatCurrency, parseCurrencyString } from '../../services/wallet';

const balance = 10500.50;
const formatted = formatCurrency(balance); // "LKR 10,500.50"
const parsed = parseCurrencyString("LKR 10,500.50"); // 10500.5
```

### 6. Role Validation (Before Creating Wallet)
```javascript
import { validateLenderRole, createWallet } from '../../services/wallet';

const userRole = 'lender'; // From user profile
if (validateLenderRole(userRole)) {
  await createWallet(userId, 1000); // Initial balance: 1000
} else {
  console.log('Only lenders can have wallets');
}
```

## Wallet Initialization

### Rules
-  **Only LENDERS get wallets**
-  **Borrowers do NOT have wallets**
-  **Wallet created on FIRST APP LOAD**

### Development Mode (Current)
```javascript
import { initializeUserWallet } from '../../services/wallet';

// In Transactions screen (or wherever wallet is needed)
useEffect(() => {
  const setupWallet = async () => {
    try {
      await initializeUserWallet('L001');
      setWalletLoading(false);
    } catch (error) {
      setWalletError(error.message);
      setWalletLoading(false);
    }
  };
  setupWallet();
}, []);
```

**Behavior:**
- Always uses hardcoded userId: `"L001"`
- Checks if wallet exists
- Creates with balance `0` if doesn't exist
- Returns wallet data
- **Location:** Initialize in screens that need wallet (e.g., Transactions)

## Firestore Setup

Ensure Firebase is configured in `../firebaseConfig.js`. May require composite index:
- Collection: `wallets`
- Field: `userId` (Ascending)

## Function Summary

- **Service Functions:** 8 core + 4 validation = 12 total
- **Utility Functions:** 4 (for UI/frontend)
- **Initialization:** 1 (dev mode with L001)
- **Total:** 17 functions

## Error Handling

```javascript
// All service functions throw errors on failure
try {
  await withdrawFunds(userId, amount);
} catch (error) {
  // Possible errors:
  // - "Invalid amount"
  // - "Insufficient balance"
  // - "Wallet not found"
  console.error(error.message);
}
```
