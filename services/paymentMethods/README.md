#  Payment Methods Service

**Complete CRUD service for managing user payment methods (cards & bank accounts) with Firestore integration.**

## Quick Start

```javascript
import {
  createPaymentMethod,
  getUserPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  TYPES
} from '../services/paymentMethods/paymentMethodsService';

// Add a card
const cardId = await createPaymentMethod({
  userId: "L001",
  type: TYPES.CARD,
  brand: "visa",
  last4: "1234",
  cardholder: "John Doe",
  expiry: "1225",
  nickname: "My Visa Card"
});

// Get user's payment methods
const methods = await getUserPaymentMethods("L001");
const cards = await getUserPaymentMethods("L001", TYPES.CARD);
const banks = await getUserPaymentMethods("L001", TYPES.BANK);

// Update
await updatePaymentMethod(cardId, { nickname: "Primary Visa" });

// Delete (soft delete)
await deletePaymentMethod(cardId);

// Set default
await setDefaultPaymentMethod(cardId, "L001");
```

## Constants

```javascript
TYPES = { CARD: 'card', BANK: 'bank' }
CARD_BRANDS = { VISA: 'visa', MASTERCARD: 'mastercard', AMEX: 'amex', DISCOVER: 'discover' }
ACCOUNT_TYPES = { SAVINGS: 'savings', CHECKING: 'checking', CURRENT: 'current' }
```

## API Reference

### Core Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `createPaymentMethod(data)` | Create card/bank account | Document ID |
| `getUserPaymentMethods(userId, type?, activeOnly?)` | Get user's payment methods | Array |
| `getPaymentMethod(id)` | Get single payment method | Object |
| `updatePaymentMethod(id, updates)` | Update payment method | void |
| `deletePaymentMethod(id)` | Soft delete (sets isActive=false) | void |
| `setDefaultPaymentMethod(id, userId)` | Set as default for type | void |
| `getDefaultPaymentMethod(userId, type)` | Get default card/bank | Object |

### Validation & Utilities

