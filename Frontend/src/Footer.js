import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; // your footer styles
function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);
  return (
    <footer className="footer">
      <div className="footer-left">
        <h2>Join us, <br /> artisans!</h2>
        <p>This is a sample description and does not hold any valuable meaning.</p>
        <Link to="/sellerregister">
          <button className="register-btn">Register</button>
        </Link>
      </div>
      <div className="footer-right">
        <hr />
        <div className="footer-content">
          <h1 className="footer-logo">THC</h1>
          <div className="footer-links">
            <div>
              <h4>ABOUT US</h4>
              <p onClick={() => openModal("about")} className="footer-link">TahananCrafts</p>
              <p onClick={() => openModal("about")} className="footer-link">About</p>
            </div>
            <div>
              <h4>SUPPORT</h4>
              <p onClick={() => openModal("support")} className="footer-link">Customer Support</p>
              <p onClick={() => openModal("support")} className="footer-link">Contact</p>
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
          <p onClick={() => openModal("privacy")} className="footer-link">Privacy — Terms</p>
        </div>
      </div>
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {activeModal === "about" && (
              <>
                <h2>About TahananCrafts</h2>
                <div className="modal-body">
                  <p>
                    <strong>TahananCrafts</strong> is a Filipino artisan marketplace dedicated
                    to empowering Batangueño and Filipino craftsmen.
                  </p>
                </div>
              </>
            )}
            {activeModal === "support" && (
              <>
                <h2>Support</h2>
                <div className="modal-body">
                  <p>Email: support@tahanancrafts.ph</p>
                  <p>Facebook: TahananCrafts Official</p>
                  <p>Hotline: +63 912 345 6789</p>
                </div>
              </>
            )}
            {activeModal === "privacy" && (
              <>
                <h2>Privacy Policy & Terms</h2>
                <div className="modal-body">
                  <p>Last Updated: November 2025</p>
                  <p>We value your privacy and are committed to protecting your personal data.</p>
                </div>
              </>
            )}
            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </footer>
  );
}
export default Footer;
