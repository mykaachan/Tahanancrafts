import React, { useState } from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { loginOtp } from "./api";

function VerifyCode() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Contact email/phone from LoginPage
  const contact = location.state?.contact || "your email/phone";

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  const handleVerify = async () => {
    try {
      const res = await loginOtp({ otp, contact });

      if (!res.user) throw new Error("Invalid response");

      const user = res.user;

      console.log("OTP verified:", user);

      // ---------------------------------------------
      // ⭐ SAVE ALL USER DATA IN LOCAL STORAGE
      // ---------------------------------------------
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_name", user.username || user.name || "");
      localStorage.setItem("user_email", user.email || contact);

      // ⭐ Save artisan_id ONLY if seller
      if (user.role === "seller" && user.artisan_id) {
        localStorage.setItem("artisan_id", user.artisan_id);
      }

      // ---------------------------------------------
      // ⭐ REDIRECT BASED ON USER ROLE
      // ---------------------------------------------
      if (user.role === "seller") {
        navigate("/seller-dashboard");
      } 
      else if (user.role === "admin") {
        navigate("/AdminDash");
      }
      else {
        navigate("/");
      }

    } catch (err) {
      console.error("OTP verification failed:", err);
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
            onKeyDown={handleKeyDown}
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
