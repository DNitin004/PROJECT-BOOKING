import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email && !phoneNumber) {
      toast.error('Please provide email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword({
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
      });
      toast.success('OTP sent to your email');
      navigate('/verify-email', { state: { email: email || 'phone', type: 'forgotPassword' } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Your Password</h2>
        <p className="auth-subtitle">Enter your email or phone number</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email (or Phone Number)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10-digit phone number"
              pattern="[0-9]{10}"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading || (!email && !phoneNumber)}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="auth-links">
          <p><a href="/login">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
