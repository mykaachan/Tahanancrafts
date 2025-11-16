import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ShippingAddress.css";

export default function AddAddress() {
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    postal_code: "",
    street: "",
    landmark: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    if (!form.full_name || !form.phone || !form.region || !form.province || !form.city || !form.barangay || !form.postal_code) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      user_id,
      full_name: form.full_name,
      phone: form.phone,
      region: form.region,
      province: form.province,
      city: form.city,
      barangay: form.barangay,
      postal_code: form.postal_code,
      address: form.street,
      landmark: form.landmark,
    };

    const res = await fetch(
      "https://tahanancrafts.onrender.com/api/users/shipping-address/create/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      navigate("/select-address");
    } else {
      alert("Failed to save address");
    }
  };

  return (
    <div className="address-form-page">
      <div className="address-card">
        <h2>Add New Address</h2>

        <div className="form-grid">

          {/* Recipient */}
          <input
            name="full_name"
            placeholder="Full Name *"
            value={form.full_name}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
          />

          {/* Location */}
          <input
            name="region"
            placeholder="Region *"
            value={form.region}
            onChange={handleChange}
          />

          <input
            name="province"
            placeholder="Province *"
            value={form.province}
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City / Municipality *"
            value={form.city}
            onChange={handleChange}
          />

          <input
            name="barangay"
            placeholder="Barangay *"
            value={form.barangay}
            onChange={handleChange}
          />

          <input
            name="postal_code"
            placeholder="Postal Code *"
            value={form.postal_code}
            onChange={handleChange}
          />

          <input
            name="street"
            placeholder="Street / House No (optional)"
            value={form.street}
            onChange={handleChange}
          />

          <input
            name="landmark"
            placeholder="Landmark (optional)"
            value={form.landmark}
            onChange={handleChange}
          />
        </div>

        <div className="address-buttons">
          <button className="save-btn" onClick={saveAddress}>
            Save Address
          </button>
          <button className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
