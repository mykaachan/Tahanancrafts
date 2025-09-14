import React, { useState } from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import { useNavigate, useLocation } from "react-router-dom"; 
import { loginOtp } from "./api";

function VerifyCode() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  //  this gets what we passed from login
  const contact = location.state?.contact || "your email/phone";

  const handleVerify = async () => {
    try {
      const res = await loginOtp({ otp, contact }); 
      console.log("OTP verified:", res);
      navigate("/homepage");
    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err.message);
      alert("Invalid code. Please try again.");
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
          {/*  show dynamic contact */}
          <p className="verify-text">
            Code sent to <b>{contact}</b>
          </p>

          <input
            type="text"
            placeholder="Enter verification code"
            className="login-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="login-button" onClick={handleVerify}>
            SUBMIT CODE
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode;
