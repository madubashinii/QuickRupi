# Payment Methods Service

CRUD service for managing user payment methods (cards & bank accounts) with encryption.

## Quick Import

```javascript
import {
  createPaymentMethod,
  getUserPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  prepareCardDataForFirestore,
  prepareBankDataForFirestore,
  TYPES
} from '../services/paymentMethods/paymentMethodsService';
import { useAuth } from '../../context/AuthContext';
```

## Constants

```javascript
TYPES = { CARD: 'card', BANK: 'bank' }
CARD_BRANDS = { VISA: 'visa', MASTERCARD: 'mastercard', AMEX: 'amex', DISCOVER: 'discover' }
ACCOUNT_TYPES = { SAVINGS: 'savings', CHECKING: 'checking', CURRENT: 'current' }
```

## Usage Example

```javascript
const AddPaymentMethod = () => {
  const { user } = useAuth();

  const handleAddCard = async (formData) => {
    // 1. Validate
    const validation = validateCardFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // 2. Check limits (max 2 cards)
    const existing = await getUserPaymentMethods(user.uid, TYPES.CARD);
    if (existing.length >= 2) {
      alert('Maximum 2 cards allowed');
      return;
    }

    // 3. Check duplicates
    const isDuplicate = await checkForDuplicates(
      getUserPaymentMethods,
      user.uid,
      TYPES.CARD,
      formData
    );
    if (isDuplicate) {
      alert('Card already registered');
      return;
    }

    // 4. Prepare and save
    const firestoreData = prepareCardDataForFirestore(formData, user.uid);
    await createPaymentMethod(firestoreData);

    alert('Card added successfully!');
  };

  const handleAddBank = async (formData) => {
    const validation = validateBankFormData(formData);
    if (!validation.isValid) return;

    const existing = await getUserPaymentMethods(user.uid, TYPES.BANK);
    if (existing.length >= 1) {
      alert('Maximum 1 bank account allowed');
      return;
    }

    const firestoreData = prepareBankDataForFirestore(formData, user.uid);
    await createPaymentMethod(firestoreData);
  };
};
```

## Core Functions

All functions require authenticated `userId` from `useAuth()`.

**Create**
```javascript
const firestoreData = prepareCardDataForFirestore(formData, user.uid);
const id = await createPaymentMethod(firestoreData);
// Auto-encrypts bank account numbers
```

**Read**
```javascript
const methods = await getUserPaymentMethods(user.uid);
const cards = await getUserPaymentMethods(user.uid, TYPES.CARD);
const defaultCard = await getDefaultPaymentMethod(user.uid, TYPES.CARD);
```

**Update**
```javascript
await updatePaymentMethod(id, { nickname: "Primary Card" });
// Validates ownership automatically
```

**Delete**
```javascript
await deletePaymentMethod(id);
// Soft delete (sets isActive: false)
```

**Set Default**
```javascript
await setDefaultPaymentMethod(id, user.uid);
// Unsets other defaults automatically
```

## Data Schema

**Card:**
```javascript
{
  id: "pm_abc123",
  userId: "firebase_uid",      // From Firebase Auth
  type: "card",
  brand: "visa",
  last4: "4242",
  cardholder: "John Doe",
  expiry: "1225",              // MMYY
  nickname: "My Visa",
  isDefault: false,
  isActive: true
}
```

**Bank:**
```javascript
{
  id: "pm_xyz789",
  userId: "firebase_uid",
  type: "bank",
  bankName: "Commercial Bank",
  accountNumber: "encrypted...",       // Auto-encrypted
  accountNumberMasked: "******7890",   // For display
  accountHolder: "Jane Smith",
  accountType: "savings",
  branch: "Colombo Branch",
  isDefault: true,
  isActive: true
}
```

## Validation Functions

```javascript
validateCardFormData(formData)          // Returns { isValid, errors }
validateBankFormData(formData)          // Returns { isValid, errors }
detectCardBrand(cardNumber)             // Auto-detect: visa/mastercard/amex/discover
checkForDuplicates(getUserFn, userId, type, data)  // Prevents duplicates
```

## Business Rules

- ✅ Max 2 cards per user
- ✅ Max 1 bank account per user
- ✅ One default per type (card/bank)
- ✅ Soft delete (isActive: false)
- ✅ Bank account numbers auto-encrypted
- ✅ Card brand auto-detected
- ✅ Authorization checks (user owns payment method)

## Key Features

- ✅ Encrypted bank account numbers
- ✅ Authorization validation
- ✅ Duplicate detection
- ✅ Auto-brand detection
- ✅ Soft deletes
- ✅ Default management
- ✅ Form validation