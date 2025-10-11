# Lender Services

Service layer for lender-related operations in the QuickRupi platform.

## Files Overview

### 1. `lenderLoanService.js`
Handles loan data retrieval and filtering for lenders.

### 2. `taxSummaryService.js`
Generates annual tax summaries for lenders with investment income calculations.

### 3. `portfolioReportService.js`
Generates comprehensive portfolio reports for lenders with all investment metrics.

**Key Functions:**
```javascript
// Fetch approved loans available for funding (Browse tab)
await fetchApprovedLoans()

// Fetch ongoing loans for a specific lender (Ongoing tab)
await fetchOngoingLoans(lenderId)

// Fetch completed loans with repayment data (Finished tab)
await fetchCompletedLoans(lenderId)

// Update loan status
await updateLoanStatus(loanId, status)
```

**Usage Example:**
```javascript
import { fetchCompletedLoans } from '../../services/lender/lenderLoanService';

const loans = await fetchCompletedLoans('L001');
// Returns array with amountFunded, totalInterestEarned, repaymentId, etc.
```

**Note:** `fetchCompletedLoans` automatically calculates accurate interest using repayment schedules from `repaymentService`.

---

### 2. `loanFundingService.js`
Manages loan funding operations and escrow transactions.

**Key Functions:**
```javascript
// Fund a loan and create escrow record
await fundLoan({
  loanId,
  lenderId,
  lenderName,
  amount,
  paymentMethodId
})
```

**Integration:** Works with `walletService` and `escrowService` to handle fund transfers.

---

### 3. `loanReportService.js`
Utility functions for formatting loan data for PDF reports.

**Key Functions:**
```javascript
// Format loan data for reports
formatLoanForReport(loan)

// Format repayment schedule for display
formatRepaymentScheduleForReport(schedule)

// Generate report filename with loan ID and date
generateReportFilename(loanId)

// Calculate loan summary with ROI
calculateLoanSummary(loan, repaymentData)
```

**Usage Example:**
```javascript
import { calculateLoanSummary } from '../../services/lender/loanReportService';

const summary = calculateLoanSummary(loan, repaymentData);
// Returns: { principalAmount, totalInterestEarned, totalRepaid, roi, apr }
```

---

### 4. `loanPdfService.js`
Generates and shares PDF reports for completed loans.

**Key Functions:**
```javascript
// Generate PDF and open share dialog
await exportAndShareLoanPDF(loan, repaymentData)

// Generate PDF only (returns file URI)
await exportLoanToPDF(loan, repaymentData, filename)
```

**Usage Example:**
```javascript
import { exportAndShareLoanPDF } from '../../services/lender/loanPdfService';
import { getRepaymentSchedule } from '../../services/repayment/repaymentService';

// Fetch repayment data
const repaymentData = await getRepaymentSchedule(loan.repaymentId);

// Generate and share PDF
await exportAndShareLoanPDF(loan, repaymentData);
// Opens native share dialog with PDF
```

**PDF Includes:**
- Header with loan ID and branding
- Loan summary (borrower, amount, APR, dates)
- Investment performance (principal, interest, ROI)
- Complete repayment schedule table
- Footer with timestamp and disclaimer

---

## Dependencies

- **Firebase Firestore**: Loan and user data storage
- **expo-print**: PDF generation
- **expo-sharing**: Native share functionality
- **Repayment Service**: Accurate repayment calculations
- **Wallet Service**: Fund management
- **Escrow Service**: Transaction security

---

## Error Handling

All services use try-catch blocks and throw errors with meaningful messages:

```javascript
try {
  const loans = await fetchCompletedLoans(lenderId);
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

---

## Data Flow

```
User Action
  ↓
Component (Investments.js, FinishedLoanDetailsModal.js)
  ↓
Lender Services (fetch/export)
  ↓
Firebase / Repayment Service
  ↓
Formatted Data / PDF
  ↓
UI Update / Share Dialog
```

---

## Best Practices

1. **Always validate** `repaymentId` exists before fetching repayment data
2. **Use loading states** for async operations
3. **Handle errors gracefully** with user-friendly messages
4. **Avoid duplicate data fetching** - use component state effectively
5. **Check sharing availability** before attempting PDF share (handled automatically in `exportAndShareLoanPDF`)

---

### 5. `taxSummaryService.js`
Generates annual tax summaries and exports them as PDF for lenders.

**Key Functions:**
```javascript
// Calculate tax summary for a year
await calculateTaxSummary(userId, year)

// Generate HTML for tax summary PDF
generateTaxSummaryHTML(taxData)

// Export and share tax summary PDF
await exportTaxSummaryPDF(userId, year)

// Get available tax years
getAvailableTaxYears()
```

**Tax Summary Includes:**
- Total interest income earned
- Total principal invested
- Completed loans breakdown
- Monthly income breakdown
- Tax liability estimate (8% rate)
- Net income after tax
- ROI calculation
- Loan-by-loan details

**Usage Example:**
```javascript
import { exportTaxSummaryPDF } from '../../services/lender/taxSummaryService';

// Export tax summary for 2024
const result = await exportTaxSummaryPDF('L001', 2024);
// Generates PDF and shares via device
```

---

### 6. `portfolioReportService.js`
Generates comprehensive portfolio reports with investment overview and performance metrics.

**Key Functions:**
```javascript
// Calculate portfolio metrics
await calculatePortfolioMetrics(userId)

// Generate HTML for portfolio report PDF
generatePortfolioReportHTML(portfolioData)

// Export and share portfolio report PDF
await exportPortfolioReportPDF(userId)
```

**Portfolio Report Includes:**
- Total portfolio value (wallet + investments)
- Active loans summary (count, investment, expected returns)
- Completed loans summary (count, total earned, avg ROI)
- Overall ROI and success rate
- Active loans table (all ongoing investments)
- Completed loans table (all finished investments)
- Performance metrics

**Usage Example:**
```javascript
import { exportPortfolioReportPDF } from '../../services/lender/portfolioReportService';

// Export current portfolio report
const result = await exportPortfolioReportPDF('L001');
// Generates PDF with all investment data and shares via device
```

---

## Related Services

- `/services/repayment/repaymentService.js` - Repayment schedule management
- `/services/wallet/walletService.js` - Wallet operations
- `/services/admin/escrowService.js` - Escrow management
- `/services/transactions/transactionService.js` - Transaction logging

