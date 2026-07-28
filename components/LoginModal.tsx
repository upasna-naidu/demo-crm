'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if email exists
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setError(checkData.error || 'Email not found');
        return;
      }

      // Email exists, send OTP
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError('Failed to send OTP');
        return;
      }

      setUserName(checkData.name);
      setUserRole(checkData.role);
      setStep('otp');

      // Show OTP in dev mode
      if (otpData.otp) {
        console.log(`OTP for testing: ${otpData.otp}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendButton(false);

    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        // If OTP expired, show resend button
        if (verifyData.error?.includes('expired')) {
          setShowResendButton(true);
        }
        setError(verifyData.error || 'OTP verification failed');
        return;
      }

      // Login successful
      login(verifyData.user, verifyData.token);
      onClose();
      setEmail('');
      setOtp('');
      setStep('email');
      setShowResendButton(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setShowResendButton(false);

    try {
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError('Failed to resend OTP');
        return;
      }

      setOtp('');
      setError('');
      setShowResendButton(false);

      // Show OTP in dev mode
      if (otpData.otp) {
        console.log(`New OTP for testing: ${otpData.otp}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4" style={{ backgroundColor: 'var(--primary)' }}>
            CR
          </div>
          <h2 className="text-2xl font-bold">CRM Login</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {step === 'email' ? 'Enter your email to login' : `Verify OTP sent to ${email}`}
          </p>
        </div>

        <form onSubmit={step === 'email' ? handleEmailSubmit : handleOtpSubmit} className="space-y-4">
          {step === 'email' ? (
            <div>
              <label className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full mt-2 p-3 border rounded text-sm"
                style={{ borderColor: error ? '#ef4444' : 'var(--border-light)' }}
                required
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full mt-2 p-3 border rounded text-sm text-center text-2xl tracking-widest"
                style={{ borderColor: error ? '#ef4444' : 'var(--border-light)' }}
                required
                autoFocus
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Check your email for the 6-digit code
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded text-sm text-red-600" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white rounded transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Please wait...' : step === 'email' ? 'Send OTP' : 'Verify & Login'}
          </button>

          {step === 'otp' && (
            <>
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full py-2 px-4 text-sm font-medium text-white rounded transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                  setShowResendButton(false);
                }}
                className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Change Email
              </button>
            </>
          )}
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
