// Using free SMTP service (Gmail, Outlook, etc.)
export class EmailService {
  static async sendOTP(email, otp, purpose) {
    // For development - log to console
    console.log(`OTP for ${email}: ${otp} - Purpose: ${purpose}`);
    
    // In production, integrate with your backend or email service
    try {
      const response = await fetch('YOUR_BACKEND_EMAIL_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `QuickRupi OTP - ${purpose}`,
          html: this.generateOTPEmail(otp, purpose),
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Email service error:', error);
      // For demo purposes, assume success
      return true;
    }
  }

  static generateOTPEmail(otp, purpose) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">QuickRupi</h2>
        <h3>Your Verification Code</h3>
        <p>Use the following OTP to complete your ${purpose}:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }
}