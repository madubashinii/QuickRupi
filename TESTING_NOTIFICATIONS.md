# Notification System Testing Guide

Complete guide for testing the QuickRupi notification system.

## Quick Start

### 1. Test All Notification Types at Once

Add this to any screen (e.g., Dashboard or Profile):

```javascript
import { createAllTestNotifications } from '../services/notifications/testNotifications';

// Add a test button
<TouchableOpacity 
  onPress={() => createAllTestNotifications('L001')}
  style={{ padding: 20, backgroundColor: 'blue' }}
>
  <Text style={{ color: 'white' }}>Create Test Notifications</Text>
</TouchableOpacity>
```

This creates 10 notifications (one of each type) instantly!

---

## Manual Testing Methods

### Method 1: Using React Native Debugger Console

1. Open your app
2. Open Chrome DevTools (Cmd+M → Debug)
3. Go to Console tab
4. Run these commands:

```javascript
// Import the test function
import { createAllTestNotifications } from './services/notifications/testNotifications';

// Create all test notifications
await createAllTestNotifications('L001');

// Or create single notification
import { createSingleTestNotification } from './services/notifications/testNotifications';
await createSingleTestNotification('PAYMENT_RECEIVED', 'L001');
```

### Method 2: Add Temporary Test Button

In `Dashboard.js` or `Profile.js`, add a test button:

```javascript
// At top of file
import { createAllTestNotifications, createSingleTestNotification } from '../services/notifications/testNotifications';

// In your render/return
{__DEV__ && (
  <TouchableOpacity 
    onPress={async () => {
      await createAllTestNotifications('L001');
      Alert.alert('Success', 'Test notifications created!');
    }}
    style={{
      position: 'absolute',
      bottom: 100,
      right: 20,
      backgroundColor: colors.teal,
      padding: 15,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>TEST</Text>
  </TouchableOpacity>
)}
```

### Method 3: Firebase Console (Manual Entry)

1. Go to Firebase Console → Firestore
2. Navigate to `notifications` collection
3. Click "Add Document"
4. Use auto-generated ID
5. Add fields manually:

```javascript
{
  userId: "L001",
  type: "PAYMENT_RECEIVED",
  title: "Payment Received",
  body: "Payment of LKR 3,500 received from loan #LN105 (On Time)",
  isRead: false,
  priority: "HIGH",
  loanId: "LN105",
  amount: 3500,
  createdAt: (use timestamp - click clock icon),
  readAt: null
}
```

---

## Testing Each Feature

### 1. Test Notification Creation

```javascript
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './services/notifications/notificationService';

// Test creating a notification
await createNotification({
  userId: 'L001',
  type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
  title: 'Payment Received',
  body: 'Payment of LKR 3,500 received',
  priority: NOTIFICATION_PRIORITY.HIGH,
  loanId: 'LN105',
  amount: 3500
});
```

**Expected Result:** 
- Notification appears in Notifications screen
- Unread badge shows on Dashboard notification icon
- Real-time update (no refresh needed)

### 2. Test Real-Time Updates

**Steps:**
1. Open app on device/simulator
2. Open Firebase Console in browser
3. Add notification manually in Firestore
4. Watch notification appear in app instantly!

**Expected:** Notification appears without refresh

### 3. Test Mark as Read

**Steps:**
1. Tap an unread notification
2. Check that:
   - Blue dot disappears
   - Title becomes normal weight (not bold)
   - Unread count decreases
   - Navigation happens to correct screen

### 4. Test Mark All as Read

**Steps:**
1. Ensure you have multiple unread notifications
2. Tap "Mark all as read" button
3. Confirm in dialog
4. Check all notifications marked as read
5. Unread badge on Dashboard = 0

### 5. Test Filtering

**Steps:**
1. Create notifications of different types
2. Tap filter icon
3. Select "Payments"
4. Verify only payment notifications show
5. Filter icon changes color to teal
6. Select "All Notifications"
7. All notifications appear again

