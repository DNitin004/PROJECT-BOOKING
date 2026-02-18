import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import './Auth.css';

function VerifyEmail() {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const type = location.state?.type || 'signup';
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend && email) {
      setCanResend(true);
    }
  }, [resendTimer, canResend, email]);

  // Initialize countdown
  useEffect(() => {
    setResendTimer(60);
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1); // Only keep last digit
    setOtpDigits(newOtpDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtpDigits = pastedData.split('');
    while (newOtpDigits.length < 6) {
      newOtpDigits.push('');
    }
    setOtpDigits(newOtpDigits);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP({ email, otp, type });
      
      if (type === 'signup') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('✅ Email verified successfully!');
        navigate('/');
      } else {
        toast.success('✅ OTP verified! Reset your password');
        navigate('/reset-password', { state: { resetToken: response.data.resetToken } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendTimer > 0) return;
    
    try {
      setIsLoading(true);
      await authAPI.resendOTP({ email, type });
      toast.success('OTP resent to your email');
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="otp-verification-slide">
        {/* Header */}
        <div className="otp-header">
          <div className="otp-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p className="otp-subtitle">
            We've sent a 6-digit code to<br />
            <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                placeholder="•"
                maxLength="1"
                className="otp-input"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-verify-otp"
            disabled={isLoading || otpDigits.join('').length !== 6}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Verifying...
              </>
            ) : (
              '✓ Verify OTP'
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="otp-resend">
          {resendTimer > 0 ? (
            <p className="resend-timer">
              Resend code in <span>{resendTimer}s</span>
            </p>
          ) : (
            <button 
              type="button"
              className="btn-resend"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              Didn't receive code? <strong>Resend</strong>
            </button>
          )}
        </div>

        {/* Test Info removed for production */}

        {/* Back Link */}
        <div className="otp-footer">
          <a href={type === 'signup' ? '/login' : '/forgot-password'} className="back-link">
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
