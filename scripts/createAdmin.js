/**
 * Admin User Setup Script
 * 
 * This script creates the first admin user for QuickRupi.
 * Run this ONCE during initial setup.
 * 
 * Usage:
 *   node scripts/createAdmin.js
 * 
 * You will be prompted to enter:
 *   - Admin email
 *   - Admin password (min 6 characters)
 *   - Admin full name
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// Make sure you have the service account key file
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function createAdminUser() {
  try {
    console.log('\n=================================================');
    console.log('   QuickRupi Admin User Setup');
    console.log('=================================================\n');

    // Get admin details
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 chars): ');
    const fullName = await question('Enter admin full name: ');

    // Validate input
    if (!email || !password || !fullName) {
      console.error('\n❌ Error: All fields are required!');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.error('\n❌ Error: Password must be at least 6 characters!');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating admin user...\n');

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
      disabled: false
    });

    console.log('✅ Firebase Auth user created:', userRecord.uid);

    // Create Firestore document
    const adminData = {
      email: email,
      fullName: fullName,
      role: 'admin',
      kycCompleted: true,
      kycStatus: 'approved',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      accountStatus: 'active',
      permissions: {
        manageUsers: true,
        approveKYC: true,
        manageLoanRequests: true,
        viewAnalytics: true,
        manageTransactions: true,
        systemSettings: true
      }
    };

    await db.collection('users').doc(userRecord.uid).set(adminData);

    console.log('✅ Firestore document created');
    console.log('\n=================================================');
    console.log('   Admin User Created Successfully! 🎉');
    console.log('=================================================');
    console.log('\nAdmin Details:');
    console.log(`  Email:    ${email}`);
    console.log(`  UID:      ${userRecord.uid}`);
    console.log(`  Name:     ${fullName}`);
    console.log('\nYou can now login with these credentials.');
    console.log('=================================================\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 This email is already registered. Try a different email or update the existing user manually.');
    }
  } finally {
    rl.close();
    process.exit();
  }
}

// Run the setup
createAdminUser();