### 6. Test Navigation

**Test each notification type:**

| Notification Type | Expected Screen |
|------------------|----------------|
| FUNDING_CONFIRMED | Investments |
| PAYMENT_RECEIVED | Investments |
| LOAN_COMPLETED | Investments |
| MONTHLY_RETURNS | Investments |
| ROI_MILESTONE | Investments |
| FUNDS_ADDED | Transactions |
| WITHDRAWAL_PROCESSED | Transactions |

**Steps:**
1. Tap notification
2. Verify correct screen opens
3. Verify notification marked as read

### 7. Test Icon Colors

Check each notification type has correct colored icon:

```javascript
// Colors defined in notificationUtils.js
FUNDING_CONFIRMED: Teal (#00BFA5)
ESCROW_APPROVED: Blue (#1E88E5)
LOAN_DISBURSED: Green (#43A047)
LOAN_ACTIVE: Orange (#FB8C00)
PAYMENT_RECEIVED: Teal (#00BFA5)
LOAN_COMPLETED: Purple (#7B1FA2)
MONTHLY_RETURNS: Deep Purple (#5E35B1)
ROI_MILESTONE: Gold (#FFB300)
FUNDS_ADDED: Green (#43A047)
WITHDRAWAL_PROCESSED: Red (#E53935)
```

---

## Testing Automated Triggers

### Test Investment Notifications

#### FUNDING_CONFIRMED
```javascript
import { fundLoan } from './services/lender/loanFundingService';

await fundLoan({
  loanId: 'LN105',
  lenderId: 'L001',
  borrowerId: 'B001',
  amount: 25000
});
```
**Expected:** FUNDING_CONFIRMED notification created

#### PAYMENT_RECEIVED & LOAN_COMPLETED
```javascript
import { markInstallmentAsPaid } from './services/repayment/repaymentService';

// Mark installment as paid
await markInstallmentAsPaid('repayment123', 1);
```
**Expected:** 
- PAYMENT_RECEIVED notification
- If last installment: LOAN_COMPLETED + ROI_MILESTONE (if threshold reached)

### Test Wallet Notifications

#### FUNDS_ADDED
```javascript
import { addFunds } from './services/wallet/walletService';

await addFunds('L001', 50000, 'card123');
```
**Expected:** FUNDS_ADDED notification

#### WITHDRAWAL_PROCESSED
```javascript
import { withdrawFunds } from './services/wallet/walletService';

await withdrawFunds('L001', 20000, 'bank123');
```
**Expected:** WITHDRAWAL_PROCESSED notification

### Test Monthly Returns (Manual)

```javascript
import { runMonthlyReturns } from './services/notifications/monthlyReturnsService';

// Run for current month
await runMonthlyReturns();
```
**Expected:** MONTHLY_RETURNS notification if user had returns

### Test ROI Milestone (Manual)

```javascript
import { checkAndNotifyROIMilestone } from './services/notifications/roiMilestoneService';

await checkAndNotifyROIMilestone('L001');
```
**Expected:** ROI_MILESTONE notification if threshold crossed

---

## Testing Notification Settings

### Test Settings Modal

1. Go to Profile screen
2. Tap "Push notifications"
3. Settings modal opens
4. Toggle notification types on/off
5. Tap "Save Preferences"
6. Reopen modal - settings persisted

**Verify in Firestore:**
```javascript
userPreferences/L001
{
  notificationPreferences: {
    PAYMENT_RECEIVED: true,
    MONTHLY_RETURNS: false,
    // ... etc
  }
}
```

---

## Testing Edge Cases

### Empty State
1. Delete all notifications in Firestore
2. Open Notifications screen
3. Verify empty state shows with image and message

### No Unread Notifications
1. Mark all as read
2. Verify "Mark all as read" button disappears
3. Verify unread badge = 0 on Dashboard

### Filtered Empty State
1. Select filter with no matching notifications
2. Verify empty state shows

### Network Errors
1. Turn off WiFi
2. Try marking as read
3. Verify error handling (notification not marked)

