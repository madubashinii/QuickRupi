# Repayment Services

Service layer for repayment schedule management and tracking in the QuickRupi platform.

## Files Overview

### 1. `repaymentScheduleGenerator.js`
Generates amortization schedules for loans with principal and interest breakdown.

**Key Function:**
```javascript
generateRepaymentSchedule({
  loanAmount,        // Principal amount
  annualInterestRate, // APR (e.g., 12 for 12%)
  termMonths,        // Loan term in months
  startDate,         // ISO date string for first payment
  borrowerId,        // Borrower user ID
  lenderId          // Lender user ID
})
```

**Returns:** Array of installment objects with:
- `installmentNumber` - Payment number (1, 2, 3...)
- `dueDate` - When payment is due (ISO string)
- `principalPayment` - Principal portion
- `interestPayment` - Interest portion
- `totalPayment` - Monthly payment amount
- `remainingBalance` - Balance after payment
- `status` - Payment status ('pending' by default)

**Usage Example:**
```javascript
import { generateRepaymentSchedule } from '../../services/repayment/repaymentScheduleGenerator';

const schedule = generateRepaymentSchedule({
  loanAmount: 100000,
  annualInterestRate: 12,
  termMonths: 6,
  startDate: new Date().toISOString(),
  borrowerId: 'B001',
  lenderId: 'L001'
});

// schedule[0] = First installment with all payment details
```

**Formula Used:** Standard amortization (compound interest)

---

### 2. `repaymentService.js`
Manages repayment schedule storage, retrieval, and status tracking in Firestore.

**Key Functions:**

#### Create Repayment Schedule
```javascript
// Generates and stores repayment schedule in Firestore
const repaymentId = await createRepaymentSchedule({
  loanId,
  loanAmount,
  annualInterestRate,
  termMonths,
  startDate,
  borrowerId,
  lenderId
})
```

#### Get Repayment Schedule
```javascript
// Retrieves repayment schedule with dynamic status
const repaymentData = await getRepaymentSchedule(repaymentId)
```

**Returns:**
```javascript
{
  id: 'repayment123',
  loanId: 'loan456',
  borrowerId: 'B001',
  lenderId: 'L001',
  schedule: [
    {
      installmentNumber: 1,
      dueDate: '2025-11-10',
      totalPayment: 17255,
      principalPayment: 16255,
      interestPayment: 1000,
      remainingBalance: 83745,
      status: 'Paid',        // Dynamically calculated
      paidDate: '2025-11-09'
    },
    // ... more installments
  ],
  totalAmount: 100000,
  createdAt: '2025-10-10T...',
  status: 'active'
}
```

#### Check and Complete Loan
```javascript
// Checks if all payments are done and marks loan as completed
const completed = await checkAndCompleteLoan(repaymentId)
// Returns true if loan was marked complete, false otherwise
```

**Status Mapping:**
- `'Paid'` - Payment marked as paid by admin
- `'Overdue'` - Past due date and not paid
- `'Due soon'` - Due within 7 days
- `'Pending'` - Not yet due

---

## Integration Points

### When Loan is Funded (Admin Approves Escrow)
```javascript
// 1. Admin approves escrow release
// 2. Create repayment schedule
const repaymentId = await createRepaymentSchedule({
  loanId: loan.id,
  loanAmount: loan.fundedAmount,
  annualInterestRate: loan.apr,
  termMonths: loan.termMonths,
  startDate: new Date().toISOString(),
  borrowerId: loan.borrowerId,
  lenderId: loan.lenderId
});

// 3. Update loan with repaymentId
await updateDoc(loanRef, { repaymentId, status: 'repaying' });
```

### When Admin Marks Payment as Paid
```javascript
// 1. Update installment status in schedule
// 2. Call checkAndCompleteLoan to auto-complete if all paid
const isComplete = await checkAndCompleteLoan(repaymentId);
// Automatically updates loan status to 'completed' if all installments paid
```

### For Lender Dashboard
```javascript
// Fetch repayment data for display
const repaymentData = await getRepaymentSchedule(loan.repaymentId);

// Calculate totals
const totalPaid = repaymentData.schedule
  .filter(i => i.status === 'Paid')
  .reduce((sum, i) => sum + i.totalPayment, 0);
```

---

## Dependencies

- **Firebase Firestore**: Storage for repayment schedules
- **Loan Service**: Updates loan status when completed
- **Date Utilities**: ISO date strings for consistency

---

## Data Flow

```
Loan Funded
  ↓
createRepaymentSchedule()
  ↓
generateRepaymentSchedule() → Creates installment array
  ↓
Store in Firestore: /repayments/{repaymentId}
  ↓
Update Loan with repaymentId
  ↓
Admin/Lender views schedule via getRepaymentSchedule()
  ↓
Admin marks payment as paid
  ↓
checkAndCompleteLoan() → Auto-completes loan if all paid
```

---

## Firestore Structure

```
repayments/{repaymentId}
  ├── loanId: string
  ├── borrowerId: string
  ├── lenderId: string
  ├── totalAmount: number
  ├── status: 'active' | 'completed'
  ├── createdAt: ISO string
  └── schedule: array [
      {
        installmentNumber: number,
        dueDate: ISO string,
        totalPayment: number,
        principalPayment: number,
        interestPayment: number,
        remainingBalance: number,
        status: 'pending' | 'paid',
        paidDate?: ISO string
      }
    ]
```

---

## Best Practices

1. **Always create repayment schedule** when loan is disbursed/funded
2. **Store repaymentId in loan document** for easy lookup
3. **Use ISO date strings** for consistent date handling
4. **Let status be calculated dynamically** - don't rely on stored status values
5. **Call checkAndCompleteLoan** after marking any payment as paid
6. **Round payments** to whole numbers to avoid currency precision issues

---

## Error Handling

```javascript
try {
  const repaymentData = await getRepaymentSchedule(repaymentId);
  if (!repaymentData.schedule || !Array.isArray(repaymentData.schedule)) {
    throw new Error('Invalid repayment schedule format');
  }
} catch (error) {
  console.error('Error fetching repayment:', error);
  // Handle gracefully - show error to user
}
```

---

## Related Services

- `/services/lender/lenderLoanService.js` - Uses repayment data for accurate interest calculations
- `/services/admin/adminRepaymentService.js` - Admin operations for marking payments as paid
- `/services/lender/loanPdfService.js` - Displays repayment schedule in PDF reports

