// src/SelectShippingAddress.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import "./ShippingAddress.css";

export default function SelectShippingAddress() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/${userId}/`);
      const data = await res.json();
      setAddresses(data || []);
      const def = (data || []).find(a => a.is_default);
      if (def) setSelectedId(def.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAddress(id) {
    if (!window.confirm("Delete this address?")) return;
    const res = await fetch(`${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/delete/${id}/`, { method: "DELETE" });
    if (res.ok) setAddresses(addresses.filter(a => a.id !== id));
    else alert("Delete failed");
  }

  async function setDefault(addressId) {
    const res = await fetch(`${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/set-default/${addressId}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (res.ok) setAddresses(addresses.map(a => ({ ...a, is_default: a.id === addressId })));
    else alert("Failed to set default");
  }

  function continueToCheckout() {
    if (!selectedId) return alert("Please select a shipping address");
    navigate("/checkout", { state: { shipping_address_id: selectedId } });
  }

  return (
    <HeaderFooter>
      <div className="address-page-wrap">
        <div className="address-page-inner">
          <h1>Select Shipping Address</h1>

          <button className="btn-add" onClick={() => navigate("/add-address")}>+ Add address</button>

          {loading && <div className="address-loading">Loading addresses…</div>}

          {!loading && addresses.length === 0 && (
            <div className="no-address">You don’t have any saved addresses yet.</div>
          )}

          <div className="address-list">
            {addresses.map(addr => (
              <div key={addr.id} className={`address-row ${selectedId === addr.id ? "active" : ""}`}>
                <div className="address-left">
                  <label className="radio-wrap">
                    <input type="radio" checked={selectedId === addr.id} onChange={() => setSelectedId(addr.id)} />
                    <span />
                  </label>
                </div>

                <div className="address-main" onClick={() => setSelectedId(addr.id)}>
                  <div className="address-meta">
                    <div className="addr-name">{addr.full_name}</div>
                    <div className="addr-phone">{addr.phone}</div>
                  </div>
                  <div className="addr-text">{addr.address}, {addr.barangay}, {addr.city}, {addr.province}</div>

                  <div className="address-tags">
                    <span className="tag">{addr.landmark ? addr.landmark : "Home"}</span>
                    {addr.is_default && <span className="tag default">Default shipping address</span>}
                  </div>
                </div>

                <div className="address-actions">
                  <button className="link" onClick={() => navigate(`/edit-address/${addr.id}`)}>Edit</button>
                  <button className="link danger" onClick={() => deleteAddress(addr.id)}>Delete</button>
                  {!addr.is_default && <button className="link setdef" onClick={() => setDefault(addr.id)}>Set default</button>}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-actions">
            <button className="btn-continue" onClick={continueToCheckout}>Save & Continue</button>
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}
