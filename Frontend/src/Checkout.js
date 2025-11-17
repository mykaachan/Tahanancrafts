import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Received from Cart.js: array of selected cart row IDs
  const cart_item_ids = location.state?.cart_item_ids || [];

  // items loaded from backend based on cart_item_ids
  const [selectedItems, setSelectedItems] = useState([]);

  // ----------------------------
  // Address State (unchanged UI)
  // ----------------------------
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Select Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Add / Edit modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  // Add form state
  const [formAdd, setFormAdd] = useState({
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

  // ----------------------------
  // Load selected cart items from backend
  // ----------------------------
  useEffect(() => {
    const loadSelectedItems = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/products/cart/carts/${userId}/`
        );
        const allItems = await res.json();

        // keep only those items whose cart row id is in cart_item_ids
        const filtered = Array.isArray(allItems)
          ? allItems.filter((it) => cart_item_ids.includes(it.id))
          : [];

        setSelectedItems(filtered);
      } catch (err) {
        console.error("Failed to fetch selected items:", err);
      }
    };

    // Only attempt to load when we actually have ids
    if (cart_item_ids && cart_item_ids.length > 0) {
      loadSelectedItems();
    } else {
      // no ids -> nothing selected
      setSelectedItems([]);
    }
  }, [cart_item_ids]);

  // ----------------------------
  // Load addresses on mount (keeps your address UI)
  // ----------------------------
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    (async function loadAddrs() {
      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
        );
        const data = await res.json();
        setAddresses(data || []);
        const def = (data && data.find((a) => a.is_default)) || (data && data[0]);
        setSelectedAddress(def || null);
      } catch (err) {
        console.error("Failed loading addresses", err);
      }
    })();
  }, [navigate]);

  // ----------------------------
  // Helper: refresh addresses
  // ----------------------------
  const refreshAddresses = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const res = await fetch(
        `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
      );
      const data = await res.json();
      setAddresses(data || []);
      const def = (data && data.find((a) => a.is_default)) || (data && data[0]);

      if (selectedAddress) {
        const still = data && data.find((a) => a.id === selectedAddress.id);
        setSelectedAddress(still || def || null);
      } else {
        setSelectedAddress(def || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------
  // Place Order
  // ----------------------------
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");

    if (!selectedAddress) {
      alert("Select a shipping address first.");
      return;
    }

    if (!cart_item_ids || cart_item_ids.length === 0) {
      alert("No items selected for checkout.");
      return;
    }

    try {
      const res = await fetch(
        "https://tahanancrafts.onrender.com/api/products/product/checkout/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: Number(userId),
            cart_item_ids,
            shipping_address_id: selectedAddress.id,
          }),
        }
      );

      const data = await res.json();
      // navigate to purchases page, to-pay tab
      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  // ----------------------------
  // Add Address handlers (same as your previous handlers)
  // ----------------------------
  const handleAddChange = (e) =>
    setFormAdd({ ...formAdd, [e.target.name]: e.target.value });

  const saveNewAddress = async () => {
    const user_id = localStorage.getItem("user_id");

    // validation: required fields
    if (
      !formAdd.full_name ||
      !formAdd.phone ||
      !formAdd.region ||
      !formAdd.province ||
      !formAdd.city ||
      !formAdd.barangay ||
      !formAdd.postal_code
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://tahanancrafts.onrender.com/api/users/shipping-address/create/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            full_name: formAdd.full_name,
            phone: formAdd.phone,
            region: formAdd.region,
            province: formAdd.province,
            city: formAdd.city,
            barangay: formAdd.barangay,
            postal_code: formAdd.postal_code,
            address: formAdd.street,
            landmark: formAdd.landmark,
          }),
        }
      );

      if (res.ok) {
        setShowAddModal(false);
        setFormAdd({
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
        await refreshAddresses();
      } else {
        const errText = await res.text();
        console.error("Add address failed:", errText);
        alert("Failed to save address");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save address");
    }
  };

  // ----------------------------
  // Edit Address handlers
  // ----------------------------
  const openEditModal = (addr) => {
    setEditAddressData({ ...addr });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAddressData({
      ...editAddressData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveEditAddress = async () => {
    if (!editAddressData) return;

    try {
      const res = await fetch(
        `https://tahanancrafts.onrender.com/api/users/shipping-address/update/${editAddressData.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editAddressData),
        }
      );
      if (res.ok) {
        setShowEditModal(false);
        await refreshAddresses();
      } else {
        const txt = await res.text();
        console.error("Edit failed:", txt);
        alert("Failed to update address");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update address");
    }
  };

  const deleteAddress = async () => {
    if (!editAddressData) return;
    if (!window.confirm("Delete this address?")) return;

    try {
      const res = await fetch(
        `https://tahanancrafts.onrender.com/api/users/shipping-address/delete/${editAddressData.id}/`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setShowEditModal(false);
        await refreshAddresses();
      } else {
        alert("Failed to delete address");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete address");
    }
  };

  const setDefaultAddress = async (idToSet) => {
    const userId = localStorage.getItem("user_id");

    try {
      const res = await fetch(
        `https://tahanancrafts.onrender.com/api/users/shipping-address/set-default/${idToSet}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (res.ok) {
        await refreshAddresses();
      } else {
        alert("Failed to set default address");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to set default address");
    }
  };

  // ----------------------------
  // Derived summary values (using returned backend fields)
  // ----------------------------
  const SHIPPING_PLACEHOLDER = 58;

  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.total_price || item.price * item.quantity || 0),
    0
  );

  const shippingFee = selectedAddress?.shipping_fee
    ? Number(selectedAddress.shipping_fee)
    : SHIPPING_PLACEHOLDER;

  // downpayment logic preserved if you add it; currently rely on backend flags if needed.
  const hasPreorder = selectedItems.some((i) => i.is_preorder === true);
  const downpaymentAmount = hasPreorder ? itemsSubtotal * 0.5 : 0;
  const totalPayNow = shippingFee + downpaymentAmount;
  const codAmount = itemsSubtotal - downpaymentAmount;

  const summary = {
    total_items_amount: itemsSubtotal,
    shipping_fee: shippingFee,
    downpayment_required: hasPreorder,
    downpayment_amount: downpaymentAmount,
    total_pay_now: totalPayNow,
    cod_amount: codAmount,
    // pick first artisan qr for display (you said same QR used)
    qr_code: selectedItems[0]?.artisan_qr || null,
  };

  // ----------------------------
  // Render (shipping/address UI preserved exactly)
  // ----------------------------
  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* Address */}
        <div className="address-bar">
          <div className="address-info">
            <span className="address-icon">📍</span>
            <div>
              {selectedAddress ? (
                <>
                  <p className="address-title">
                    {selectedAddress.barangay}, {selectedAddress.city},{" "}
                    {selectedAddress.province}
                  </p>
                  <p className="address-details">
                    {selectedAddress.full_name} ({selectedAddress.phone}) <br />
                    {selectedAddress.address}
                  </p>
                </>
              ) : (
                <p>No address found. Add one.</p>
              )}
            </div>
          </div>

          <button
            className="change-btn"
            onClick={() => setShowAddressModal(true)}
          >
            Change
          </button>
        </div>

        <div className="checkout-container">
          {/* Items */}
          <div className="checkout-details">
            <h2>Products Ordered</h2>

            <div className="product-header">
              <span>Unit Price</span>
              <span>Quantity</span>
              <span>Item Subtotal</span>
            </div>

            {selectedItems.map((item) => (
              <div className="product-item" key={item.id}>
                <img
                  src={
                    item.main_image ||
                    (item.product_main_image && item.product_main_image) ||
                    "https://via.placeholder.com/150?text=No+Image"
                  }
                  alt={item.product_name}
                  className="product-img"
                />
                <div className="product-details">
                  <p className="product-name">{item.product_name}</p>
                  <p className="artisan-name">By: {item.artisan_name}</p>
                </div>
                <span className="unit-price">₱{item.price}</span>
                <span className="quantity">{item.quantity}</span>
                <span className="subtotal">₱{item.total_price}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="summary-details">
              <p>
                <span>Items Subtotal:</span>
                <span>₱{summary.total_items_amount}</span>
              </p>

              <p>
                <span>Shipping Fee:</span>
                <span>
                  ₱{summary.shipping_fee}{" "}
                  {!selectedAddress?.shipping_fee && (
                    <span style={{ color: "#a67c52", fontSize: "13px" }}>
                      (placeholder)
                    </span>
                  )}
                </span>
              </p>

              {summary.downpayment_required && (
                <p>
                  <span>Downpayment (50%):</span>
                  <span>₱{summary.downpayment_amount}</span>
                </p>
              )}

              <p className="total">
                <span>Total:</span>
                <span>₱{summary.total_items_amount + summary.shipping_fee}</span>
              </p>

              <p className="cod-amount" style={{ marginTop: "10px" }}>
                <span>COD Remaining Balance:</span>
                <span>₱{summary.cod_amount}</span>
              </p>
            </div>

            {/* PAYMENT QR */}
            <div style={{ marginTop: "25px", textAlign: "center" }}>
              <h3>
                Pay Shipping Fee {summary.downpayment_required && " + Downpayment"}
              </h3>

              {summary.qr_code ? (
                <img
                  src={summary.qr_code}
                  alt="Payment QR"
                  style={{
                    width: "200px",
                    borderRadius: "12px",
                    marginTop: "10px",
                  }}
                />
              ) : (
                <p style={{ fontSize: "13px", color: "#999" }}>
                  No QR uploaded by seller
                </p>
              )}

              <p style={{ marginTop: "8px", fontSize: "13px", color: "#555" }}>
                Scan the QR to pay. After payment, upload proof in your Orders page.
              </p>
            </div>

            {/* Payment Method */}
            <h2 style={{ marginTop: "20px" }}>Payment Method</h2>
            <p className="payment-method">Cash on Delivery</p>

            <button className="btn-place-order" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* ========== Address Modal (Select) ========== */}
      {showAddressModal && (
        <div className="address-modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div
            className="address-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Select Shipping Address</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="address-list">
              {addresses.length === 0 && <p>No addresses yet.</p>}

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card ${
                    selectedAddress?.id === addr.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <div className="radio-col">
                    <input
                      type="radio"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                    />
                  </div>

                  <div className="address-col">
                    <strong className="name">{addr.full_name}</strong>
                    <span className="phone">{addr.phone}</span>

                    <div className="full-address">
                      {addr.address && <>{addr.address}, </>}
                      {addr.barangay}, {addr.city}, {addr.province}
                    </div>

                    {addr.is_default && (
                      <span className="default-tag">Default</span>
                    )}
                  </div>

                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(addr);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="modal-add-btn"
                onClick={() => {
                  setShowAddModal(true);
                }}
              >
                + Add New Address
              </button>

              <button
                className="modal-save-btn"
                onClick={() => {
                  setShowAddressModal(false);
                }}
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Add Address Modal ========== */}
      {showAddModal && (
        <div className="address-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="address-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add New Address</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="address-form-grid">
              <input
                name="full_name"
                placeholder="Full Name *"
                value={formAdd.full_name}
                onChange={handleAddChange}
              />
              <input
                name="phone"
                placeholder="Phone Number *"
                value={formAdd.phone}
                onChange={handleAddChange}
              />
              <input
                name="region"
                placeholder="Region *"
                value={formAdd.region}
                onChange={handleAddChange}
              />
              <input
                name="province"
                placeholder="Province *"
                value={formAdd.province}
                onChange={handleAddChange}
              />
              <input
                name="city"
                placeholder="City / Municipality *"
                value={formAdd.city}
                onChange={handleAddChange}
              />
              <input
                name="barangay"
                placeholder="Barangay *"
                value={formAdd.barangay}
                onChange={handleAddChange}
              />
              <input
                name="postal_code"
                placeholder="Postal Code *"
                value={formAdd.postal_code}
                onChange={handleAddChange}
              />
              <input
                name="street"
                placeholder="Street / House No (optional)"
                value={formAdd.street}
                onChange={handleAddChange}
              />
              <input
                name="landmark"
                placeholder="Landmark (optional)"
                value={formAdd.landmark}
                onChange={handleAddChange}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="modal-save-btn" onClick={saveNewAddress}>
                Save Address
              </button>
              <button
                className="modal-cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Edit Address Modal ========== */}
      {showEditModal && editAddressData && (
        <div className="address-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="address-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Address</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="address-form-grid">
              <input
                name="full_name"
                placeholder="Full Name"
                value={editAddressData.full_name || ""}
                onChange={handleEditChange}
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={editAddressData.phone || ""}
                onChange={handleEditChange}
              />
              <input
                name="region"
                placeholder="Region"
                value={editAddressData.region || ""}
                onChange={handleEditChange}
              />
              <input
                name="province"
                placeholder="Province"
                value={editAddressData.province || ""}
                onChange={handleEditChange}
              />
              <input
                name="city"
                placeholder="City / Municipality"
                value={editAddressData.city || ""}
                onChange={handleEditChange}
              />
              <input
                name="barangay"
                placeholder="Barangay"
                value={editAddressData.barangay || ""}
                onChange={handleEditChange}
              />
              <input
                name="postal_code"
                placeholder="Postal Code"
                value={editAddressData.postal_code || ""}
                onChange={handleEditChange}
              />
              <input
                name="address"
                placeholder="Street / House No."
                value={editAddressData.address || ""}
                onChange={handleEditChange}
              />
              <input
                name="landmark"
                placeholder="Landmark (optional)"
                value={editAddressData.landmark || ""}
                onChange={handleEditChange}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Default Shipping Address
                <label className="switch" style={{ marginLeft: 8 }}>
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={!!editAddressData.is_default}
                    onChange={(e) =>
                      setEditAddressData({
                        ...editAddressData,
                        is_default: e.target.checked,
                      })
                    }
                  />
                  <span className="slider" />
                </label>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn-danger"
                onClick={async () => {
                  if (editAddressData.is_default) {
                    await setDefaultAddress(editAddressData.id);
                  }
                  await deleteAddress();
                }}
              >
                Delete Address
              </button>

              <button
                className="btn-secondary"
                onClick={async () => {
                  if (editAddressData.is_default) {
                    await setDefaultAddress(editAddressData.id);
                  }
                  await saveEditAddress();
                }}
              >
                Save
              </button>

              <button
                className="modal-cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </HeaderFooter>
  );
}

export default Checkout;
