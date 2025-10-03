import React, { useState } from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import { useNavigate, useLocation } from "react-router-dom"; 
import { loginOtp } from "./api";

function VerifyCode() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get contact info passed from login
  const contact = location.state?.contact || "your email/phone";

  const handleVerify = async () => {
  try {
    const res = await loginOtp({ otp, contact });

    // Backend returns { message, user }
    if (res.user && res.user.id) {
      console.log("OTP verified:", res);

      localStorage.setItem("user_id", res.user.id);
      localStorage.setItem("user_role", res.user.role);
      localStorage.setItem("user_email", res.user.name);

      navigate("/homepage");
    } else {
      throw new Error("Invalid code");
    }
  } catch (err) {
    console.error("OTP verification failed:", err.message || err);
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
