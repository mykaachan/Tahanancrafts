import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "./Logo.svg";
import "./HomePage.css";
import "./PrivacyTerms.css"; // ✅ for modal styling

function HeaderFooter({ children }) {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="header-footer-wrapper">
      {/* ===== Header (unchanged) ===== */}
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
              <Link
                to="/products"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/story"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Story
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                style={{ textDecoration: "none", color: "inherit" }}
              >
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
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>
            This is a sample description and does not hold any valuable meaning.
          </p>
          <button className="register-btn">Register</button>
        </div>

        <div className="footer-right">
          <hr />
          <div className="footer-content">
            <h1 className="footer-logo">THC</h1>

            <div className="footer-links">
              <div>
                <h4>ABOUT US</h4>
                <p onClick={() => openModal("about")} className="footer-link">
                  TahananCrafts
                </p>
                <p onClick={() => openModal("about")} className="footer-link">
                  About
                </p>
              </div>
              <div>
                <h4>SUPPORT</h4>
                <p onClick={() => openModal("support")} className="footer-link">
                  Customer Support
                </p>
                <p onClick={() => openModal("support")} className="footer-link">
                  Contact
                </p>
              </div>
              <div>
                <h4>EMAIL</h4>
                <p>tahanancrafts.shop@gmail.com</p>
              </div>
            </div>
          </div>
          <hr />
          <div className="footer-bottom">
            <p>© 2025 - TahananCrafts</p>
            <p onClick={() => openModal("privacy")} className="footer-link">
              Privacy — Terms
            </p>
          </div>
        </div>
      </footer>

      {/* ===== POPUPS ===== */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {activeModal === "about" && (
              <>
                <h2>About TahananCrafts</h2>
                <div className="modal-body">
                  <p>
                    <strong>TahananCrafts</strong> is a Filipino artisan
                    marketplace dedicated to empowering Batangueño and Filipino
                    craftsmen. Our mission is to bring handcrafted local
                    products into the digital world with pride and authenticity.
                  </p>
                </div>
              </>
            )}

            {activeModal === "support" && (
              <>
                <h2>Support</h2>
                <div className="modal-body">
                  <p>
                    For inquiries or assistance, our team is here to help.
                    Contact us via:
                  </p>
                  <p>
                    <strong>Email:</strong> support@tahanancrafts.ph
                  </p>
                  <p>
                    <strong>Facebook:</strong> TahananCrafts Official
                  </p>
                  <p>
                    <strong>Hotline:</strong> +63 912 345 6789
                  </p>
                </div>
              </>
            )}

            {activeModal === "privacy" && (
              <>
                <h2>Privacy Policy & Terms</h2>
                <div className="modal-body">
                  <p>
                    <strong>Last Updated:</strong> November 2025
                  </p>
                  <p>
                    We value your privacy and are committed to protecting your
                    personal data while using TahananCrafts. By continuing to
                    use our services, you agree to our Terms and Policies.
                  </p>
                </div>
              </>
            )}

            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderFooter;
