#  Encryption Service

**Base64 encoding service for React Native - protects sensitive data like bank account numbers.**

## Quick Start

```javascript
import { encryptionService } from '../services/encryption';

// Encrypt and mask in one operation
const { encrypted, masked } = encryptionService.encryptAndMask("1234567890");
// encrypted: "MTIzNDU2Nzg5MA=="
// masked: "******7890"

// Or use separately
const encrypted = encryptionService.encrypt("1234567890");
const decrypted = encryptionService.decrypt(encrypted);
const masked = encryptionService.mask("1234567890");
```

## API Reference

### Main Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `encrypt(plaintext)` | Encode data | `encrypt("1234567890")` → `"MTIzNDU2Nzg5MA=="` |
| `decrypt(ciphertext)` | Decode data | `decrypt("MTIzNDU2Nzg5MA==")` → `"1234567890"` |
| `mask(data, visibleChars=4)` | Mask for display | `mask("1234567890")` → `"******7890"` |
| `encryptAndMask(plaintext)` | Both operations | Returns `{ encrypted, masked }` |

### Utility Functions

```javascript
import { getMaskedAccountNumber, decryptForProcessing, validateEncryptedData } from '../services/encryption';

// Display encrypted account number
const masked = getMaskedAccountNumber(encryptedData); // "******7890"

// Decrypt for processing
const accountNumber = decryptForProcessing(encryptedAccountNumber);

// Validate encrypted data
if (validateEncryptedData(data)) { /* safe to use */ }
```

## Usage Examples

### Saving Bank Account
```javascript
const handleAddBankAccount = (formData) => {
  const { encrypted, masked } = encryptionService.encryptAndMask(formData.accountNumber);
  
  await saveToFirestore({
    accountNumber: encrypted,     // Store encrypted
    last4: masked.slice(-4)       // Store last 4 for display
  });
};
```

### Displaying Data
```javascript
const BankCard = ({ bank }) => {
  const displayNumber = getMaskedAccountNumber(bank.accountNumber);
  return <Text>{bank.bankName} {displayNumber}</Text>;
};
```

## Security Notes

 **Important:** Base64 is encoding, not encryption. It obfuscates data but can be decoded.

**Best Practices:**
-  Encrypt before storing in Firestore
-  Use masked version for display
-  Decrypt only when needed for processing
-  Never log decrypted data
-  Don't rely on this as sole security layer
-  Always validate server-side

## Troubleshooting

**"Base64 decode failed"** → Use `validateEncryptedData()` before decrypting

**All asterisks displayed** → Check for empty/null input data

**btoa/atob not found** → Expo includes Base64 support by default

