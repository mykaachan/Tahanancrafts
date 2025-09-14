import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';

function ChangePassword() {
  return (
    <div className="App">
      <div className="App-background-overlay" />

      <div className="login-rectangle">
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
        </div>

        <div className="form-wrapper">
          <input
            type="password"
            className="login-input"
            placeholder="New password"
          />
          <input
            type="password"
            className="login-input"
            placeholder="Confirm new password"
          />
          <div className="login-button-wrapper">
            <button className="login-button">SAVE PASSWORD</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
