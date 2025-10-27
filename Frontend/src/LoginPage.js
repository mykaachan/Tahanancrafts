// src/LoginPage.js
import React, { useState } from "react";
import logo from "./Logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { login } from "./api";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();

  const [enteredEmailOrPhone, setEnteredEmailOrPhone] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  // -------------------------------
  // Normal login (OTP request + admin shortcut)
  // -------------------------------
  const handleLogin = async (e) => {
  e.preventDefault();

  try {
      const userData = {
        contact: enteredEmailOrPhone,
        password: enteredPassword,
      };

      // ✅ use your api helper instead of fetch
      const data = await login(userData);

    if (response.ok) {
      // ✅ If backend sent a redirect (admin detected)
      if (data.redirect === "/AdminDash") {
        alert(data.message); // optional
        window.location.href = "/AdminDash";
        return;
      }

      // ✅ Normal OTP-required flow
      if (data.otp_required) {
        navigate("/verify", { state: { contact: enteredEmailOrPhone } }); // 👈 pass contact from login input
      }
    } else {
      alert(data.error || "Please check your credentials and try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
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

        const userEmail = res.data.email;
        const userName = res.data.name;
        const userRole = res.data.role || "customer";

        localStorage.setItem("user_email", userEmail);
        localStorage.setItem("user_name", userName);
        localStorage.setItem("user_role", userRole);

        alert("Login successful!");

        // ✅ Admins skip OTP, others go through verify
        if (userRole === "admin") {
          navigate("/AdminDash");
        } else {
          navigate("/verify", { state: { contact: userEmail } });
        }
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
