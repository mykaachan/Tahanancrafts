import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ShippingAddress.css";

export default function ShippingAddressSelect() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`)
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data);
        setLoading(false);
      });
  }, []);

  const setAsDefault = async (id) => {
    await fetch(
      `https://tahanancrafts.onrender.com/api/users/shipping-address/${id}/set-default/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  };

  const goToAddNew = () => navigate("/add-address");

  return (
    <div className="address-selection-page">
      <h1>Select Shipping Address</h1>

      {loading && <p>Loading…</p>}

      {!loading &&
        addresses.map((addr) => (
          <div
            key={addr.id}
            className={`address-card ${addr.is_default ? "selected" : ""}`}
            onClick={() => setAsDefault(addr.id)}
          >
            <p className="name">{addr.full_name} — {addr.phone}</p>
            <p className="address-text">
              {addr.address}, {addr.barangay}, {addr.city}, {addr.province}
            </p>
            <p className="small">{addr.region}, {addr.postal_code}</p>

            {addr.is_default && <span className="badge">Default</span>}
          </div>
        ))}

      <button className="add-new-btn" onClick={goToAddNew}>+ Add New Address</button>
      <button
        className="continue-btn"
        onClick={() => navigate("/checkout")}
        disabled={!addresses.some((a) => a.is_default)}
      >
        Continue to Checkout
      </button>
    </div>
  );
}
