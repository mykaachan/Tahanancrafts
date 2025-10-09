// src/LoginPage.js
import React, { useState } from "react";
import logo from "./Logo.svg"; // ✅ use image import, not SVG component
import { Link, useNavigate } from "react-router-dom";
import { login } from "./api"; // login request (sends contact + password, receives OTP)
import { GoogleLogin } from "@react-oauth/google"; // Google login component
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();

  const [enteredEmailOrPhone, setEnteredEmailOrPhone] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  // -------------------------------
  // Normal login (OTP request)
  // -------------------------------
  const handleLogin = async () => {
    const userData = {
      contact: enteredEmailOrPhone,
      password: enteredPassword,
    };

    try {
      const res = await login(userData);
      console.log("OTP request success:", res);
      navigate("/verify", { state: { contact: enteredEmailOrPhone } });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // -------------------------------
  // Google login
  // -------------------------------
  const handleGoogleLoginSuccess = (response) => {
    const code = response.credential;

    axios
      .post("http://localhost:8000/api/users/auth/google_callback/", {
        credential: code,
      })
      .then((res) => {
        console.log("Logged in with Google:", res.data);
        alert("Login successful!");
        localStorage.setItem("user_email", res.data.email);
        localStorage.setItem("user_name", res.data.name);
        navigate("/homepage");
      })
      .catch((err) => {
        console.error("Google login failed:", err.response?.data || err.message);
        alert("Google login failed");
      });
  };

  const handleGoogleLoginFailure = () => {
    alert("Google login failed");
  };

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="App">
      <div className="App-background-overlay" />

      <div className="login-rectangle">
        <div className="logo-wrapper">
          {/* ✅ Unified logo style */}
          <img src={logo} alt="Tahanan Crafts Logo" className="auth-logo" />
        </div>

        <div className="form-wrapper">
          <input
            type="text"
            className="login-input"
            placeholder="Email or Phone Number"
            value={enteredEmailOrPhone}
            onChange={(e) => setEnteredEmailOrPhone(e.target.value)}
            onKeyDown={handleKeyDown}
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
            <button className="social-button facebook">
              <img src="/Facebook.png" alt="Facebook" className="social-icon" />
              Sign in with Facebook
            </button>

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
