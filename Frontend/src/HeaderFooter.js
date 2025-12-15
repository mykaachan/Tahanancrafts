import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as Logo } from "./Logo.svg";
import "./HeaderFooter.css";
import "./PrivacyTerms.css";

// Accept searchQuery and setSearchQuery as props for live filtering
function HeaderFooter({ children, searchQuery, setSearchQuery }) {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);





  return (
    <div className="header-footer-wrapper">
      {/* ================= HEADER ================= */}
      <header className="homepage-header">

        {/* ===== DESKTOP HEADER ===== */}
        <div className="header-row desktop-header">
          <Logo className="logo-svg homepage-logo" />

          <nav className="nav-links main-nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/story">Heritage</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </nav>

          <div className="search-cart-wrap">
            <Link to="/cart">
              <button className="cart-btn">CART 🛒</button>
            </Link>
          </div>
        </div>

        {/* ===== MOBILE HEADER (MAXWOSLEY STYLE) ===== */}
        <div className="header-row mobile-header">
          {/* LEFT: MENU */}
          <button
            className="menu-btn"
            aria-label="Menu"
            onClick={() => {
              setIsMenuOpen(prev => !prev);
            }}
          >
            ☰
          </button>

          {/* CENTER: LOGO */}
          <Logo className="logo-svg homepage-logo mobile-logo" />

          {/* RIGHT: SEARCH + CART */}
          <div className="mobile-actions">
            {/* Hide mobile search icon/modal, let Products.js handle search */}
            <Link to="/cart">
              <button className="icon-btn" aria-label="Cart">
                🛒
              </button>
            </Link>
          </div>
        </div>

        {/* ===== MOBILE NAVIGATION ===== */}
        {isMenuOpen && (
          <nav className="mobile-nav">
            <ul>
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
              <li><Link to="/story" onClick={() => setIsMenuOpen(false)}>Heritage</Link></li>
              <li><Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link></li>
            </ul>
          </nav>
        )}

      </header>

      {/* ===== Page Content ===== */}
      <main style={{ marginTop: "110px" }}>{children}</main>

      {/* ===== Footer ===== */}

      <footer className="footer">
        <div className="footer-main-row">
          <div className="footer-left">
            <h2>
              Join us, <br /> artisans!
            </h2>
            <p>
              Share your handmade creations with the world and join a community
              that celebrates Filipino craftsmanship.
            </p>
            <Link to="/sellerregister" style={{ textDecoration: "none" }}>
              <button className="register-btn">Register</button>
            </Link>
          </div>
          <div className="footer-center-right">
            <div className="footer-line" />
            <div className="footer-center-content">
              <div className="footer-center">
                <h1 className="footer-logo">THC</h1>
              </div>
              <div className="footer-content">
                <div className="footer-links">
                  <h4>ABOUT US</h4>
                  <p onClick={() => openModal("tahanan")} className="footer-link">TahananCrafts</p>
                  <p onClick={() => openModal("about")} className="footer-link">About</p>
                </div>
                <div className="footer-links">
                  <h4>SUPPORT</h4>
                  <p onClick={() => openModal("support")} className="footer-link">Customer Support</p>
                  <p onClick={() => openModal("support")} className="footer-link">Contact</p>
                </div>
                <div className="footer-links">
                  <h4>EMAIL</h4>
                  <p>tahanancrafts.shop@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="footer-line" />
            <div className="footer-bottom-row">
              <div className="footer-bottom-left">
                © 2025 - TahananCrafts
              </div>
              <div className="footer-bottom-right">
                <span onClick={() => openModal("privacy")} className="footer-link">Privacy — Terms</span>
              </div>
            </div>
          </div>
        </div>
      </footer>


      {/* ===== MODALS ===== */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ===== TAHANANCRAFTS DESCRIPTION ===== */}
            {activeModal === "tahanan" && (
              <>
                <h2>TahananCrafts</h2>
                <div className="modal-body">
                  <p>
                    TahananCrafts is an online marketplace dedicated to showcasing the beauty, skill, 
                    and heritage of Filipino handmade artistry. We provide a digital home where local artisans, 
                    especially those from Batangas, can share their handcrafted creations with a wider audience.
                  </p>

                  <p>
                    Every product reflects the creativity, cultural identity, and traditions of the makers behind them. 
                    Through TahananCrafts, customers can discover meaningful pieces, support local livelihoods, 
                    and help preserve the diverse craftsmanship of the Philippines.
                  </p>
                </div>
              </>
            )}

            {/* ===== ABOUT + VISION + MISSION ===== */}
            {activeModal === "about" && (
              <>
                <h2>About Us</h2>
                <div className="modal-body">
                  <p>
                    TahananCrafts was built with the belief that every handmade creation carries a story worth sharing. 
                    Our platform connects artisans with individuals who value authentic craftsmanship, cultural heritage, 
                    and products made with heart. We uplift the lives of local makers by giving them a dedicated space 
                    where their talents can be appreciated and supported.
                  </p>

                  <p>
                    We feature artisans from Batangas who excel in weaving, pottery, carving, embroidery, and other 
                    traditional crafts. Each piece is crafted with patience, passion, and skill, reflecting stories 
                    preserved through generations.
                  </p>

                  <h3>Vision</h3>
                  <p>
                    To become the leading digital home for Filipino handcrafted goods, recognized for empowering artisans, 
                    preserving cultural heritage, and promoting sustainable craftsmanship.
                  </p>

                  <h3>Mission</h3>
                  <p>
                    Our mission is to uplift Filipino artisans by providing fair opportunities to showcase and sell 
                    their handmade creations. We aim to preserve cultural traditions, promote authentic craftsmanship, 
                    and support the growth and livelihood of creative communities across Batangas and beyond.
                  </p>
                </div>
              </>
            )}

            {/* ===== SUPPORT ===== */}
            {activeModal === "support" && (
              <>
                <h2>Support</h2>
                <div className="modal-body">
                  <p>If you need assistance, our team is here to help. You may reach us through:</p>
                  <p><strong>Email:</strong> support@tahanancrafts.ph</p>
                  <p><strong>Facebook:</strong> TahananCrafts Official</p>
                  <p><strong>Hotline:</strong> +63 912 345 6789</p>
                </div>
              </>
            )}

            {/* ===== PRIVACY ===== */}
            {activeModal === "privacy" && (
              <>
                <h2>Privacy Policy & Terms</h2>
                <div className="modal-body">
                  <p><strong>Last Updated:</strong> November 2025</p>
                  <p>
                    We value your privacy and are committed to protecting your personal data while using TahananCrafts. 
                    By continuing to use our services, you agree to our Terms and Policies.
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
