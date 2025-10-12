import { auth, db } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import * as Crypto from 'expo-crypto';

// Generate random OTP
const generateOTP = async () => {
  const randomBytes = await Crypto.getRandomBytesAsync(3);
  const otp = (parseInt(randomBytes.toString('hex'), 16) % 1000000).toString().padStart(6, '0');
  return otp;
};

// Store OTP in Firestore
const storeOTP = async (email, otp, purpose = 'verification') => {
  try {
    const otpData = {
      email: email,
      otp: otp,
      purpose: purpose,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: serverTimestamp(),
      attempts: 0
    };

    await setDoc(doc(db, 'otps', email), otpData);
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Verify OTP
const verifyOTP = async (email, userOTP) => {
  try {
    const otpDoc = await getDoc(doc(db, 'otps', email));
    
    if (!otpDoc.exists()) {
      return { success: false, message: 'OTP not found or expired' };
    }

    const otpData = otpDoc.data();
    
    // Check if OTP is expired
    if (new Date() > otpData.expiresAt.toDate()) {
      await deleteDoc(doc(db, 'otps', email));
      return { success: false, message: 'OTP has expired' };
    }

    // Check attempt limit
    if (otpData.attempts >= 5) {
      await deleteDoc(doc(db, 'otps', email));
      return { success: false, message: 'Too many attempts. Please request a new OTP' };
    }

    // Verify OTP
    if (otpData.otp !== userOTP) {
      // Increment attempts
      await updateDoc(doc(db, 'otps', email), {
        attempts: otpData.attempts + 1
      });
      return { success: false, message: 'Invalid OTP' };
    }

    // OTP is valid - delete it
    await deleteDoc(doc(db, 'otps', email));
    
    return { success: true, message: 'OTP verified successfully' };
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Error verifying OTP' };
  }
};

// Send OTP via Email (Using Firebase Auth)
export const sendOTP = async (email, purpose = 'verification') => {
  try {
    const otp = await generateOTP();
    const stored = await storeOTP(email, otp, purpose);
    
    if (!stored) {
      return { success: false, message: 'Failed to generate OTP' };
    }

    // For demo purposes, we'll use Firebase's sendPasswordResetEmail
    // In production, you'd use a proper email service
    await sendPasswordResetEmail(auth, email);
    
    // Store the OTP in a way that we can reference it
    // Note: In a real app, you'd integrate with an email service like SendGrid, AWS SES, etc.
    
    console.log(`OTP for ${email}: ${otp}`); // Remove this in production
    
    return { 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // Remove this in production - only for testing
    };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP' 
    };
  }
};

// Send OTP using SMTP (Alternative approach)
export const sendOTPviaSMTP = async (email, purpose = 'verification') => {
  try {
    const otp = await generateOTP();
    const stored = await storeOTP(email, otp, purpose);
    
    if (!stored) {
      return { success: false, message: 'Failed to generate OTP' };
    }

    // Here you would integrate with your backend that handles SMTP
    // For React Native, you need a backend service to send emails
    
    const response = await fetch('YOUR_BACKEND_URL/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
        purpose: purpose
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      // If email fails, delete the OTP
      await deleteDoc(doc(db, 'otps', email));
      return { success: false, message: result.message || 'Failed to send OTP' };
    }
    
  } catch (error) {
    console.error('Error sending OTP via SMTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
};

// Resend OTP
export const resendOTP = async (email, purpose = 'verification') => {
  try {
    // Delete existing OTP if any
    await deleteDoc(doc(db, 'otps', email));
    
    // Send new OTP
    return await sendOTP(email, purpose);
  } catch (error) {
    console.error('Error resending OTP:', error);
    return { success: false, message: 'Failed to resend OTP' };
  }
};

export { verifyOTP, generateOTP };