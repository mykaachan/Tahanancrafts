import React, { useState } from 'react';
import './SignUp.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from './api'; //  Import signup API

function SignUp() {
  const navigate = useNavigate();

  //  Track form values
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    console.log("🔹 Sign up button clicked");
    console.log("📤 Sending data:", { name, contact, password });

    // Check if any fields are empty
    if (!name || !contact || !password) {
      console.warn("⚠️ Missing fields");
      alert("Please fill in all fields before signing up.");
      return;
    }

    try {
      console.log("⏳ Calling registerUser API...");
      const res = await registerUser({ name, contact, password });
      console.log("✅ Signup successful, response:", res);

      // Navigate to next page
      console.log("➡️ Navigating to /signup-verify with contact:", contact);
      navigate('/signup-verify', { state: { contact } });

    } catch (err) {
      console.error("❌ Signup failed:", err);
      console.error("🧩 Error details:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Signup failed. Please try again.");
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
            type="text"
            placeholder="Name"
            className="login-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email or Phone"
            className="login-input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-button" onClick={handleSignUp}>
            SIGN UP
          </button>

          <div className="signup-prompt">
            <span>Already have an account? </span>
            <Link to="/login">LOG IN</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;