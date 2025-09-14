import React from 'react';
import { ReactComponent as Logo } from './Logo.svg';

function VerifyCode() {
  return (
    <div className="App">
      {/* Background */}
      <div className="App-background-overlay" />

      {/* Verify Code Rectangle */}
      <div className="login-rectangle">
        {/* Logo */}
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
        </div>

        {/* Form */}
        <div className="form-wrapper">
          <p className="verify-text">
            Code sent to <b>email@gmail.com</b> / <b>099999</b>
          </p>
          <input
            type="text"
            placeholder="Enter verification code"
            className="login-input"
          />

          <button className="login-button">SUBMIT CODE</button>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode;
