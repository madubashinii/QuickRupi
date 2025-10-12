# 🔐 QuickRupi Admin Setup Guide

This guide will help you create your first admin account for QuickRupi.

## 🚀 Quick Start (Recommended Method)

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **QuickRupi** project
3. Click the **⚙️ gear icon** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file as `serviceAccountKey.json` in your project root

```
QuickRupi/
├── serviceAccountKey.json  ← Put it here
├── package.json
├── App.js
└── ...
```

### Step 2: Install Firebase Admin SDK

```bash
npm install firebase-admin --save-dev
```

### Step 3: Run the Admin Setup Script

```bash
node scripts/createAdmin.js
```

### Step 4: Enter Admin Details

You'll be prompted to enter:
- **Email**: Your admin email (e.g., admin@quickrupi.com)
- **Password**: Strong password (min 6 characters, recommend 12+)
- **Full Name**: Your name (e.g., John Doe)

```
=================================================
   QuickRupi Admin User Setup
=================================================

Enter admin email: admin@quickrupi.com
Enter admin password: YourStrongPassword123
Enter admin full name: Admin User

⏳ Creating admin user...

✅ Firebase Auth user created: abc123xyz456
✅ Firestore document created

=================================================
   Admin User Created Successfully! 🎉
=================================================

Admin Details:
  Email:    admin@quickrupi.com
  UID:      abc123xyz456
  Name:     Admin User

You can now login with these credentials.
=================================================
```

### Step 5: Test Your Admin Login

1. Start your app: `npm start` or `expo start`
2. Complete the onboarding screens
3. Click **Log In**
4. Enter your admin credentials
5. You should see the **Admin Dashboard** 🎉

---

## 📱 Alternative Method: Manual Setup via Firebase Console

If you prefer not to use the script:

### 1. Create Firebase Authentication User

1. Firebase Console → **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Add User**
5. **Copy the User UID** (you'll need this!)

### 2. Create Firestore Document

1. Firebase Console → **Firestore Database** → **users** collection
2. Click **Add Document**
3. **Document ID**: Paste the User UID from step 1
4. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| email | string | admin@quickrupi.com |
| fullName | string | Admin User |
| role | string | **admin** |
| kycCompleted | boolean | true |
| kycStatus | string | approved |
| accountStatus | string | active |
| createdAt | timestamp | Now |
| updatedAt | timestamp | Now |

5. Add a **permissions** map with these fields:

| Field | Type | Value |
|-------|------|-------|
| manageUsers | boolean | true |
| approveKYC | boolean | true |
| manageLoanRequests | boolean | true |
| viewAnalytics | boolean | true |
| manageTransactions | boolean | true |
| systemSettings | boolean | true |

6. Click **Save**

---

## 🔧 Troubleshooting

### ❌ "Cannot find module '../serviceAccountKey.json'"
**Solution:**
- Download the service account key from Firebase Console
- Place it in the project root (same level as package.json)
- Make sure it's named exactly `serviceAccountKey.json`

### ❌ "auth/email-already-exists"
**Solution:**
- This email is already registered
- Option 1: Use a different email
- Option 2: Delete the existing user from Firebase Console → Authentication
- Option 3: Update the existing user's role to "admin" in Firestore

### ❌ Admin Login Works but Shows Wrong Screen
**Solution:**
Check your Firestore document:
1. Go to Firestore → users → [your admin UID]
2. Verify these fields:
   - `role`: "admin" (must be exactly "admin", lowercase)
   - `kycCompleted`: true
   - `kycStatus`: "approved"
3. If incorrect, update and try logging in again

### ❌ "Permission denied" Error
**Solution:**
- Ensure you're using the correct Firebase project
- Check your Firestore security rules
- Verify the service account has proper permissions

---

## 🔒 Security Best Practices

### ✅ DO:
- Use **strong, unique passwords** (12+ characters, mix of letters, numbers, symbols)
- Store `serviceAccountKey.json` **securely** (never commit to git)
- **Limit admin accounts** to essential personnel only
- Enable **2FA/MFA** in Firebase Console for production
- **Audit admin actions** regularly
- **Rotate credentials** periodically

### ❌ DON'T:
- ❌ Commit `serviceAccountKey.json` to version control
- ❌ Share admin credentials via insecure channels
- ❌ Use weak or common passwords
- ❌ Create unnecessary admin accounts
- ❌ Leave unused admin accounts active

---

## 📊 What Admin Can Do

Once logged in, the admin has access to:

✅ **Dashboard**
- View system statistics
- Monitor loan requests
- Track user registrations

✅ **KYC Approval**
- Review and approve/reject lender KYC applications
- View submitted documents

✅ **User Management**
- View all users (borrowers, lenders)
- Manage user accounts
- Update user status

✅ **Loan Management**
- Monitor loan requests
- Track loan status
- Manage escrow

✅ **Analytics**
- View system analytics
- Generate reports
- Track platform performance

✅ **Notifications**
- Send system notifications
- Manage alerts

✅ **Messages**
- Communicate with users
- Handle support requests

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the [scripts/README.md](scripts/README.md) for detailed troubleshooting
2. Verify your Firebase project configuration
3. Check Firebase Console logs
4. Review AppNavigator.js role-based routing logic

---

## 📝 Creating Additional Admins

To create more admin users later:

1. **Option 1**: Run the script again
   ```bash
   node scripts/createAdmin.js
   ```

2. **Option 2**: Use manual setup with different credentials

3. **Option 3** (Future): Build an admin panel feature to add admins through the app

---

**🎉 You're all set! Your QuickRupi admin account is ready to use.**

