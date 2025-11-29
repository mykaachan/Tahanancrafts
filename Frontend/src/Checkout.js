import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const cart_item_ids = location.state?.cart_item_ids || [];
  const items_frontend = location.state?.items_frontend || [];
  const [selectedItems, setSelectedItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [tempDeliveryId, setTempDeliveryId] = useState(null);
  const [paymentMode, setPaymentMode] = useState("shipping_only"); // shipping_only | shipping_plus_partial | pay_all
  const [partialAmount, setPartialAmount] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);
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

  // -------------------------
  // Load selected backend items
  // -------------------------
  useEffect(() => {
    const loadSelectedItems = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/products/cart/carts/${userId}/`
        );
        const allItems = await res.json();

        const backendFiltered = allItems.filter((i) =>
          cart_item_ids.includes(i.id)
        );

        // Merge frontend + backend
        const merged = backendFiltered.map((bItem) => {
          const match = items_frontend.find((f) => f.id === bItem.id);

          return {
            ...bItem,
            img: match?.img || null,
            frontend_name: match?.name,
            frontend_unit_price: match?.unit_price,
          };
        });

        setSelectedItems(merged);
      } catch (err) {
        console.error("Error fetching selected items:", err);
      }
    };

    if (cart_item_ids.length > 0) loadSelectedItems();
  }, [cart_item_ids, items_frontend]);

  
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


  useEffect(() => {
    const loadShippingFee = async () => {
      if (!selectedAddress) return;
      if (!selectedItems || selectedItems.length === 0) return;

      // Expecting backend cart items to include product.artisan_id
      const firstItem = selectedItems[0];
      const firstArtisanId =
        firstItem?.product?.artisan_id || firstItem?.product?.artisan || null;

      if (!firstArtisanId) {
        console.warn("No artisan id found in selected items; cannot request quotation.");
        return;
      }

      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/products/delivery/checkout-quotation/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shipping_address_id: selectedAddress.id,
              artisan_id: firstArtisanId,
            }),
          }
        );

        // If unauthorized or server error, handle gracefully
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("Quotation request failed", res.status, err);
          return;
        }

        const data = await res.json();

        // store returned values
        const total = Number(data?.quotation?.priceBreakdown?.total || 0);
        setShippingFee(total);

        if (data?.temp_delivery_id) {
          setTempDeliveryId(data.temp_delivery_id);
          localStorage.setItem("temp_delivery_id", data.temp_delivery_id);
        }
      } catch (err) {
        console.error("Failed loading quotation:", err);
      }
    };

    loadShippingFee();
  }, [selectedAddress, selectedItems]);

  // -------------------------
  // Derived summary values
  // -------------------------
  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.total_price || item.price * item.quantity || 0),
    0
  );

  const hasPreorder = selectedItems.some((i) => i.is_preorder === true);

  // Calculate amounts based on paymentMode and preorder rules
  const computePayments = () => {
    let payNow = 0;
    let codAmount = 0;

    const partial = Number(partialAmount || 0);

    if (paymentMode === "shipping_only") {
      payNow = Number(shippingFee);
      codAmount = Number(itemsSubtotal);
    } else if (paymentMode === "shipping_plus_partial") {
      payNow = Number(shippingFee) + partial;
      codAmount = Number(itemsSubtotal) - partial;
    } else if (paymentMode === "pay_all") {
      payNow = Number(shippingFee) + Number(itemsSubtotal);
      codAmount = 0;
    }

    // Preorder rule: minimum 50% of items total must be paid now (if any preorder exists)
    if (hasPreorder) {
      const minDown = Number(itemsSubtotal) * 0.5;
      // If paying shipping_only, we should force payNow = shipping + minDown
      if (paymentMode === "shipping_only") {
        payNow = Number(shippingFee) + minDown;
        codAmount = Number(itemsSubtotal) - minDown;
      }
      // If shipping_plus_partial, ensure partial >= minDown
      if (paymentMode === "shipping_plus_partial") {
        const effectivePartial = Math.max(partial, minDown);
        payNow = Number(shippingFee) + effectivePartial;
        codAmount = Number(itemsSubtotal) - effectivePartial;
      }
    }

    // sanitize
    payNow = Math.max(0, Number(payNow.toFixed(2)));
    codAmount = Math.max(0, Number(codAmount.toFixed(2)));

    return { payNow, codAmount };
  };

  const { payNow, codAmount } = computePayments();

  // -------------------------
  // Place Order (submit checkout)
  // -------------------------
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      alert("Please log in to place order.");
      return;
    }

    if (!selectedAddress) {
      alert("Select a shipping address first.");
      return;
    }

    if (!tempDeliveryId) {
      alert("Shipping fee hasn't been loaded yet. Try again in a moment.");
      return;
    }

    if (hasPreorder && paymentMode === "shipping_plus_partial") {
      const minDown = itemsSubtotal * 0.5;
      if (Number(partialAmount) < minDown) {
        if (!window.confirm(`Preorder items require at least 50% downpayment (₱${minDown}). Proceed with your smaller partial?`)) {
          return;
        }
      }
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
            temp_delivery_id: tempDeliveryId,
            payment_mode: paymentMode,
            partial_amount: Number(partialAmount || 0)
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "unknown" }));
        console.error("Checkout failed", res.status, err);
        alert("Checkout failed: " + (err.detail || JSON.stringify(err)));
        return;
      }

      // success
      const data = await res.json();
      // redirect to purchases (to-pay)
      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error("Failed to place order.", err);
      alert("Failed to place order.");
    }
  };

  // -------------------------
  // Address handlers (Add/Edit/Delete/SetDefault)
  // -------------------------
  const handleAddChange = (e) =>
    setFormAdd({ ...formAdd, [e.target.name]: e.target.value });

  const saveNewAddress = async () => {
    const user_id = localStorage.getItem("user_id");

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

  // -------------------------
  // Render
  // -------------------------
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
                    item.img ||
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
                <span>₱{itemsSubtotal.toFixed(2)}</span>
              </p>

              <p>
                <span>Shipping Fee:</span>
                <span>
                  ₱{Number(shippingFee || 0).toFixed(2)}{" "}
                  {!selectedAddress?.shipping_fee && (
                    <span style={{ color: "#a67c52", fontSize: "13px" }}>
                      (calculated)
                    </span>
                  )}
                </span>
              </p>

              {/* Payment Modes */}
              <h3 style={{ marginTop: "15px" }}>Payment Options</h3>

              <label style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  checked={paymentMode === "shipping_only"}
                  onChange={() => setPaymentMode("shipping_only")}
                />{" "}
                Pay Shipping Fee Only
              </label>

              <label style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  checked={paymentMode === "shipping_plus_partial"}
                  onChange={() => setPaymentMode("shipping_plus_partial")}
                />{" "}
                Pay Shipping + Partial Amount
              </label>

              {paymentMode === "shipping_plus_partial" && (
                <input
                  type="number"
                  placeholder="Enter partial amount"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="partial-input"
                />
              )}

              <label style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  checked={paymentMode === "pay_all"}
                  onChange={() => setPaymentMode("pay_all")}
                />{" "}
                Pay Shipping + FULL (Items + SF)
              </label>

              {hasPreorder && (
                <p style={{ fontSize: "13px", color: "red" }}>
                  Preorder item(s) detected — minimum 50% downpayment required.
                </p>
              )}

              <hr />

              <p>
                <span>Amount to Pay Now:</span>
                <span>₱{payNow.toFixed(2)}</span>
              </p>

              <p className="cod-amount" style={{ marginTop: "10px" }}>
                <span>COD Remaining Balance:</span>
                <span>₱{codAmount.toFixed(2)}</span>
              </p>
            </div>

            {/* PAYMENT QR */}
            <div style={{ marginTop: "25px", textAlign: "center" }}>
              <h3>
                Pay Shipping Fee {hasPreorder ? " + downpayment (if applicable)" : ""}
              </h3>

              {selectedItems[0]?.artisan_qr ? (
                <img
                  src={selectedItems[0].artisan_qr}
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

            <div className="address-list" style={{ maxHeight: 420, overflowY: "auto" }}>
              {addresses.length === 0 && <p>No addresses yet.</p>}

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                  onClick={() => setSelectedAddress(addr)}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 10,
                    borderBottom: "1px solid #eee",
                    alignItems: "center"
                  }}
                >
                  <div className="radio-col">
                    <input
                      type="radio"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                    />
                  </div>

                  <div className="address-col" style={{ flex: 1 }}>
                    <strong className="name">{addr.full_name}</strong>
                    <span className="phone" style={{ marginLeft: 8 }}>{addr.phone}</span>

                    <div className="full-address" style={{ marginTop: 6 }}>
                      {addr.address && <>{addr.address}, </>}
                      {addr.barangay}, {addr.city}, {addr.province}
                    </div>

                    {addr.is_default && (
                      <span className="default-tag" style={{ marginTop: 6, display: "inline-block", background: "#f3e9df", padding: "2px 6px", borderRadius: 6 }}>
                        Default
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(addr);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="set-default-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await setDefaultAddress(addr.id);
                      }}
                    >
                      Set Default
                    </button>
                  </div>
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

            <div className="address-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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

            <div className="address-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
