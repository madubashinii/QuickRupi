// Email Service for sending OTP codes
// Development Mode: OTP displayed on screen for testing

/**
 * Send OTP email
 * Currently in development mode - OTP shown on screen
 * For production email delivery, you'll need a backend service
 */
export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    // Development Mode: Show OTP on screen and in console
    console.log(`\n═══════════════════════════════════`);
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`Valid for: 15 minutes`);
    console.log(`Mode: Development (OTP shown on screen)`);
    console.log(`═══════════════════════════════════\n`);
    
    // Return success with OTP for screen display
    return {
      success: true,
      message: 'OTP generated successfully',
      otp: otp // OTP will be displayed in yellow box on screen
    };
    
  } catch (error) {
    console.error('❌ Error in OTP generation:', error);
    return {
      success: true,
      message: 'OTP generated (check screen)',
      otp: otp // Always show OTP in development
    };
  }
};

/**
 * Alternative: Send email using Firebase Cloud Functions
 * Requires setting up Cloud Functions in your Firebase project
 */
export const sendOTPViaCloudFunction = async (email, otp, purpose) => {
  try {
    const response = await fetch('https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/sendOTPEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        purpose,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling cloud function:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
};

