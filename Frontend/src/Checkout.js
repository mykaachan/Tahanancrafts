import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems = location.state?.items || [];

  // ----------------------------
  // Address State
  // ----------------------------
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddress, setSelectedAddress] = React.useState(null);

  // Select Address modal
  const [showAddressModal, setShowAddressModal] = React.useState(false);

  // Add / Edit modals
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editAddressData, setEditAddressData] = React.useState(null);

  // Add form state
  const [formAdd, setFormAdd] = React.useState({
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

  // Edit form is stored in editAddressData

  // ----------------------------
  // Load addresses
  // ----------------------------
  React.useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return navigate("/login");

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
      // if selectedAddress no longer exists, pick default or first
      const def = (data && data.find((a) => a.is_default)) || (data && data[0]);
      // preserve selectedAddress if still present
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

  if (selectedItems.length === 0) {
    return <p>No selected items. Go back to cart.</p>;
  }

  const SHIPPING_PLACEHOLDER = 58; // default placeholder fee

  // Compute items subtotal
  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.qty),
    0
  );

  // If backend ever sends shipping fee, use it, else fallback to 58
  const shippingFee = selectedAddress?.shipping_fee
    ? Number(selectedAddress.shipping_fee)
    : SHIPPING_PLACEHOLDER;

  // Total
  const orderTotal = itemsSubtotal + shippingFee;
  // ----------------------------
  // PLACE ORDER
  // ----------------------------
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");

    if (!selectedAddress) {
      alert("Select a shipping address first.");
      return;
    }

    const cart_item_ids = selectedItems.map((i) => i.id);

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
      navigate("/order-success", { state: data });
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  // ----------------------------
  // Add Address handlers
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
        // clear add form
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
                <img src={item.img} alt={item.name} className="product-img" />
                <div className="product-details">
                  <p className="product-name">{item.name}</p>
                </div>
                <span className="unit-price">₱{item.unit_price}</span>
                <span className="quantity">{item.qty}</span>
                <span className="subtotal">₱{Number(item.unit_price) * Number(item.qty)}</span>
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
                  ₱{shippingFee}{" "}
                  {!selectedAddress?.shipping_fee && (
                    <span style={{ color: "#a67c52", fontSize: "13px" }}>
                      (placeholder)
                    </span>
                  )}
                </span>
              </p>

              <p className="total">
                <span>Total:</span>
                <span>₱{orderTotal}</span>
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
                  // if toggled default on, call set-default API first
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
                  // if user toggled default, call set-default API
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
