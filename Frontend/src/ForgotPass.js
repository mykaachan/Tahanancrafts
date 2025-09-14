import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate } from 'react-router-dom';

function ForgotPass() {
  const navigate = useNavigate();

  const handleSendCode = () => {
    navigate('/forgotpass2'); // Go to ForgotPass2
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
