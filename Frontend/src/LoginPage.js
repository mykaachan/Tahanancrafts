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

  // Normal login → Requests OTP (except admin)
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        contact: enteredEmailOrPhone,
        password: enteredPassword,
      };

      const data = await login(userData);

      // ⭐ Save BASIC USER FIELDS ONLY (NO ARTISAN ID HERE)
      if (data.user?.id) localStorage.setItem("user_id", data.user.id);
      if (data.user?.role) localStorage.setItem("user_role", data.user.role);

      // ⭐ Admin shortcut login
      if (data.redirect === "/AdminDash") {
        alert(data.message || "Redirecting to admin dashboard...");
        window.location.href = "/AdminDash";
        return;
      }

      // ⭐ OTP required → move to verify page
      if (data.otp_required) {
        navigate("/verify", {
          state: { contact: enteredEmailOrPhone },
        });
        return;
      }

      alert(data.message || "Login successful!");

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          "Please check your credentials and try again."
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  // -----------------------
  // GOOGLE LOGIN HANDLER
  // -----------------------
  const handleGoogleLoginSuccess = (response) => {
    const code = response.credential;

    axios
      .post("http://localhost:8000/api/users/auth/google_callback/", {
        credential: code,
      })
      .then((res) => {
        console.log("Logged in with Google:", res.data);

        const user = res.data;

        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("user_role", user.role || "customer");
        localStorage.setItem("user_id", user.id);

        // ⭐ Try to fetch artisan_id for seller Google accounts
        if (user.role === "seller") {
          axios
            .get(
              `http://localhost:8000/api/users/artisan/by-user/${user.id}/`
            )
            .then((r) => {
              localStorage.setItem("artisan_id", r.data.artisan_id);
            })
            .catch(() => console.log("User has no artisan account"));
        }

        if (user.role === "admin") {
          navigate("/AdminDash");
        } else {
          navigate("/verify", { state: { contact: user.email } });
        }
      })
      .catch((err) => {
        console.error(
          "Google login failed:",
          err.response?.data || err.message
        );
        alert("Google login failed");
      });
  };

  const handleGoogleLoginFailure = () => {
    alert("Google login failed");
  };

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
