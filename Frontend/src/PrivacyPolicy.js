import React, { useState } from "react";
import "./PrivacyTerms.css"; 
function PrivacyPolicy({ onAgreeChange }) {
  const [showModal, setShowModal] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const handleCheckbox = (e) => {
    const checked = e.target.checked;
    setAgreePrivacy(checked);
    if (onAgreeChange) onAgreeChange(checked);
  };
  return (
    <div className="privacy-terms">
      {/* Checkbox for agreeing */}
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
            Privacy Policy
          </button>
          .
        </span>
      </label>
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>PRIVACY POLICY</h2>
            <div className="modal-body">
              <p><strong>Last Updated:</strong> November 2025</p>
              <p>
                TahananCrafts (“we”, “our”, “us”) is committed to protecting the privacy 
                and personal data of all users, including buyers, sellers, and visitors 
                of our platform. This Privacy Policy explains how we collect, use, store, 
                share, and protect your information.
              </p>
              <p>By using TahananCrafts, you agree to the data practices described in this policy.</p>
              <hr />
              <h3>1. Information We Collect</h3>
              <p>We collect the following types of information:</p>
              <h4>1.1. Personal Information Provided by Users</h4>
              <ul>
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Delivery address</li>
                <li>Seller business information</li>
                <li>Payment details (excluding full card numbers)</li>
                <li>Government-issued IDs (if required for seller verification)</li>
              </ul>
              <h4>1.2. Automatically Collected Data</h4>
              <ul>
                <li>Device information (model, OS)</li>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Cookies and session data</li>
                <li>Platform usage logs (pages visited, interactions, timestamps)</li>
              </ul>
              <h4>1.3. Transaction & Marketplace Data</h4>
              <ul>
                <li>Orders placed</li>
                <li>Orders fulfilled / cancelled</li>
                <li>Shipping information</li>
                <li>Proof of payment or refund</li>
                <li>Uploaded product images or documents</li>
                <li>Chat or inquiry messages exchanged through the platform</li>
              </ul>
              <h4>1.4. Third-Party Integrations (Optional)</h4>
              <ul>
                <li>Payment verification status</li>
                <li>Tracking numbers</li>
                <li>Shipping payment confirmation</li>
              </ul>
              <hr />
              <h3>2. How We Use Your Information</h3>
              <h4>2.1. Core Platform Features</h4>
              <ul>
                <li>Processing orders, payments, and refunds</li>
                <li>Creating and managing user accounts</li>
                <li>Facilitating communication between buyer and seller</li>
                <li>Displaying products, reviews, and store profiles</li>
              </ul>
              <h4>2.2. Safety & Fraud Prevention</h4>
              <ul>
                <li>Detecting suspicious activity</li>
                <li>Verifying sellers</li>
                <li>Monitoring abuse or policy violations</li>
                <li>Preventing unauthorized access</li>
              </ul>
              <h4>2.3. Customer Support</h4>
              <ul>
                <li>Answering inquiries</li>
                <li>Resolving disputes</li>
                <li>Verifying transactions or refunds</li>
              </ul>
              <h4>2.4. Platform Improvements</h4>
              <ul>
                <li>Debugging and performance analysis</li>
                <li>Enhancing features</li>
                <li>Personalizing user experience</li>
              </ul>
              <h4>2.5. Legal Compliance</h4>
              <ul>
                <li>Following the PH Data Privacy Act of 2012</li>
                <li>Responding to valid law enforcement requests</li>
              </ul>
              <hr />
              <h3>3. How We Share Your Information</h3>
              <ul>
                <li><strong>Buyers & Sellers:</strong> Name, Address, Contact, Order info</li>
                <li><strong>Service Providers:</strong> Payment processors, Logistics, Cloud services, Analytics tools</li>
                <li><strong>Legal Authorities:</strong> If legally required</li>
              </ul>
              <hr />
              <h3>4. Data Storage & Security</h3>
              <ul>
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secured cloud infrastructure</li>
                <li>Role-based access for admins</li>
                <li>Regular backups & monitoring</li>
              </ul>
              <hr />
              <h3>5. User Rights & Controls</h3>
              <ul>
                <li>Access, correct, delete your data</li>
                <li>Withdraw consent</li>
                <li>File complaints with NPC</li>
              </ul>
              <p>Contact: <strong>tahanancrafts.shop@gmail.com</strong></p>
              <hr />
              <h3>6. Cookies & Tracking</h3>
              <ul>
                <li>Remember login sessions</li>
                <li>Improve site performance</li>
                <li>Provide personalized experience</li>
              </ul>
              <p>You may disable cookies—but some features may not work properly.</p>
              <hr />
              <h3>7. Children’s Privacy</h3>
              <p>Accounts of minors without parental consent will be removed.</p>
              <hr />
              <h3>8. Data Breach Procedures</h3>
              <ol>
                <li>Secure the system immediately</li>
                <li>Investigate breach</li>
                <li>Notify affected users within 72 hours</li>
                <li>Coordinate with the National Privacy Commission</li>
              </ol>
              <hr />
              <h3>9. Changes to This Policy</h3>
              <p>Major changes communicated via email or dashboard. Continued use means accepting the updated policy.</p>
              <hr />
              <h3>10. Contact Information</h3>
              <p>📩 Email: tahanancrafts.shop@gmail.com</p>
              <p>📍 Address: Batangas, Philippines</p>
              <p>🌐 Website: www.tahanancrafts.shop</p>
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
export default PrivacyPolicy;
