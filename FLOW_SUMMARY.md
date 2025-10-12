# 🚀 QuickRupi Application Flow - Complete Summary

## 📱 Initial Setup & Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     APP INITIALIZATION                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SplashScreen (2s)                         │
│                    [Logo + Loading]                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   ONBOARDING FLOW                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Onboarding1  │→ │ Onboarding2  │→ │ Onboarding3  │      │
│  │  Community   │  │  Financial   │  │  SDG Goal    │      │
│  │   Welcome    │  │  Inclusion   │  │  No Poverty  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN SCREEN                            │
│                                                              │
│  🔐 Email & Password                                         │
│  👆 Biometric Login (if enabled)                            │
│  🔑 Forgot Password                                          │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Sign Up |        │    │ Sign Up |        │              │
│  │ Borrower         │    │ Investor         │              │
│  └──────────────────┘    └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
         │                            │
         │                            │
    ┌────▼────┐                  ┌────▼────┐
    │         │                  │         │
    │  LOGIN  │                  │ SIGN UP │
    │         │                  │         │
    └────┬────┘                  └────┬────┘
         │                            │
         │                            │
         └────────────┬───────────────┘
                      ↓
```

---

## 🔐 AUTHENTICATION FLOW

### After Login - Role-Based Routing

```
┌─────────────────────────────────────────────────────────────┐
│              Firebase Auth + Firestore Check                 │
│              (AppNavigator.js - useEffect)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │  Check User Role  │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
    │  ADMIN  │          │ LENDER  │         │BORROWER │
    │         │          │         │         │         │
    └────┬────┘          └────┬────┘         └────┬────┘
         │                    │                    │
         │               ┌────┴────┐          ┌────┴────┐
         │               │ KYC OK? │          │ KYC OK? │
         │               └────┬────┘          └────┬────┘
         │                    │                    │
         │            ┌───────┴───────┐    ┌───────┴───────┐
         │            │               │    │               │
         │        ┌───▼───┐      ┌────▼────┐   ┌────▼────┐   ┌────────┐
         │        │  YES  │      │   NO    │   │   YES   │   │   NO   │
         │        └───┬───┘      └────┬────┘   └────┬────┘   └────┬────┘
         │            │               │             │             │
         ▼            ▼               ▼             ▼             ▼
    ┌────────┐  ┌────────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Admin  │  │Lender  │    │ Lender   │  │Borrower  │  │Borrower  │
    │ Stack  │  │ Stack  │    │ KYC      │  │ Stack    │  │ KYC      │
    │        │  │        │    │ Stack    │  │          │  │ Stack    │
    └────────┘  └────────┘    └──────────┘  └──────────┘  └──────────┘
```

---

## 📝 SIGN UP FLOWS

### Borrower Registration (2 Steps)

```
┌─────────────────────────────────────────────────────────────┐
│                  BORROWER SIGN UP FLOW                       │
└─────────────────────────────────────────────────────────────┘

Step 1: PersonalDetailsScreen
┌─────────────────────────────────────────────────────────────┐
│  📋 Personal Information                                     │
│  • Title (Mr/Mrs/Ms/Dr)                                     │
│  • First Name, Last Name, Initials                          │
│  • Full Address                                             │
│  • Mobile Number                                            │
│  • Email Address                                            │
│  • NIC Number                                               │
│  • Date of Birth                                            │
│  • Gender                                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
Step 2: AccountDetailsScreen
┌─────────────────────────────────────────────────────────────┐
│  🔐 Account Setup                                            │
│  • Username                                                 │
│  • Password (min 6 chars)                                   │
│  • Confirm Password                                         │
│  • ✉️ Email Verification (OTP)                              │
│  • ☑️ Terms & Conditions                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Firebase Auth User Created                                  │
│  role: "borrower"                                           │
│  kycStatus: "approved" ✅ (Auto-approved)                   │
│  kycCompleted: true                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Sign Out → Redirect to Login                               │
│  ✅ "Registration successful! Please login."                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    🎉 Can Login Immediately
                              ↓
                      Borrower Dashboard
```

### Lender/Investor Registration (4 Steps)

```
┌─────────────────────────────────────────────────────────────┐
│                  LENDER/INVESTOR SIGN UP FLOW                │
└─────────────────────────────────────────────────────────────┘

Step 1: PersonalDetails1
┌─────────────────────────────────────────────────────────────┐
│  👤 Personal Information                                     │
│  • Title                                                    │
│  • First Name, Last Name, Name with Initials               │
│  • NIC Number                                               │
│  • Date of Birth                                            │
│  • Gender                                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
Step 2: ContactDetails
┌─────────────────────────────────────────────────────────────┐
│  📞 Contact Information                                      │
│  • Address Line 1 & 2                                       │
│  • City                                                     │
│  • Postal Code                                              │
│  • Mobile Number                                            │
│  • Email Address                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
Step 3: EmploymentInfo
┌─────────────────────────────────────────────────────────────┐
│  💼 Employment Details                                       │
│  • Employment Status                                        │
│    - Salaried                                              │
│    - Self-Employed                                         │
│    - Business Owner                                        │
│    - Retired                                               │
│    - Student                                               │
│    - Other                                                 │
│  • Designation/Job Title                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
Step 4: AccountInformation
┌─────────────────────────────────────────────────────────────┐
│  🔐 Account Setup                                            │
│  • Password (min 6 chars)                                   │
│  • Confirm Password                                         │
│  • ☑️ Terms & Conditions                                     │
│  • Review Email (from Step 2)                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Firebase Auth User Created                                  │
│  role: "lender"                                             │
│  kycStatus: "pending" ⏳ (Needs Admin Approval)             │
│  kycCompleted: true                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Sign Out → Redirect to Login                               │
│  ⏳ "Please wait for admin approval"                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                ⏳ Waiting for Admin Approval
                              ↓
                    (Admin Approves in Dashboard)
                              ↓
                    kycStatus: "approved" ✅
                              ↓
                    🎉 Can Now Login
                              ↓
                      Lender Dashboard
