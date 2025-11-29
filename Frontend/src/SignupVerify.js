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
    try {
      const res = await registerUserOtp({ contact, otp });
      console.log("Verification success:", res);

      alert("Account created successfully!");

      // ✅ Save contact instead of user_id
      if (res?.user?.id) {
        localStorage.setItem("user_id", res.user.id);

        // ✅ Save whichever contact type is valid
        if (res.user.email && res.user.email !== "null") {
          localStorage.setItem("email", res.user.email);
        }
        if (res.user.phone && res.user.phone !== "null") {
          localStorage.setItem("phone", res.user.phone);
        }
      }

      navigate('/homepage');
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      alert("Invalid OTP. Please try again.");
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
