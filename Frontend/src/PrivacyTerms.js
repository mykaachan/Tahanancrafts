import React, { useState } from "react";
import "./PrivacyTerms.css";

const PrivacyTerms = ({ onAgreeChange }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = (e) => {
    e.preventDefault();
    setShowModal(!showModal);
  };

  return (
    <div className="privacy-terms-container">
      <input
        type="checkbox"
        id="agree"
        required
        onChange={(e) => onAgreeChange?.(e.target.checked)}
      />
      <label htmlFor="agree">
        I agree to the{" "}
        <a href="#" onClick={toggleModal}>
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="#" onClick={toggleModal}>
          Terms of Service
        </a>.
      </label>

      {showModal && (
        <div className="policy-modal">
          <div className="policy-content">
            <span className="close-btn" onClick={toggleModal}>
              &times;
            </span>
            <h2>Privacy Policy</h2>
            <p>
              At <strong>TahananCrafts</strong>, we value your privacy. We collect only the
              information necessary to manage your account, promote your crafts, and
              process transactions. We never sell or share your personal data without
              your consent.
            </p>
            <p>
              Your information may be used to improve recommendations and analytics
              through machine learning, ensuring a personalized experience.
            </p>

            <h2>Terms of Service</h2>
            <p>
              By using <strong>TahananCrafts</strong>, you agree to upload only
              authentic, handmade products that reflect Filipino craftsmanship.
            </p>
            <p>
              We reserve the right to remove listings or accounts that violate community
              guidelines, engage in fraudulent activity, or infringe intellectual
              property rights.
            </p>
            <p>Continuing to use the platform means you agree to these terms.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyTerms;