```

---

## 👨‍💼 ADMIN SETUP

### Creating the First Admin

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN ACCOUNT SETUP (One-Time)                  │
└─────────────────────────────────────────────────────────────┘

Option 1: Automated Script (Recommended)
┌─────────────────────────────────────────────────────────────┐
│  1. Download serviceAccountKey.json from Firebase           │
│  2. Place in project root                                   │
│  3. npm install firebase-admin --save-dev                   │
│  4. node scripts/createAdmin.js                             │
│  5. Enter email, password, name                             │
│  6. ✅ Admin created!                                        │
└─────────────────────────────────────────────────────────────┘

Option 2: Manual via Firebase Console
┌─────────────────────────────────────────────────────────────┐
│  1. Firebase Console → Authentication → Add User            │
│  2. Copy User UID                                           │
│  3. Firestore → users collection → Add Document            │
│     - Document ID: [User UID]                               │
│     - role: "admin"                                         │
│     - kycCompleted: true                                    │
│     - kycStatus: "approved"                                 │
│     - permissions: { all: true }                            │
│  4. ✅ Admin created!                                        │
└─────────────────────────────────────────────────────────────┘

Admin Login Flow
┌─────────────────────────────────────────────────────────────┐
│  Login Screen → Enter Admin Credentials                     │
│          ↓                                                  │
│  AppNavigator checks role: "admin"                          │
│          ↓                                                  │
│  Redirect to AdminStack                                     │
│          ↓                                                  │
│  Admin Dashboard with full access                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 COMPLETE USER JOURNEY MAP

### User Type: Borrower
```
Start App → Onboarding → Sign Up (Borrower) 
    → Step 1: Personal Details 
    → Step 2: Account + Email Verification
    → Auto-Approved ✅
    → Login
    → Borrower Dashboard
    → Apply for Loans
    → View Repayment Schedule
```

### User Type: Lender/Investor
```
Start App → Onboarding → Sign Up (Investor)
    → Step 1: Personal Details
    → Step 2: Contact Details
    → Step 3: Employment Info
    → Step 4: Account Setup
    → Pending Approval ⏳
    → (Wait for Admin)
    → Admin Approves ✅
    → Login
    → Lender Dashboard
    → Browse Loan Requests
    → Fund Loans
    → Track Investments
```

### User Type: Admin
```
(Initial Setup: Create Admin via Script/Console)
Start App → Onboarding → Login (Admin Credentials)
    → Admin Dashboard
    → Approve/Reject Lender KYC
    → Manage Users
    → Monitor Loans
    → View Analytics
    → Handle Support
```

---

## 📊 STATUS FLOW DIAGRAM

```
User Registration
        │
        ├─ Borrower
        │   └─ kycStatus: "approved" ✅ (Immediate)
        │
        ├─ Lender
        │   ├─ kycStatus: "pending" ⏳ (Initial)
        │   ├─ Admin Reviews
        │   └─ kycStatus: "approved" ✅ or "rejected" ❌
        │
        └─ Admin
            └─ kycStatus: "approved" ✅ (Manual Setup)
```

---

## 🔒 SECURITY & VALIDATION

### Email Verification
- **Borrowers**: OTP verification required
- **Lenders**: Email collected, verified on login
- **Admins**: Email verified via Firebase Console

### Password Requirements
- Minimum 6 characters
- Firebase Authentication validation
- Secure password hashing

### KYC Status Checks
```javascript
// In AppNavigator.js
if (kycStatus === "pending" || kycStatus === "rejected") {
  signOut(auth);
  Alert.alert("Account Pending/Rejected");
  return; // Block access
}
```

### Role-Based Access Control
- Admin → Full access to admin panel
- Lender → Can view loans, invest, track returns
- Borrower → Can request loans, manage repayments

---

## 📚 Quick Reference

| User Type | Sign Up | Approval | Can Access |
|-----------|---------|----------|------------|
| **Borrower** | 2 steps | ✅ Auto | Immediately after registration |
| **Lender** | 4 steps | ⏳ Manual (Admin) | After admin approval |
| **Admin** | Manual setup | ✅ Pre-approved | Immediately after setup |

---

## 🎉 Summary

✅ **Complete onboarding flow** with 3 screens
✅ **Proper authentication** with Firebase Auth
✅ **Role-based navigation** (Admin/Lender/Borrower)
✅ **KYC flows** for Borrowers (2 steps) and Lenders (4 steps)
✅ **Admin approval system** for Lenders
✅ **Email verification** with OTP
✅ **Biometric authentication** support
✅ **Security checks** for pending/rejected accounts
✅ **Admin setup script** for easy initialization

**All redirections verified and working! 🚀**

