import React, { useState } from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { loginOtp } from "./api";

function VerifyCode() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Contact email/phone from LoginPage
  const contact = location.state?.contact || "";

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  const handleVerify = async () => {
    try {
      // ✅ CALL OTP VERIFY API
      const res = await loginOtp({ otp, contact });

      // ✅ DESTRUCTURE RESPONSE CORRECTLY
      const { token, user } = res;

      if (!token || !user) {
        throw new Error("Invalid OTP response");
      }

      console.log("OTP verified:", user);

      // ---------------------------------------------
      // ⭐ SAVE AUTH DATA (THIS FIXES 403 ERRORS)
      // ---------------------------------------------
      localStorage.setItem("token", token);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_name", user.username || "");
      localStorage.setItem("user_email", contact);

      // ⭐ Save artisan_id ONLY if seller
      if (user.role === "seller" && user.artisan_id) {
        localStorage.setItem("artisan_id", user.artisan_id);
      } else {
        localStorage.removeItem("artisan_id");
      }

      // ---------------------------------------------
      // ⭐ REDIRECT BY ROLE
      // ---------------------------------------------
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "seller") {
        navigate("/seller-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
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
