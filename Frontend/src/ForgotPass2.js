import React, { useState } from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { forgotPasswordOtp } from './api';  // ✅ import API

function ForgotPass2() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ get passed state from ForgotPass
  const contact = location.state?.contact || "your email/phone"; // ✅ fallback

  const [otp, setOtp] = useState(""); // ✅ store entered OTP

  const handleSubmitCode = async () => {
    try {
      // ✅ call API to verify OTP
      const res = await forgotPasswordOtp({ contact, otp });
      console.log("OTP verified:", res);

      // ✅ navigate to change password if success
      navigate('/change-password', { state: { contact, otp } });
    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err.message);
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="App">
      {/* Background */}
      <div className="App-background-overlay" />

      {/* White Rectangle */}
      <div className="login-rectangle">
        {/* Logo */}
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
        </div>

        <div className="form-wrapper">
          <p>
            Code sent to <strong>{contact}</strong>
          </p>

          <input
            type="text"
            className="login-input"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)} // ✅ update otp state
          />

          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleSubmitCode}>
              SUBMIT OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass2;
