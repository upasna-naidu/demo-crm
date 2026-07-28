// Persistent OTP store
export const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// Cleanup expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const email in otpStore) {
    if (otpStore[email].expiresAt < now) {
      delete otpStore[email];
    }
  }
}, 60000);
