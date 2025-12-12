import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <footer className="footer">
      {/* LEFT SECTION */}
      <div className="footer-left">
        <h2>Join us, <br /> artisans!</h2>
        <p>Showcase your handmade creations and connect with customers who value authentic Filipino craftsmanship.</p>
        <Link to="/sellerregister">
          <button className="register-btn">Register</button>
        </Link>
      </div>

      {/* RIGHT SECTION */}
      <div className="footer-right">
        <hr />

        <div className="footer-content">
          <h1 className="footer-logo">THC</h1>

          <div className="footer-links">
            <div>
              <h4>ABOUT US</h4>
              <p onClick={() => openModal("tahanan")} className="footer-link">TahananCrafts</p>
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
          <p onClick={() => openModal("privacy")} className="footer-link">
            Privacy — Terms
          </p>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {/* TAHANANCRAFTS DESCRIPTION MODAL */}
            {activeModal === "tahanan" && (
              <>
                <h2>TahananCrafts</h2>
                <div className="modal-body">
                  <p>
                    TahananCrafts is an online marketplace dedicated to showcasing the beauty, skill, 
                    and heritage of Filipino handmade artistry. We provide a digital home where local artisans, 
                    especially those from Batangas, can share their handcrafted creations with a wider audience. 
                    Every product reflects the rich traditions, creativity, and cultural identity of the makers. 
                    Through TahananCrafts, customers can discover meaningful pieces, support local livelihoods, 
                    and help preserve the diverse craftsmanship of the Philippines.
                  </p>
                </div>
              </>
            )}

            {/* ABOUT + VISION + MISSION MODAL */}
            {activeModal === "about" && (
              <>
                <h2>About Us</h2>
                <div className="modal-body">
                  <p>
                    TahananCrafts was built with the belief that every handmade creation carries a story worth sharing.
                    Our platform connects artisans with individuals who value authentic craftsmanship, cultural heritage, 
                    and products made with heart. We uplift the lives of local makers by providing a dedicated space where 
                    their talents can be appreciated and supported.
                  </p>

                  <p>
                    We feature artisans from Batangas who are skilled in weaving, pottery, carving, embroidery, 
                    and other traditional crafts. Each piece is crafted with patience, skill, and passion, reflecting 
                    stories that have been preserved through generations.
                  </p>

                  <h3>Vision</h3>
                  <p>
                    To become the leading digital home for Filipino handcrafted goods, recognized for empowering artisans, 
                    preserving cultural heritage, and promoting sustainable craftsmanship.
                  </p>

                  <h3>Mission</h3>
                  <p>
                    Our mission is to uplift Filipino artisans by providing fair opportunities to showcase and sell their 
                    handmade creations. We aim to preserve cultural traditions, promote authentic craftsmanship, and support 
                    the growth and livelihood of creative communities across Batangas and beyond.
                  </p>
                </div>
              </>
            )}

            {/* SUPPORT MODAL */}
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

            {/* PRIVACY MODAL */}
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
