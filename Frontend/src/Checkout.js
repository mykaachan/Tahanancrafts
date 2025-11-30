// Checkout.js
import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Received from Cart.js: array of selected cart row IDs
  const cart_item_ids = location.state?.cart_item_ids || [];
  const items_frontend = location.state?.items_frontend || []; 
  // prefer artisan_id from location, fallback to first frontend item
  const artisan_id_from_state = location.state?.artisan_id || null;

  // items loaded from backend based on cart_item_ids (or from frontend)
  const [selectedItems, setSelectedItems] = useState([]);

  // Address State (complete UI)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Address modals & edit form state
  const [showAddressModal, setShowAddressModal] = useState(false);
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

  // shipping / lalamove details
  const [shippingFee, setShippingFee] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [tempDeliveryId, setTempDeliveryId] = useState(null);

  // payment options
  const [paymentOption, setPaymentOption] = useState("sf_only"); // sf_only, partial, full
  const [partialAmount, setPartialAmount] = useState("");

  // convenience: resolved artisan id
  const [resolvedArtisanId, setResolvedArtisanId] = useState(artisan_id_from_state);

  // -------------------------
  // Load selected items (merge backend/frontend as needed)
  // If you want to fetch from backend by cart ids, uncomment the fetch call.
  // Here we accept items_frontend as source of truth (Cart.js passes it).
  // -------------------------
  useEffect(() => {
    if (items_frontend && items_frontend.length > 0) {
      setSelectedItems(items_frontend);
      // set artisan id fallback
      if (!artisan_id_from_state && items_frontend[0]?.artisan_id) {
        setResolvedArtisanId(items_frontend[0].artisan_id);
      } else {
        setResolvedArtisanId(artisan_id_from_state || items_frontend[0]?.artisan_id);
      }
    } else {
      // no frontend items provided — try to load from backend using cart_item_ids
      // (this was the old behavior; optional)
      const loadFromBackend = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;
        try {
          const res = await fetch(`https://tahanancrafts.onrender.com/api/products/cart/carts/${userId}/`);
          const allItems = await res.json();
          // flatten grouped response into individual items and filter by cart_item_ids
          let flat = [];
          allItems.forEach(g => {
            (g.items || []).forEach(item => {
              flat.push({
                id: item.id,
                product_id: item.product.id,
                product_name: item.product.name,
                main_image: item.product.main_image,
                price: Number(item.product.price),
                quantity: Number(item.quantity),
                total_price: Number(item.total_price),
                artisan_id: g.artisan_id,
                artisan_name: g.artisan_name,
                artisan_qr: g.artisan_qr,
              });
            });
          });
          const backendFiltered = flat.filter(i => cart_item_ids.includes(i.id));
          setSelectedItems(backendFiltered);
          if (!resolvedArtisanId && backendFiltered[0]) setResolvedArtisanId(backendFiltered[0].artisan_id);
        } catch (err) {
          console.error("Failed to load cart items fallback:", err);
        }
      };
      if (cart_item_ids && cart_item_ids.length > 0) loadFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items_frontend, cart_item_ids]);

  // -------------------------
  // Load addresses on mount (keeps your address UI)
  // -------------------------
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    (async function loadAddrs() {
      try {
        const res = await fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`);
        const data = await res.json();
        setAddresses(data || []);
        const def = (data && data.find((a) => a.is_default)) || (data && data[0]);
        setSelectedAddress(def || null);
      } catch (err) {
        console.error("Failed loading addresses", err);
      }
    })();
  }, [navigate]);

  // Helper: refresh addresses and keep selection if possible
  const refreshAddresses = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const res = await fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`);
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
      console.error("refreshAddresses failed", err);
    }
  };

  // -------------------------
  // Address add / edit / delete / set default handlers
  // -------------------------
  const handleAddChange = (e) => {
    setFormAdd({ ...formAdd, [e.target.name]: e.target.value });
  };

  const saveNewAddress = async () => {
    const user_id = localStorage.getItem("user_id");
    // validation: required fields
    if (!formAdd.full_name || !formAdd.phone || !formAdd.region || !formAdd.province || !formAdd.city || !formAdd.barangay || !formAdd.postal_code) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      const res = await fetch("https://tahanancrafts.onrender.com/api/users/shipping-address/create/", {
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
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormAdd({
          full_name: "", phone: "", region: "", province: "", city: "", barangay: "", postal_code: "", street: "", landmark: ""
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
      const res = await fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/update/${editAddressData.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAddressData),
      });
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
      const res = await fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/delete/${editAddressData.id}/`, {
        method: "DELETE"
      });
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
      const res = await fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/set-default/${idToSet}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
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
  // FETCH SHIPPING FEE from checkout-quotation endpoint
  // requires shipping_address_id and artisan_id
  // -------------------------
  const fetchShippingFee = async () => {
    if (!selectedAddress || selectedItems.length === 0) return;
    const artisanId = resolvedArtisanId || (selectedItems[0] && selectedItems[0].artisan_id);
    if (!artisanId) {
      console.warn("No artisan_id found for quotation");
      return;
    }

    setLoadingFee(true);
    try {
      const res = await fetch("https://tahanancrafts.onrender.com/api/products/delivery/checkout-quotation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address_id: selectedAddress.id,
          artisan_id: artisanId,
          user_id: localStorage.getItem("user_id"),
        })
      });

      // If backend returns non-JSON or error, handle accordingly
      const data = await res.json();
      if (!res.ok) {
        console.error("Quotation API returned error:", data);
        alert("Failed to compute shipping fee");
        setShippingFee(null);
        setTempDeliveryId(null);
        setLoadingFee(false);
        return;
      }

      // success -> parse
      const quotation = data.quotation || data.data || null;
      if (quotation && (quotation.priceBreakdown?.total || quotation.priceBreakdown?.total)) {
        // price path might be either quotation.priceBreakdown.total or data.priceBreakdown.total
        const total = quotation.priceBreakdown?.total || quotation.priceBreakdown?.total;
        setShippingFee(Number(total));
        setTempDeliveryId(data.temp_delivery_id || data.temp_delivery_id || null);
      } else if (quotation && quotation.priceBreakdown && quotation.priceBreakdown.total) {
        setShippingFee(Number(quotation.priceBreakdown.total));
        setTempDeliveryId(data.temp_delivery_id || null);
      } else {
        console.error("Quotation missing price:", data);
        alert("Failed to compute shipping fee");
        setShippingFee(null);
        setTempDeliveryId(null);
      }
    } catch (err) {
      console.error("fetchShippingFee error:", err);
      alert("Failed to load shipping fee.");
      setShippingFee(null);
      setTempDeliveryId(null);
    } finally {
      setLoadingFee(false);
    }
  };

  // Trigger fee calculation when address or items change
  useEffect(() => {
    if (selectedAddress && selectedItems.length > 0) {
      fetchShippingFee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, selectedItems, resolvedArtisanId]);

  // -------------------------
  // Payment logic
  // -------------------------
  const itemsSubtotal = selectedItems.reduce((sum, item) => sum + Number(item.total_price || item.price * item.quantity || 0), 0);
  const hasPreorder = selectedItems.some(i => i.is_preorder === true);
  const preorderDownpayment = hasPreorder ? itemsSubtotal * 0.5 : 0;

  // computed amounts
  let payNow = 0;
  let codAmount = 0;

  if (paymentOption === "sf_only") {
    // If preorder: customer must pay 50% + SF
    if (hasPreorder) {
      payNow = preorderDownpayment + (shippingFee || 0);
      codAmount = itemsSubtotal - preorderDownpayment;
    } else {
      payNow = (shippingFee || 0);
      codAmount = itemsSubtotal;
    }
  } else if (paymentOption === "partial") {
    let partial = Number(partialAmount || 0);
    if (partial > itemsSubtotal) partial = itemsSubtotal;
    // If preorder: partial replaced by required downpayment minimum
    if (hasPreorder && partial < preorderDownpayment) {
      // force partial to at least preorderDownpayment
      partial = preorderDownpayment;
    }
    payNow = partial + (shippingFee || 0);
    codAmount = itemsSubtotal - partial;
  } else if (paymentOption === "full") {
    payNow = itemsSubtotal + (shippingFee || 0);
    codAmount = 0;
  }

  // -------------------------
  // Place order
  // -------------------------
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

    // shipping fee required (your earlier logic insisted)
    if (shippingFee === null || shippingFee === undefined) {
      alert("Shipping fee not loaded yet.");
      return;
    }

    // partial validation: partial cannot exceed itemsSubtotal
    if (paymentOption === "partial") {
      const p = Number(partialAmount || 0);
      if (p <= 0) {
        alert("Partial amount must be > 0.");
        return;
      }
      if (p > itemsSubtotal) {
        alert("Partial cannot exceed total items price.");
        return;
      }
      if (hasPreorder && p < preorderDownpayment) {
        alert(`Because product(s) are preorder, minimum partial is 50%: ₱${preorderDownpayment}`);
        return;
      }
    }

    try {
      const res = await fetch("https://tahanancrafts.onrender.com/api/products/product/checkout/", {
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
          partial_amount: Number(paymentOption === "partial" ? partialAmount : 0),
          pay_now: Number(payNow),
          cod_amount: Number(codAmount),
          delivery_id: tempDeliveryId,
          // include artisan id for clarity (backend can ignore)
          artisan_id: resolvedArtisanId,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Place order error:", data);
        alert(data.error || "Failed to place order.");
        return;
      }

      // success: navigate to orders page to-pay tab
      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error("placeOrder error:", err);
      alert("Failed to place order.");
    }
  };

  // -------------------------
  // UI Render
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
                  <p className="address-title">{selectedAddress.barangay}, {selectedAddress.city} {selectedAddress.province}</p>
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

          <button className="change-btn" onClick={() => setShowAddressModal(true)}>Change</button>
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
                <img src={item.main_image || item.img || item.product_main_image || "https://via.placeholder.com/150?text=No+Image"} alt={item.product_name} className="product-img" />
                <div className="product-details">
                  <p className="product-name">{item.product_name || item.product_name}</p>
                  <p className="artisan-name">By: {item.artisan_name || item.artisan_name}</p>
                </div>
                <span className="unit-price">₱{item.unit_price ?? item.price}</span>
                <span className="quantity">{item.quantity}</span>
                <span className="subtotal">₱{item.total_price}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="summary-details">
              <p><span>Items Subtotal:</span><span>₱{itemsSubtotal}</span></p>

              <p><span>Shipping Fee:</span>
                <span>{loadingFee ? "Calculating..." : (shippingFee !== null ? `₱${shippingFee}` : "—")}</span>
              </p>

              {hasPreorder && (
                <p><span>Required Downpayment (50%):</span><span>₱{preorderDownpayment}</span></p>
              )}

              {/* Payment Options */}
              <div className="payment-options" style={{ marginTop: 20 }}>
                <h3>Payment Options</h3>

                {!hasPreorder && (
                  <>
                    <label style={{ display: "block", marginBottom: 8 }}>
                      <input type="radio" value="sf_only" checked={paymentOption === "sf_only"} onChange={() => setPaymentOption("sf_only")} />
                      {" "}Pay Shipping Fee Only
                    </label>

                    <label style={{ display: "block", marginBottom: 8 }}>
                      <input type="radio" value="partial" checked={paymentOption === "partial"} onChange={() => setPaymentOption("partial")} />
                      {" "}Partial Payment
                    </label>

                    {paymentOption === "partial" && (
                      <input type="number" className="partial-input" placeholder="Enter partial amount" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} min="0" />
                    )}

                    <label style={{ display: "block", marginTop: 8 }}>
                      <input type="radio" value="full" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} />
                      {" "}Pay Full Amount
                    </label>
                  </>
                )}

                {hasPreorder && (
                  <>
                    <label style={{ display: "block", marginBottom: 8 }}>
                      <input type="radio" value="sf_only" checked={paymentOption === "sf_only"} onChange={() => setPaymentOption("sf_only")} />
                      {" "}Pay 50% + Shipping Fee
                    </label>

                    <label style={{ display: "block", marginTop: 8 }}>
                      <input type="radio" value="full" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} />
                      {" "}Pay Full Amount
                    </label>
                  </>
                )}
              </div>

              <p className="total"><span>Total Pay Now:</span><span>₱{payNow}</span></p>
              <p className="cod-amount" style={{ marginTop: 10 }}><span>COD Remaining Balance:</span><span>₱{codAmount}</span></p>
            </div>

            {/* QR */}
            <div style={{ marginTop: 25, textAlign: "center" }}>
              <h3>Pay Shipping Fee {hasPreorder ? " + Downpayment" : ""}</h3>
              {selectedItems[0]?.artisan_qr ? (
                <img src={selectedItems[0].artisan_qr} alt="Payment QR" style={{ width: 200, borderRadius: 12, marginTop: 10 }} />
              ) : (
                <p style={{ fontSize: 13, color: "#999" }}>No QR uploaded by seller</p>
              )}
              <p style={{ marginTop: 8, fontSize: 13, color: "#555" }}>Scan the QR to pay. After payment, upload proof in your Orders page.</p>
            </div>

            <h2 style={{ marginTop: 20 }}>Payment Method</h2>
            <p className="payment-method">Cash on Delivery</p>

            <button className="btn-place-order" onClick={placeOrder}>Place Order</button>
          </div>
        </div>
      </div>

      {/* ================= ADDRESS MODAL (SELECT) ================= */}
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
                <div key={addr.id} className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`} onClick={() => setSelectedAddress(addr)}>
                  <div className="radio-col">
                    <input type="radio" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} />
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

                  <button className="edit-btn" onClick={(e) => { e.stopPropagation(); openEditModal(addr); }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="modal-add-btn" onClick={() => { setShowAddModal(true); }}>+ Add New Address</button>
              <button className="modal-save-btn" onClick={() => { setShowAddressModal(false); }}>Save Selection</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD ADDRESS MODAL ================= */}
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

      {/* ================= EDIT ADDRESS MODAL ================= */}
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
                  <input type="checkbox" name="is_default" checked={!!editAddressData.is_default} onChange={(e) => setEditAddressData({ ...editAddressData, is_default: e.target.checked })} />
                  <span className="slider" />
                </label>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-danger" onClick={async () => {
                if (editAddressData.is_default) {
                  await setDefaultAddress(editAddressData.id);
                }
                await deleteAddress();
              }}>Delete Address</button>

              <button className="btn-secondary" onClick={async () => {
                if (editAddressData.is_default) {
                  await setDefaultAddress(editAddressData.id);
                }
                await saveEditAddress();
              }}>Save</button>

              <button className="modal-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </HeaderFooter>
  );
}

export default Checkout;
