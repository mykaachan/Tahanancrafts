import React from 'react';
import './SignUp.css';
import { ReactComponent as Logo } from './Logo.svg';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // 👉 After signup, go to Verify Code page
    navigate('/verify');
  };

  return (
    <div className="App">
      <div className="App-background-overlay" />

      <div className="login-rectangle">
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
        </div>

        <div className="form-wrapper">
          <input type="text" placeholder="Name" className="login-input" />
          <input type="text" placeholder="Email or Phone" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />

          {/* ✅ Redirects to Verify Page */}
          <button className="login-button" onClick={handleSignUp}>
            SIGN UP
          </button>

          <div className="signup-prompt">
            <span>Already have an account? </span>
            <Link to="/">LOG IN</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
