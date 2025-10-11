# Notifications Service

## Overview
Service for managing user notifications in the QuickRupi app. Handles creating, reading, and managing notifications for lenders.

## Collections

### `notifications`
Main collection for storing notification records.

**Schema:**
```javascript
{
  notificationId: string (auto-generated),
  userId: string,
  type: string (enum),
  title: string,
  body: string,
  isRead: boolean,
  priority: string ('HIGH' | 'MEDIUM' | 'LOW'),
  loanId: string | null,
  amount: number | null,
  createdAt: Timestamp,
  readAt: Timestamp | null
}
```

### `userPreferences`
Stores user notification preferences.

**Schema:**
```javascript
{
  notificationPreferences: {
    FUNDING_CONFIRMED: boolean,
    ESCROW_APPROVED: boolean,
    // ... all notification types
  }
}
```

## Firestore Indexes

### Required Composite Indexes

1. **userId + createdAt**
   - Used for: Fetching all notifications for a user ordered by creation date
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **userId + isRead + createdAt**
   - Used for: Filtering unread/read notifications for a user
   - Fields: `userId` (Ascending), `isRead` (Ascending), `createdAt` (Descending)

### How to Apply Indexes

**Option 1: Firebase Console (Manual)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore → Indexes
4. Click "Add Index"
5. Enter the following:

**Index 1:**
- Collection ID: `notifications`
- Fields:
  - `userId` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

**Index 2:**
- Collection ID: `notifications`
- Fields:
  - `userId` - Ascending
  - `isRead` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

**Option 2: Firebase CLI (Recommended)**
```bash
# Deploy indexes from notifications.indexes.json
firebase deploy --only firestore:indexes
```

## Notification Types

- `FUNDING_CONFIRMED` - After fundLoan() completes
- `ESCROW_APPROVED` - When admin approves escrow
- `LOAN_DISBURSED` - When status changes to "disbursed"
- `LOAN_ACTIVE` - When status changes to "repaying"
- `PAYMENT_RECEIVED` - When repayment status = "paid"
- `LOAN_COMPLETED` - All installments paid & status = "completed"
- `MONTHLY_RETURNS` - Monthly automated summary
- `ROI_MILESTONE` - When portfolio ROI crosses threshold
- `FUNDS_ADDED` - After addFunds() completes
- `WITHDRAWAL_PROCESSED` - After withdrawFunds() completes

## Usage

```javascript
import { 
  createNotification, 
  getNotificationsByUserId,
  markNotificationAsRead,
  NOTIFICATION_TYPES 
} from './services/notifications/notificationService';

// Create notification
await createNotification({
  userId: 'L001',
  type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
  title: 'Payment Received',
  body: 'Payment of LKR 3,500 received from loan #LN105',
  priority: 'HIGH',
  loanId: 'LN105',
  amount: 3500
});

// Get notifications
const notifications = await getNotificationsByUserId('L001', { 
  isRead: false, 
  limitCount: 20 
});

// Mark as read
await markNotificationAsRead(notificationId);
```

## User Preferences

```javascript
import { 
  getUserPreferences, 
  saveUserPreferences,
  isNotificationEnabled 
} from './services/notifications/userPreferencesService';

// Get preferences (defaults to all enabled)
const prefs = await getUserPreferences('L001');

// Save preferences
await saveUserPreferences('L001', {
  PAYMENT_RECEIVED: true,
  MONTHLY_RETURNS: false,
  // ...
});

// Check if enabled
const enabled = await isNotificationEnabled('L001', 'PAYMENT_RECEIVED');
```

## Monthly Returns Automation

### Scheduled Monthly Returns Notifications

Automatically sends monthly returns summaries to all lenders on the 1st of each month.

**Service:** `/services/notifications/monthlyReturnsService.js`  
**Cloud Function:** `/functions/scheduledNotifications.js`

```javascript
import { runMonthlyReturns } from './services/notifications/monthlyReturnsService';

// Run manually for testing
const result = await runMonthlyReturns();
// { success: true, totalLenders: 15, notificationsSent: 12, failed: 0 }

// Or send for specific month
import { sendMonthlyReturnsToAllLenders } from './services/notifications/monthlyReturnsService';
await sendMonthlyReturnsToAllLenders(2024, 12); // December 2024
```

**How it works:**
1. Runs on 1st of each month at 9 AM (Sri Lanka time)
2. Calculates previous month's interest earnings per lender
3. Only counts interest portion (not principal)
4. Sends notification if returns > 0
5. Includes total earned and loan count

**Example Notification:**
```javascript
{
  type: 'MONTHLY_RETURNS',
  title: 'Monthly Returns Summary',
  body: 'You earned LKR 8,200 in interest this month across 5 loans',
  priority: 'MEDIUM',
  amount: 8200
}
```

**Setup:**
See `/functions/README.md` for Firebase Cloud Functions deployment instructions.

## ROI Milestone Tracking

### Automatic ROI Milestone Notifications

Tracks portfolio ROI and sends notifications when hitting key milestones.

**Service:** `/services/notifications/roiMilestoneService.js`

**Thresholds:** 10%, 15%, 20%, 25%, 30%

```javascript
import { calculatePortfolioROI, checkAndNotifyROIMilestone } from './services/notifications/roiMilestoneService';

// Calculate current portfolio ROI
const { roi, totalInvested, totalReturns } = await calculatePortfolioROI('L001');
console.log(`ROI: ${roi}%`);

// Check and notify if milestone reached
const { milestone, roi } = await checkAndNotifyROIMilestone('L001');
if (milestone) {
  console.log(`Milestone reached: ${milestone}%`);
}
```

**How it works:**
1. Calculates ROI from all completed loans
2. Formula: `((totalReturns - totalInvested) / totalInvested) * 100`
3. Checks against thresholds: 10%, 15%, 20%, 25%, 30%
4. Sends notification only once per milestone
5. Stores milestone history in `userPreferences` collection
6. Automatically triggered after each loan completion

**Example Notification:**
```javascript
{
  type: 'ROI_MILESTONE',
  title: 'ROI Milestone Achieved!',
  body: 'Congratulations! You've reached 15% portfolio ROI',
  priority: 'HIGH',
  amount: 12500 // Total profit earned
}
```

**Trigger Points:**
- ✅ After loan completion (automatic)
- ✅ Can be manually called anytime

**Milestone Tracking:**
- Stored in: `userPreferences/{userId}.roiMilestones`
- Array of reached milestones: `[10, 15]`
- Prevents duplicate notifications

