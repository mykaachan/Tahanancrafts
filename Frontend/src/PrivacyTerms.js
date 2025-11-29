import React, { useState } from "react";
import "./PrivacyTerms.css";
function PrivacyTerms({ onAgreeChange }) {
  const [showModal, setShowModal] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const handleCheckbox = (e) => {
    const checked = e.target.checked;
    setAgreePrivacy(checked);
    if (onAgreeChange) onAgreeChange(checked);
  };
  return (
    <div className="privacy-terms">
      <label className="checkbox-label">
        <input
          type="checkbox"
          required
          checked={agreePrivacy}
          onChange={handleCheckbox}
        />
        <span>
          I agree to the{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => setShowModal(true)}
          >
            Terms & Conditions
          </button>
          .
        </span>
      </label>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent background click from closing
          >
            <h2>Terms & Conditions</h2>
            <div className="modal-body">
              <p><strong>Last Updated:</strong> October 2025</p>
              <p>
                Welcome to <strong>TahananCrafts</strong> — a Filipino Artisan
                Marketplace dedicated to empowering Batangueño and Filipino
                craftsmen through a trusted digital platform.
              </p>
              <h3>1. Data We Collect</h3>
              <p>
                We collect personal data such as your name, email, and contact
                number to process accounts, transactions, and communication.
              </p>
              <h3>2. Purpose of Collection</h3>
              <p>
                Your data helps us connect you with artisans, process payments,
                and improve the TahananCrafts platform experience.
              </p>
              <h3>3. Data Security</h3>
              <p>
                All personal information is encrypted and securely stored. We do
                not sell or share data without your consent.
              </p>
              <h3>4. User Rights</h3>
              <p>
                You may request account deletion or data correction anytime by
                contacting <strong>tahanancrafts.shop@gmail.com</strong>.
              </p>
              <h3>5. Terms of Use</h3>
              <p>
                By using TahananCrafts, you agree to engage respectfully,
                provide accurate information, and comply with marketplace rules.
              </p>
              <h3>6. Updates</h3>
              <p>
                This policy may be updated from time to time. Continued use of
                TahananCrafts signifies your acceptance of the latest version.
              </p>
            </div>
            <button
              className="close-modal-btn"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default PrivacyTerms;
