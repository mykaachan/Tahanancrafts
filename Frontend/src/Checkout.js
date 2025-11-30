import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // incoming from Cart
  const cart_item_ids = location.state?.cart_item_ids || [];
  const items_frontend = location.state?.items_frontend || [];
  const artisan_id = location.state?.artisan_id;

  // core state
  const [selectedItems, setSelectedItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // address modals (kept same UI)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  // add form state (unchanged)
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

  // shipping / quotation state
  const [shippingFee, setShippingFee] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [tempDeliveryId, setTempDeliveryId] = useState(null);

  // payment options
  // sf_only (shipping fee only), partial (user inputs amount), full (pay everything)
  const [paymentOption, setPaymentOption] = useState("sf_only");
  const [partialAmount, setPartialAmount] = useState("");

  // ----------------------------
  // Load items_frontend (no backend re-fetch)
  // ----------------------------
  useEffect(() => {
    if (items_frontend && items_frontend.length > 0) {
      // ensure numbers are numbers
      const normalized = items_frontend.map((i) => ({
        ...i,
        quantity: Number(i.quantity || 1),
        unit_price: Number(i.unit_price ?? i.unit_price),
        total_price: Number(i.total_price ?? (i.unit_price * i.quantity)),
      }));
      setSelectedItems(normalized);
    }
  }, [items_frontend]);

  // ----------------------------
  // Load addresses (original logic preserved)
  // ----------------------------
  useEffect(() => {
    const loadAddrs = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
        );
        const data = await res.json();
        setAddresses(data || []);
        const def = (data && data.find((a) => a.is_default)) || (data && data[0]);
        setSelectedAddress(def || null);
      } catch (err) {
        console.error("Address load failed:", err);
      }
    };
    loadAddrs();
  }, [navigate]);

  // helper to refresh addresses and keep selection
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

  // Add address handlers (kept same API endpoints)
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

  // Edit address handlers
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
  // QUOTATION: call backend checkout-quotation
  // ----------------------------
  const fetchShippingFee = async () => {
    // need artisan_id (Cart ensures only one artisan in selection)
    if (!selectedAddress || selectedItems.length === 0 || !artisan_id) return;

    setLoadingFee(true);
    setShippingFee(null);
    setTempDeliveryId(null);

    try {
      const res = await fetch(
        "https://tahanancrafts.onrender.com/api/products/delivery/checkout-quotation/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipping_address_id: selectedAddress.id,
            artisan_id: artisan_id,
            user_id: localStorage.getItem("user_id"),
          }),
        }
      );
      const data = await res.json();
      console.log("Quotation Response:", data);

      // successful backend returns { quotation: {...}, temp_delivery_id: N }
      if (data && data.quotation && data.quotation.priceBreakdown) {
        const total = Number(data.quotation.priceBreakdown.total);
        setShippingFee(total);
        setTempDeliveryId(data.temp_delivery_id || null);
      } else {
        // show message but keep UI intact
        console.warn("Quotation returned without priceBreakdown:", data);
        alert("Failed to compute shipping fee");
      }
    } catch (err) {
      console.error("Failed to load shipping fee.", err);
      alert("Failed to load shipping fee.");
    } finally {
      setLoadingFee(false);
    }
  };

  // When selected address changes or selectedItems load, call shipping fee
  useEffect(() => {
    if (selectedAddress && selectedItems.length > 0) {
      fetchShippingFee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, selectedItems, artisan_id]);

  // ----------------------------
  // Payment / totals
  // ----------------------------
  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  );

  // validate partial amount not greater than subtotal
  const onPartialChange = (val) => {
    if (val === "") {
      setPartialAmount("");
      return;
    }
    const num = Number(val);
    if (Number.isNaN(num) || num < 0) return;
    // cannot exceed items subtotal
    if (num > itemsSubtotal) {
      setPartialAmount(String(itemsSubtotal));
    } else {
      setPartialAmount(String(num));
    }
  };

  let payNow = 0;
  let codAmount = 0;
  if (paymentOption === "sf_only") {
    payNow = (shippingFee || 0);
    codAmount = itemsSubtotal;
  } else if (paymentOption === "partial") {
    const partial = Number(partialAmount || 0);
    payNow = partial + (shippingFee || 0);
    codAmount = Math.max(0, itemsSubtotal - partial);
  } else if (paymentOption === "full") {
    payNow = itemsSubtotal + (shippingFee || 0);
    codAmount = 0;
  }

  // ----------------------------
  // PLACE ORDER: send checkout payload including delivery_id
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

    if (paymentOption === "partial" && Number(partialAmount || 0) > itemsSubtotal) {
      alert("Partial amount cannot exceed items subtotal.");
      return;
    }

    if (shippingFee === null) {
      alert("Shipping fee not loaded yet.");
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
            payment_option: paymentOption,
            partial_amount: Number(partialAmount || 0),
            pay_now: Number(payNow),
            cod_amount: Number(codAmount),
            delivery_id: tempDeliveryId, // may be null if quotation failed
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Checkout failed:", data);
        alert("Checkout failed. See console for details.");
        return;
      }

      // success
      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error("Failed to place order.", err);
      alert("Failed to place order.");
    }
  };

  // ----------------------------
  // RENDER (kept UI / modals and classes)
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
                    {selectedAddress.barangay}, {selectedAddress.city}{" "}
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
                <span className="unit-price">₱{item.unit_price}</span>
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
                <span>₱{itemsSubtotal}</span>
              </p>

              <p>
                <span>Shipping Fee:</span>
                <span>
                  {loadingFee ? "Calculating..." : shippingFee !== null ? `₱${shippingFee}` : "—"}
                </span>
              </p>

              <div className="payment-options" style={{ marginTop: "20px" }}>
                <h3>Payment Options</h3>

                <label>
                  <input
                    type="radio"
                    value="sf_only"
                    checked={paymentOption === "sf_only"}
                    onChange={() => setPaymentOption("sf_only")}
                  />
                  Pay Shipping Fee Only
                </label>

                <label>
                  <input
                    type="radio"
                    value="partial"
                    checked={paymentOption === "partial"}
                    onChange={() => setPaymentOption("partial")}
                  />
                  Partial Payment
                </label>

                {paymentOption === "partial" && (
                  <input
                    type="number"
                    className="partial-input"
                    placeholder="Enter partial amount"
                    value={partialAmount}
                    onChange={(e) => onPartialChange(e.target.value)}
                    min="0"
                    max={itemsSubtotal}
                  />
                )}

                <label>
                  <input
                    type="radio"
                    value="full"
                    checked={paymentOption === "full"}
                    onChange={() => setPaymentOption("full")}
                  />
                  Pay Full Amount
                </label>
              </div>

              <p className="total">
                <span>Total Pay Now:</span>
                <span>₱{Number(payNow || 0).toFixed(2)}</span>
              </p>

              <p className="cod-amount">
                <span>COD Remaining:</span>
                <span>₱{Number(codAmount || 0).toFixed(2)}</span>
              </p>
            </div>

            {/* QR */}
            <div style={{ marginTop: "25px", textAlign: "center" }}>
              <h3>Pay Shipping Fee</h3>
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

            <button className="btn-place-order" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>

        {/* ========== ADDRESS MODAL (Select) ========== */}
        {showAddressModal && (
          <div className="address-modal-backdrop" onClick={() => setShowAddressModal(false)}>
            <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Select Shipping Address</h2>
                <button className="modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
              </div>

              <div className="address-list">
                {addresses.length === 0 && <p>No addresses yet.</p>}

                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
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
                      {addr.is_default && <span className="default-tag">Default</span>}
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
                <button className="modal-add-btn" onClick={() => setShowAddModal(true)}>+ Add New Address</button>

                <button
                  className="modal-save-btn"
                  onClick={() => {
                    setShowAddressModal(false);
                    // re-fetch shipping fee immediately after closing with new addr
                    setTimeout(() => {
                      if (selectedAddress) fetchShippingFee();
                    }, 200);
                  }}
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== Add Address Modal ========= */}
        {showAddModal && (
          <div className="address-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Address</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
              </div>

              <div className="address-form-grid">
                <input name="full_name" placeholder="Full Name *" value={formAdd.full_name} onChange={handleAddChange} />
                <input name="phone" placeholder="Phone Number *" value={formAdd.phone} onChange={handleAddChange} />
                <input name="region" placeholder="Region *" value={formAdd.region} onChange={handleAddChange} />
                <input name="province" placeholder="Province *" value={formAdd.province} onChange={handleAddChange} />
                <input name="city" placeholder="City / Municipality *" value={formAdd.city} onChange={handleAddChange} />
                <input name="barangay" placeholder="Barangay *" value={formAdd.barangay} onChange={handleAddChange} />
                <input name="postal_code" placeholder="Postal Code *" value={formAdd.postal_code} onChange={handleAddChange} />
                <input name="street" placeholder="Street / House No (optional)" value={formAdd.street} onChange={handleAddChange} />
                <input name="landmark" placeholder="Landmark (optional)" value={formAdd.landmark} onChange={handleAddChange} />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="modal-save-btn" onClick={saveNewAddress}>Save Address</button>
                <button className="modal-cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== Edit Address Modal ========= */}
        {showEditModal && editAddressData && (
          <div className="address-modal-backdrop" onClick={() => setShowEditModal(false)}>
            <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Address</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>

              <div className="address-form-grid">
                <input name="full_name" placeholder="Full Name" value={editAddressData.full_name || ""} onChange={handleEditChange} />
                <input name="phone" placeholder="Phone Number" value={editAddressData.phone || ""} onChange={handleEditChange} />
                <input name="region" placeholder="Region" value={editAddressData.region || ""} onChange={handleEditChange} />
                <input name="province" placeholder="Province" value={editAddressData.province || ""} onChange={handleEditChange} />
                <input name="city" placeholder="City / Municipality" value={editAddressData.city || ""} onChange={handleEditChange} />
                <input name="barangay" placeholder="Barangay" value={editAddressData.barangay || ""} onChange={handleEditChange} />
                <input name="postal_code" placeholder="Postal Code" value={editAddressData.postal_code || ""} onChange={handleEditChange} />
                <input name="address" placeholder="Street / House No." value={editAddressData.address || ""} onChange={handleEditChange} />
                <input name="landmark" placeholder="Landmark (optional)" value={editAddressData.landmark || ""} onChange={handleEditChange} />

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Default Shipping Address
                  <label className="switch" style={{ marginLeft: 8 }}>
                    <input type="checkbox" name="is_default" checked={!!editAddressData.is_default} onChange={(e) => setEditAddressData({...editAddressData, is_default: e.target.checked})} />
                    <span className="slider" />
                  </label>
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn-danger" onClick={async () => { if (editAddressData.is_default) await setDefaultAddress(editAddressData.id); await deleteAddress(); }}>Delete Address</button>

                <button className="btn-secondary" onClick={async () => { if (editAddressData.is_default) await setDefaultAddress(editAddressData.id); await saveEditAddress(); }}>Save</button>

                <button className="modal-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeaderFooter>
  );
}

export default Checkout;
