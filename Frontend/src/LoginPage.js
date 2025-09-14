// src/LoginPage.js
import React, { useState } from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { login } from "./api"; // your backend API for normal login
import { GoogleLogin } from '@react-oauth/google'; // Google login component
import axios from 'axios';

function LoginPage() {
  const navigate = useNavigate();

  const [enteredEmailOrPhone, setEnteredEmailOrPhone] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  // -------------------------------
  // Normal login
  // -------------------------------
  const handleLogin = async () => {
    const userData = {
      contact: enteredEmailOrPhone,
      password: enteredPassword,
    };

    try {
      const res = await login(userData);
      console.log("Login success:", res);

      // go to Verify page
      navigate("/verify", { state: { contact: enteredEmailOrPhone } });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Login failed. Please check your credentials.");
    }
  };

  // -------------------------------
  // Google login
  // -------------------------------
  const handleGoogleLoginSuccess = (response) => {
    const code = response.credential; // Google sends the ID token

    axios.post('http://localhost:8000/auth/social/google/', { code })
      .then(res => {
        console.log('Logged in with Google:', res.data);
        alert('Login successful!');
        navigate('/homepage'); // redirect to homepage
      })
      .catch(err => {
        console.error('Google login failed:', err.response?.data || err.message);
        alert('Google login failed');
      });
  };

  const handleGoogleLoginFailure = () => {
    alert('Google login failed');
  };

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="App">
      <div className="App-background-overlay" />

      <div className="login-rectangle">
        <div className="logo-wrapper">
          <Logo className="logo-svg login-logo" />
        </div>

        <div className="form-wrapper">
          <input
            type="text"
            className="login-input"
            placeholder="Email or Phone Number"
            value={enteredEmailOrPhone}
            onChange={(e) => setEnteredEmailOrPhone(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
          />

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleLogin}>
              LOGIN
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-buttons">
            {/* Facebook login placeholder */}
            <button className="social-button facebook">
              <img src="/Facebook.png" alt="Facebook" className="social-icon" />
              Sign in with Facebook
            </button>

            {/* Google login */}
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            />
          </div>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <Link to="/signup">SIGN UP</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