---

## Performance Testing

### Test with Many Notifications

**Create 50 test notifications:**
```javascript
for (let i = 0; i < 50; i++) {
  await createSingleTestNotification('PAYMENT_RECEIVED', 'L001');
}
```

**Check:**
- List scrolls smoothly
- Real-time updates don't lag
- Filtering works fast
- Mark all as read handles 50+ notifications

---

## Checklist

Use this checklist to verify all features work:

### Notification Creation
- [ ] All 10 notification types can be created
- [ ] Notifications appear in real-time
- [ ] Icon colors are correct
- [ ] Timestamps format correctly

### Notifications Screen
- [ ] Unread notifications show blue dot
- [ ] Unread notifications have bold title
- [ ] Unread count shows in action bar
- [ ] "Mark all as read" button appears when unread exist
- [ ] Empty state shows when no notifications

### Mark as Read
- [ ] Single notification marks as read on tap
- [ ] "Mark all as read" works
- [ ] Confirmation dialog appears
- [ ] Real-time update (no refresh)

### Navigation
- [ ] Investment notifications → Investments screen
- [ ] Wallet notifications → Transactions screen
- [ ] Auto-marks as read on navigation

### Filtering
- [ ] Filter modal opens
- [ ] All 7 filters work correctly
- [ ] Filter icon changes color when active
- [ ] Selected filter highlighted in modal
- [ ] Filtered count updates

### Dashboard Badge
- [ ] Unread count shows on notification icon
- [ ] Count updates in real-time
- [ ] Count = 0 when all read (no badge)

### Automated Triggers
- [ ] FUNDING_CONFIRMED after fundLoan()
- [ ] PAYMENT_RECEIVED after markInstallmentAsPaid()
- [ ] LOAN_COMPLETED when all installments paid
- [ ] ROI_MILESTONE when threshold crossed
- [ ] FUNDS_ADDED after addFunds()
- [ ] WITHDRAWAL_PROCESSED after withdrawFunds()

### Settings
- [ ] Settings modal opens from Profile
- [ ] Toggle switches work
- [ ] Preferences save to Firestore
- [ ] Settings persist after close/reopen

---

## Troubleshooting

### Notifications not appearing?
1. Check Firestore rules allow read/write
2. Verify userId matches ('L001')
3. Check console for errors
4. Verify Firestore indexes deployed

### Real-time not working?
1. Check internet connection
2. Verify Firestore listener setup in useEffect
3. Check for console errors

### Navigation not working?
1. Verify screen names match navigation structure
2. Check `getNavigationTarget()` mapping
3. Test navigation separately

### Mark as read not working?
1. Check Firestore rules
2. Verify notificationId is correct
3. Check `markNotificationAsRead()` function

---

## Quick Test Script

Run this to test everything at once:

```javascript
// Add to a test button
const runFullTest = async () => {
  console.log('Starting full notification test...');
  
  // 1. Create test notifications
  await createAllTestNotifications('L001');
  console.log('✓ Created 10 test notifications');
  
  // 2. Test ROI milestone
  await checkAndNotifyROIMilestone('L001');
  console.log('✓ Checked ROI milestone');
  
  // 3. Test monthly returns
  await runMonthlyReturns();
  console.log('✓ Ran monthly returns');
  
  console.log('Test complete! Check Notifications screen.');
};
```

---

## Next Steps

After testing locally:

1. **Deploy Firestore indexes:**
   ```bash
   cd functions
   firebase deploy --only firestore:indexes
   ```

2. **Deploy Cloud Functions** (for monthly returns):
   ```bash
   firebase deploy --only functions
   ```

3. **Test on physical device** for real push notifications

4. **Test with multiple users** (change userId)

5. **Monitor Firestore usage** in Firebase Console

---

## Support

If you encounter issues:
1. Check browser/React Native console
2. Check Firestore Console for data
3. Verify all services imported correctly
4. Ensure Firebase config is correct

