import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "./Logo.svg"; 
import "./HomePage.css"; // ✅ reuse the same CSS

function HeaderFooter({ children }) {
  return (
    <div className="header-footer-wrapper">
      {/* ===== Header ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" style={{ textDecoration: "none", color: "inherit" }}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/story" style={{ textDecoration: "none", color: "inherit" }}>
                Story
              </Link>
            </li>
            <li>
  <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
    Profile
  </Link>
</li>
          </ul>
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>

          {/* ✅ CART button linked to /cart */}
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <button className="cart-btn">CART 🛒</button>
          </Link>
        </div>
      </header>

      {/* ===== Page Content ===== */}
      <main style={{ marginTop: "120px" }}>{children}</main>

      {/* ===== Footer ===== */}
      <footer className="footer">
        {/* Left Section */}
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>
            This is a sample description and does not hold any valuable meaning.
          </p>
          <button className="register-btn">Register</button>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <hr />
          <div className="footer-content">
            <h1 className="footer-logo">THC</h1>

            <div className="footer-links">
              <div>
                <h4>ABOUT US</h4>
                <p>TahananCrafts</p>
                <p>About</p>
              </div>
              <div>
                <h4>SUPPORT</h4>
                <p>Customer Support</p>
                <p>Contact</p>
              </div>
              <div>
                <h4>EMAIL</h4>
                <p>Sample@email.com</p>
              </div>
            </div>
          </div>
          <hr />
          <div className="footer-bottom">
            <p>© 2025 - TahananCrafts</p>
            <p>Privacy — Terms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HeaderFooter;
