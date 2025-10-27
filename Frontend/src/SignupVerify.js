import React, { useState } from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUserOtp } from './api'; // API function

function SignupVerifyContact() {
  const navigate = useNavigate();
  const location = useLocation();

  // Contact passed from SignUp.js
  const contact = location.state?.contact || "your email/phone";
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp) {
      alert("Please enter the verification code.");
      return;
    }

    try {
      // ✅ Verify OTP via backend
      const res = await registerUserOtp({ contact, otp });
      console.log("Verification success:", res);

      // ✅ Save user info to localStorage (same pattern as LoginPage)
      if (res && res.user) {
        localStorage.setItem("user_id", res.user.id);
        localStorage.setItem("user_name", res.user.name);
        localStorage.setItem("user_contact", res.user.contact);
        localStorage.setItem("user_role", res.user.role || "customer");

        // Optional: Save auth token if provided
        if (res.token) {
          localStorage.setItem("auth_token", res.token);
        }
      }

      alert("Account created successfully!");
      navigate("/homepage");
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="App">
      <div className="App-background-overlay" />
      <div className="login-rectangle">
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
            onChange={(e) => setOtp(e.target.value)}
          />

          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleVerify}>
              VERIFY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupVerifyContact;
