// services/BiometricService.js
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class BiometricService {
  // Development mode - set to true for testing
  DEV_MODE = true; // Set to false in production

  async isBiometricSupported() {
    try {
      // Development mode: Simulate biometric support
      if (this.DEV_MODE) {
        console.log("🔧 DEV MODE: Simulating biometric support");
        return {
          supported: true,
          hasHardware: true,
          isEnrolled: true,
          supportedTypes: [LocalAuthentication.AuthenticationType.FINGERPRINT]
        };
      }

      console.log("🔍 Checking biometric support...");
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log("Biometric Check Results:", {
        hasHardware,
        isEnrolled,
        supportedTypes,
      });

      const supported = hasHardware && isEnrolled;
      
      console.log("✅ Biometric supported:", supported);
      return {
        supported: supported,
        hasHardware,
        isEnrolled,
        supportedTypes
      };
    } catch (error) {
      console.error("❌ Biometric support check failed:", error);
      return { 
        supported: false, 
        hasHardware: false, 
        isEnrolled: false,
        supportedTypes: [] 
      };
    }
  }

  async authenticate() {
    try {
      // Development mode: Simulate successful authentication
      if (this.DEV_MODE) {
        console.log("🔧 DEV MODE: Simulating biometric authentication");
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, error: null });
          }, 1000);
        });
      }

      console.log("🔐 Starting biometric authentication...");
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access QuickRupi',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      console.log("Biometric Auth Result:", result);

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error("❌ Biometric authentication failed:", error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // ... rest of your existing methods (storeCredentials, getStoredCredentials, etc.)
}

export default new BiometricService();