import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { EmailService } from './EmailService';

export class OTPService {
  static async generateOTP(email, purpose) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await setDoc(doc(db, 'otps', email), {
      otp,
      purpose,
      expiresAt,
      attempts: 0,
      createdAt: new Date()
    });

    // Send OTP via email
    await EmailService.sendOTP(email, otp, purpose);
    
    return true;
  }

  static async verifyOTP(email, userOTP) {
    const otpDoc = await getDoc(doc(db, 'otps', email));
    
    if (!otpDoc.exists()) {
      throw new Error('OTP not found or expired');
    }

    const otpData = otpDoc.data();
    
    if (new Date() > otpData.expiresAt.toDate()) {
      await deleteDoc(doc(db, 'otps', email));
      throw new Error('OTP expired');
    }

    if (otpData.attempts >= 3) {
      await deleteDoc(doc(db, 'otps', email));
      throw new Error('Too many attempts');
    }

    await updateDoc(doc(db, 'otps', email), {
      attempts: otpData.attempts + 1
    });

    if (otpData.otp !== userOTP) {
      throw new Error('Invalid OTP');
    }

    await deleteDoc(doc(db, 'otps', email));
    return { success: true, purpose: otpData.purpose };
  }
}