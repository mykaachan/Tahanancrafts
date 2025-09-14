import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate } from 'react-router-dom';

function ForgotPass2() {
  const navigate = useNavigate();

  const handleSubmitCode = () => {
    navigate('/change-password'); // Go to Change Password page
  };

  return (
    <div className="App">
      {/* Background */}
      <div className="App-background-overlay" />

      {/* Left-side White Rectangle */}
      <div className="login-rectangle">
        {/* Logo */}
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
        </div>

        <div className="form-wrapper">
          <p>
            Code sent to <strong>email@gmail.com</strong> / <strong>099999999</strong>
          </p>

          <input
            type="text"
            className="login-input"
            placeholder="Enter verification code"
          />

          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleSubmitCode}>
              SUBMIT CODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass2;
