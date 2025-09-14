import React, { useState } from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ChangePassword() {
  const [newPass1, setNewPass1] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get contact + otp from ForgotPass2 (passed through navigate state)
  const { contact, otp } = location.state || {};

  const handleSavePassword = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/change-password/", {
        contact: contact,   // ✅ comes from ForgotPass2
        otp: otp,           // ✅ verify code from ForgotPass2
        newpass1: newPass1,
        newpass2: newPass2
      });

      setMessage(res.data.message || "Password reset successful.");
      // ✅ Redirect to login after success
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong.");
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
          <input
            type="password"
            className="login-input"
            placeholder="New password"
            value={newPass1}
            onChange={(e) => setNewPass1(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="Confirm new password"
            value={newPass2}
            onChange={(e) => setNewPass2(e.target.value)}
          />

          <div className="login-button-wrapper">
            <button className="login-button" onClick={handleSavePassword}>
              SAVE PASSWORD
            </button>
          </div>

          {/* ✅ Feedback message */}
          {message && <p style={{ color: "white", marginTop: "10px" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
