import React, { useState } from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from './api';  //  import API call

function ForgotPass() {
  const navigate = useNavigate();
  const [contact, setContact] = useState("");  //  store email/phone input

  const handleSendCode = async () => {
    try {
      // ✅ call backend to send reset code
      const res = await forgotPassword({ contact });
      console.log("Reset code sent:", res);

      // ✅ pass contact to next page so it can display
      navigate('/forgotpass2', { state: { contact} });
    } catch (err) {
      console.error("Failed to send reset code:", err.response?.data || err.message);
      alert("Failed to send reset code. Please check your input.");
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
          {/* Single Email or Phone Input */}
          <input
            type="text"
            className="login-input"
            placeholder="Email or Phone Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}  // ✅ update state
          />

          {/* Send Code Button */}
          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleSendCode}>
              SEND CODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass;
