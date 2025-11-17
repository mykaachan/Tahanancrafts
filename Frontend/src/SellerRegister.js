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
            <h3>Terms and Conditions for Sellers</h3>
            <ol>
              <li><strong>Shipping Fees</strong></li>
              <p>Some orders require prepaid shipping fee for the seller’s protection.</p>
              <p>If the seller accepts the order, the shipping fee becomes non-refundable.</p>
              <p>If the seller cancels the order after shipping fee collection, the seller must fully refund the shipping fee to the buyer.</p>
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
            <h3>Privacy Policy</h3>
            <p>We value your privacy and are committed to protecting your
                    personal data while using TahananCrafts. By continuing to
                    use our services, you agree to our Terms and Policies.</p>
            
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
