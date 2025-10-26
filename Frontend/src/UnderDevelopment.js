import React from "react";
import { useNavigate } from "react-router-dom";
import "./Underdev.css";
import { ReactComponent as Logo } from "./Logo.svg"; 

function UnderDevelopment() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/homepage"); // Go to your actual homepage route
  };

  return (
    <div className="underdev-container">
      <div className="underdev-card">
        <Logo className="logo-svg homepage-logo" />
        <h1 className="underdev-title"> Under Development</h1>
        <p className="underdev-text">
          Our website is still being crafted with care. Some features might not
          work yet as we continue improving your experience.
        </p>

        <p className="underdev-note">
          Please note that most of the products and artisans shown here are not
          real and are used solely for development and testing purposes.
        </p>

        <p className="underdev-thanks">
          Thank you for your patience and understanding 💛
        </p>

        <button className="underdev-btn" onClick={handleContinue}>
          Go to Homepage
        </button>
      </div>
    </div>
  );
}

export default UnderDevelopment;
