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

  // Store user credentials securely
  async storeCredentials(email, password) {
    try {
      console.log("💾 Storing credentials securely...");
      
      await SecureStore.setItemAsync('biometric_email', email);
      await SecureStore.setItemAsync('biometric_password', password);
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      
      console.log("✅ Credentials stored successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to store credentials:", error);
      return false;
    }
  }

  // Retrieve stored credentials
  async getStoredCredentials() {
    try {
      console.log("🔍 Retrieving stored credentials...");
      
      const email = await SecureStore.getItemAsync('biometric_email');
      const password = await SecureStore.getItemAsync('biometric_password');
      
      if (email && password) {
        console.log("✅ Credentials retrieved successfully");
        return { email, password };
      }
      
      console.log("⚠️ No credentials found");
      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve credentials:", error);
      return null;
    }
  }

  // Check if biometric login is enabled
  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error("❌ Failed to check biometric status:", error);
      return false;
    }
  }

  // Clear stored credentials
  async clearCredentials() {
    try {
      console.log("🗑️ Clearing stored credentials...");
      
      await SecureStore.deleteItemAsync('biometric_email');
      await SecureStore.deleteItemAsync('biometric_password');
      await SecureStore.deleteItemAsync('biometric_enabled');
      
      console.log("✅ Credentials cleared successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear credentials:", error);
      return false;
    }
  }

  // Disable biometric login
  async disableBiometric() {
    return await this.clearCredentials();
  }
}

export default new BiometricService();