| Function | Purpose |
|----------|---------|
| `validatePaymentMethod(data)` | Validate Firestore data |
| `validateCardFormData(formData)` | Validate card form input |
| `validateBankFormData(formData)` | Validate bank form input |
| `prepareCardDataForFirestore(formData, userId)` | Transform card form → Firestore |
| `prepareBankDataForFirestore(formData, userId)` | Transform bank form → Firestore (encrypts account #) |
| `detectCardBrand(cardNumber)` | Auto-detect card brand |
| `checkForDuplicates(getUserFn, userId, type, data)` | Check if payment method exists |

## Data Schema

### Card Document
```javascript
{
  id: "pm_abc123",           // Auto-generated
  userId: "L001",
  type: "card",
  brand: "visa",             // visa | mastercard | amex | discover
  last4: "4242",
  cardholder: "John Doe",
  expiry: "1225",            // MMYY format
  nickname: "My Visa",       // Optional
  isDefault: false,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastUsed: Timestamp
}
```

### Bank Account Document
```javascript
{
  id: "pm_xyz789",
  userId: "L001",
  type: "bank",
  bankName: "Commercial Bank (COMB)",
  accountNumber: "encrypted...",        // Encrypted!
  accountNumberMasked: "******7890",    // For display
  accountHolder: "Jane Smith",
  accountType: "savings",               // savings | checking | current
  branch: "Colombo Branch",
  isDefault: true,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastUsed: Timestamp
}
```

## Usage Examples

### Complete Add Card Flow
```javascript
import {
  createPaymentMethod,
  validateCardFormData,
  prepareCardDataForFirestore,
  checkForDuplicates,
  getUserPaymentMethods,
  TYPES
} from '../services/paymentMethods/paymentMethodsService';

const handleAddCard = async (formData) => {
  try {
    // 1. Validate
    const validation = validateCardFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // 2. Check limits (max 2 cards)
    const existingCards = await getUserPaymentMethods(userId, TYPES.CARD);
    if (existingCards.length >= 2) {
      alert('Maximum 2 cards allowed');
      return;
    }

    // 3. Check duplicates
    const isDuplicate = await checkForDuplicates(
      getUserPaymentMethods,
      userId,
      TYPES.CARD,
      formData
    );
    if (isDuplicate) {
      alert('Card already registered');
      return;
    }

    // 4. Prepare and save
    const firestoreData = prepareCardDataForFirestore(formData, userId);
    const cardId = await createPaymentMethod(firestoreData);

    alert('Card added successfully!');
    await refreshPaymentMethods();

  } catch (error) {
    console.error('Error adding card:', error);
    alert('Failed to add card');
  }
};
```

### Add Bank Account
```javascript
const handleAddBank = async (formData) => {
  try {
    const validation = validateBankFormData(formData);
    if (!validation.isValid) return;

    const existingBanks = await getUserPaymentMethods(userId, TYPES.BANK);
    if (existingBanks.length >= 1) {
      alert('Maximum 1 bank account allowed');
      return;
    }

    const firestoreData = prepareBankDataForFirestore(formData, userId);
    await createPaymentMethod(firestoreData);
    
    alert('Bank account added!');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Display Payment Methods
```javascript
const PaymentMethodsList = ({ userId }) => {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const loadMethods = async () => {
      const data = await getUserPaymentMethods(userId);
      setMethods(data);
    };
    loadMethods();
  }, [userId]);

  return (
    <>
      {methods.map(method => (
        method.type === 'card' ? (
          <CardDisplay 
            key={method.id}
            brand={method.brand}
            last4={method.last4}
            cardholder={method.cardholder}
            isDefault={method.isDefault}
          />
        ) : (
          <BankDisplay 
            key={method.id}
            bankName={method.bankName}
            masked={method.accountNumberMasked}
            accountHolder={method.accountHolder}
            isDefault={method.isDefault}
          />
        )
      ))}
    </>
  );
};
```

### Set Default Payment Method
```javascript
const handleMakeDefault = async (paymentMethodId) => {
  try {
    await setDefaultPaymentMethod(paymentMethodId, userId);
    await refreshPaymentMethods(); // Refresh to show updated defaults
    alert('Default payment method updated!');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Business Rules

- **Card Limit:** Max 2 cards per user
- **Bank Limit:** Max 1 bank account per user
- **Default Logic:** Only one default per type (one default card, one default bank)
- **Soft Delete:** Deleted methods have `isActive: false` but remain in database
- **Encryption:** Bank account numbers are automatically encrypted
- **Auto-detect:** Card brand is detected from card number

## Best Practices

###  DO:
```javascript
// Validate before saving
const validation = validateCardFormData(formData);
if (!validation.isValid) { /* handle errors */ }

// Use utility functions for data preparation
const data = prepareCardDataForFirestore(formData, userId);

// Check limits before adding
const existing = await getUserPaymentMethods(userId, TYPES.CARD);
if (existing.length >= 2) { /* show error */ }

// Use setDefaultPaymentMethod for defaults
await setDefaultPaymentMethod(id, userId);

// Refresh UI after changes
await updatePaymentMethod(id, updates);
await refreshPaymentMethods();
```

###  DON'T:
```javascript
// Don't skip validation
await createPaymentMethod(rawFormData); // Missing validation!

// Don't manually set defaults (creates multiple defaults)
await updatePaymentMethod(id, { isDefault: true });

// Don't display encrypted account numbers
<Text>{bank.accountNumber}</Text> // Use accountNumberMasked!

// Don't forget to refresh UI
await updatePaymentMethod(id, updates);
// Missing: await refreshPaymentMethods();
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Validation failed: userId required" | Always include `userId` in payment method data |
| "Invalid card number" | Use `detectCardBrand()` to validate before saving |
| Bank account not displaying | Use `accountNumberMasked` for display, not `accountNumber` |
| Multiple defaults | Use `setDefaultPaymentMethod()` - handles automatically |
| Firestore indexes missing | Run `firebase deploy --only firestore:indexes` |

## Firestore Indexes

Required indexes are in `paymentMethods.indexes.json`. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

**Required Indexes:**
- `userId + type + isActive + isDefault`
- `userId + type + isActive + createdAt`

## Testing

```javascript
// Test card creation
const cardId = await createPaymentMethod({
  userId: "TEST_USER",
  type: TYPES.CARD,
  brand: CARD_BRANDS.VISA,
  last4: "4242",
  cardholder: "Test User",
  expiry: "1225"
});
console.assert(cardId, 'Card creation failed');

// Test duplicate detection
const isDuplicate = await checkForDuplicates(
  getUserPaymentMethods,
  "TEST_USER",
  TYPES.CARD,
  { cardNumber: "4242424242424242" }
);
console.assert(isDuplicate === true, 'Duplicate detection failed');
```