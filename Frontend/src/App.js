import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './Logo.svg';
import { Link, useNavigate } from 'react-router-dom';  // ✅ add useNavigate



function App() {
  const navigate = useNavigate();  // ✅ hook for navigation

  const handleLogin = () => {
    // (you can add authentication logic here later)
    navigate("/homepage");  // ✅ redirect to HomePage.js route
  };

  return (
    <div className="App">
      {/* Background */}
      <div className="App-background-overlay" />

      {/* Left-side Login Rectangle */}
      <div className="login-rectangle">
        <div className="logo-wrapper">
          <Logo className="logo-svg login-logo" />
      </div>

        <div className="form-wrapper">
          <input
            type="text"
            className="login-input"
            placeholder="Email or Phone Number"
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
          />
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <div className="login-button-wrapper">
            {/* ✅ when clicked, goes to HomePage */}
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
            <button className="social-button google">
              <img src="/Google.png" alt="Google" className="social-icon" />
              Sign in with Google
            </button>
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

export default App;
