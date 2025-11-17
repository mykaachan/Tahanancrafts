import React, { useState } from "react";
import "./SellerRegister.css";

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    location: "",
    businessPermit: null,
    description: "",
    contact: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms || !agreedToPrivacy) {
      alert("You must agree to the Terms and Conditions and Privacy Policy before registering.");
      return;
    }
    alert("Seller Registration Submitted!");
    console.log(formData);
  };

  return (
    <div className="seller-register-container">
      <div className="seller-register-box">
        <h2>Seller Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Enter shop name"
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter owner name"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="form-group">
            <label>Business Permit</label>
            <input
              type="file"
              name="businessPermit"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Shop Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your shop and products"
            />
          </div>

          <div className="form-group">
            <label>Email / Contact Number</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. tahanancrafts@gmail.com/09123456789"
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="form-group terms-checkbox">
            <label>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              I agree to the{" "}
              <span
                className="terms-link"
                onClick={() => setShowTermsModal(true)}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="form-group terms-checkbox">
            <label>
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              />
              I agree to the{" "}
              <span
                className="terms-link"
                onClick={() => setShowPrivacyModal(true)}
              >
                Privacy Policy
              </span>
            </label>
          </div>

          <button type="submit" className="submit-btn">
            Submit Registration
          </button>
        </form>
      </div>

      {/* Modal for Terms */}
      {showTermsModal && (
        <div
          className="terms-modal-overlay"
          onClick={() => setShowTermsModal(false)}
        >
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <ol>
              <h2>Terms & Condition for Sellers</h2>
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
            </ol>
            <button
              onClick={() => setShowTermsModal(false)}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

{/* Modal for Privacy Policy */}
{showPrivacyModal && (
  <div
    className="terms-modal-overlay"
    onClick={() => setShowPrivacyModal(false)}
  >
    <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
      <h2>PRIVACY POLICY</h2>
      <p><strong>Last Updated:</strong> November 2025</p>
      <p>
        TahananCrafts (“we”, “our”, “us”) is committed to protecting the privacy 
        and personal data of all users, including buyers, sellers, and visitors 
        of our platform. This Privacy Policy explains how we collect, use, store, 
        share, and protect your information.
      </p>
      <p>
        By using TahananCrafts, you agree to the data practices described in this policy.
      </p>

      <h3>1. Information We Collect</h3>
      <p><strong>1.1 Personal Information Provided by Users</strong></p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Delivery address</li>
        <li>Seller business information</li>
        <li>Payment details (excluding full card numbers)</li>
        <li>Government-issued IDs (if required for seller verification)</li>
      </ul>

      <p><strong>1.2 Automatically Collected Data</strong></p>
      <ul>
        <li>Device information (model, OS)</li>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Cookies and session data</li>
        <li>Platform usage logs (pages visited, interactions, timestamps)</li>
      </ul>

      <p><strong>1.3 Transaction & Marketplace Data</strong></p>
      <ul>
        <li>Orders placed</li>
        <li>Orders fulfilled / cancelled</li>
        <li>Shipping information</li>
        <li>Proof of payment or refund</li>
        <li>Uploaded product images or documents</li>
        <li>Chat or inquiry messages exchanged through the platform</li>
      </ul>

      <p><strong>1.4 Third-Party Integrations (Optional)</strong></p>
      <ul>
        <li>Payment verification status</li>
        <li>Tracking numbers</li>
        <li>Shipping payment confirmation</li>
      </ul>

      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>Processing orders, payments, and refunds</li>
        <li>Creating and managing user accounts</li>
        <li>Facilitating communication between buyer and seller</li>
        <li>Displaying products, reviews, and store profiles</li>
        <li>Detecting suspicious activity</li>
        <li>Verifying sellers</li>
        <li>Monitoring abuse or policy violations</li>
        <li>Preventing unauthorized access</li>
        <li>Answering inquiries and resolving disputes</li>
        <li>Debugging and improving platform features</li>
        <li>Legal compliance (PH Data Privacy Act of 2012)</li>
      </ul>

      <h3>3. How We Share Your Information</h3>
      <p>We do not sell your personal data. We may share information only with:</p>
      <ul>
        <li><strong>Buyers & Sellers:</strong> Name, Address, Contact, Order info</li>
        <li><strong>Service Providers:</strong> Payment processors, Logistics, Cloud services, Analytics tools</li>
        <li><strong>Legal Authorities:</strong> If legally required</li>
      </ul>

      <h3>4. Data Storage & Security</h3>
      <ul>
        <li>Encrypted data transmission (HTTPS/SSL)</li>
        <li>Secured cloud infrastructure</li>
        <li>Role-based access for admins</li>
        <li>Regular backups & monitoring</li>
      </ul>

      <h3>5. User Rights & Controls</h3>
      <ul>
        <li>Access, correct, delete your data</li>
        <li>Withdraw consent</li>
        <li>File complaints with NPC</li>
      </ul>
      <p>Contact: <strong>tahanancrafts.shop@gmail.com</strong></p>

      <h3>6. Cookies & Tracking</h3>
      <p>You may disable cookies, but some features may not work properly.</p>

      <h3>7. Children’s Privacy</h3>
      <p>Not intended for children under 13. Accounts of minors without consent will be removed.</p>

      <h3>8. Data Breach Procedures</h3>
      <ol>
        <li>Secure system immediately</li>
        <li>Investigate breach</li>
        <li>Notify affected users within 72 hours</li>
        <li>Coordinate with National Privacy Commission</li>
      </ol>

      <h3>9. Changes to This Policy</h3>
      <p>Major changes communicated via email or dashboard. Continuing to use the platform means accepting the updated policy.</p>

      <h3>10. Contact Information</h3>
      <p>Email: tahanancrafts.shop@gmail.com</p>
      <p>Address: Batangas, Philippines</p>
      <p>Website: www.tahanancrafts.shop</p>

      <button
        onClick={() => setShowPrivacyModal(false)}
        className="close-btn"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default SellerRegister;
