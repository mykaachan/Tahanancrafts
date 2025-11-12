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

          <button type="submit" className="submit-btn">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

// SellerRegister.js
export default SellerRegister; // ✅ default export

