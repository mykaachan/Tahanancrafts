import React from "react";
import "./AdminLogin.css";

function AdminLogin() {
  return (
    <div className="admin-login-page">
      <div className="login-container">
        <h1 className="login-logo">T C</h1>
        <form className="login-form">
          <label>Username</label>
          <input type="text" placeholder="Enter username" required />
          
          <label>Password</label>
          <input type="password" placeholder="Enter password" required />
          
          <button type="submit" className="login-btn">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
