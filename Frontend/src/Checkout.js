import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems = location.state?.items || [];

  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddress, setSelectedAddress] = React.useState(null);

  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const [editAddressData, setEditAddressData] = React.useState(null);

  const [qrCode, setQrCode] = React.useState(null);

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

  /* -----------------------------
      LOAD SHIPPING ADDRESSES
  ----------------------------- */
  React.useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return navigate("/login");

    (async function loadAddresses() {
      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
        );
        const data = await res.json();
        setAddresses(data || []);
        const def = data.find((a) => a.is_default) || data[0];
        setSelectedAddress(def || null);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    })();
  }, [navigate]);

  /* -----------------------------
      FETCH ARTISAN QR CODE
  ----------------------------- */
  React.useEffect(() => {
    if (!selectedItems.length) return;

    // assume all selected items have the same artisan
    const artisanId = selectedItems[0].artisan_id;

    if (!artisanId) return;

    async function fetchQR() {
      try {
        const res = await fetch(
          `https://tahanancrafts.onrender.com/api/users/artisan/${artisanId}/qr/`
        );

        const data = await res.json();
        setQrCode(data.qr_code || null);
      } catch (error) {
        console.error("QR fetch error:", error);
      }
    }

    fetchQR();
  }, [selectedItems]);

  /* -----------------------------
     UTILITY: REFRESH ADDRESSES
  ----------------------------- */
  const refreshAddresses = async () => {
    const userId = localStorage.getItem("user_id");
    const res = await fetch(
      `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
    );
    const data = await res.json();
    setAddresses(data || []);

    const def = data.find((a) => a.is_default) || data[0];

    if (selectedAddress) {
      const still = data.find((a) => a.id === selectedAddress.id);
      setSelectedAddress(still || def || null);
    } else {
      setSelectedAddress(def || null);
    }
  };

  /* -----------------------------
     CHECKOUT + PLACE ORDER
  ----------------------------- */
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

      await res.json();

      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  /* -----------------------------
     SUMMARY (FRONT-END)
  ----------------------------- */
  const SHIPPING_PLACEHOLDER = 58;

  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.qty),
    0
  );

  const shippingFee = selectedAddress?.shipping_fee
    ? Number(selectedAddress.shipping_fee)
    : SHIPPING_PLACEHOLDER;

  const hasPreorder = selectedItems.some((item) => item.is_preorder === true);

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
    qr_code: qrCode,
  };

  /* -----------------------------
      ADD / EDIT ADDRESS LOGIC
  ----------------------------- */
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
      alert("Failed to update address");
    }
  };

  const deleteAddress = async () => {
    if (!window.confirm("Delete this address?")) return;

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
  };

  const setDefaultAddress = async (id) => {
    const userId = localStorage.getItem("user_id");

    await fetch(
      `https://tahanancrafts.onrender.com/api/users/shipping-address/set-default/${id}/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    await refreshAddresses();
  };

  /* ================================================
     RENDER PAGE
  ================================================= */
  if (!selectedItems.length) return <p>No items selected.</p>;

  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* ADDRESS BAR */}
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
                    {selectedAddress.full_name} ({selectedAddress.phone})
                    <br />
                    {selectedAddress.address}
                  </p>
                </>
              ) : (
                <p>No address found.</p>
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

        {/* MAIN CONTENT */}
        <div className="checkout-container">
          {/* ------------------- ITEMS ------------------- */}
          <div className="checkout-details">
            <h2>Products Ordered</h2>

            <div className="product-header">
              <span>Unit Price</span>
              <span>Qty</span>
              <span>Subtotal</span>
            </div>

            {selectedItems.map((item) => (
              <div className="product-item" key={item.id}>
                <img src={item.img} alt={item.name} className="product-img" />

                <div className="product-details">
                  <p className="product-name">{item.name}</p>
                </div>

                <span className="unit-price">₱{item.unit_price}</span>
                <span className="quantity">{item.qty}</span>
                <span className="subtotal">
                  ₱{Number(item.unit_price) * Number(item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* ------------------- SUMMARY ------------------- */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="summary-details">
              <p>
                <span>Items Subtotal:</span>
                <span>₱{summary.total_items_amount}</span>
              </p>

              <p>
                <span>Shipping Fee:</span>
                <span>₱{summary.shipping_fee}</span>
              </p>

              {summary.downpayment_required && (
                <p>
                  <span>Downpayment (50%):</span>
                  <span>₱{summary.downpayment_amount}</span>
                </p>
              )}

              <p className="total">
                <span>Total to Pay Now:</span>
                <span style={{ fontWeight: "bold", color: "#a67c52" }}>
                  ₱{summary.total_pay_now}
                </span>
              </p>

              <p className="cod-amount">
                <span>COD Remaining:</span>
                <span>₱{summary.cod_amount}</span>
              </p>
            </div>

            {/* QR PAYMENT BLOCK */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <h3>Pay Shipping Fee {summary.downpayment_required && "+ DP"}</h3>

              {summary.qr_code ? (
                <img
                  src={summary.qr_code}
                  alt="QR Code"
                  style={{
                    width: "200px",
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                />
              ) : (
                <p style={{ fontSize: 13, color: "#888" }}>
                  QR not available
                </p>
              )}

              <p style={{ fontSize: 13, marginTop: 8 }}>
                After paying, upload your proof inside My Purchases → To Pay.
              </p>
            </div>

            {/* PAYMENT METHOD BOX */}
            <h2 style={{ marginTop: 20 }}>Payment Method</h2>

            <div className="payment-method-box">
              <h3 className="pm-title">QR Payment</h3>

              <p className="pm-line">
                <span>Shipping Fee:</span>
                <span>₱{summary.shipping_fee}</span>
              </p>

              {summary.downpayment_required && (
                <p className="pm-line">
                  <span>Downpayment:</span>
                  <span>₱{summary.downpayment_amount}</span>
                </p>
              )}

              <p className="pm-total-now">
                <span>Total to Pay Now:</span>
                <span className="highlight">₱{summary.total_pay_now}</span>
              </p>

              {/* COD */}
              <h3 className="pm-title">Cash on Delivery</h3>
              <p className="pm-cod">
                <span>Amount on Delivery:</span>
                <span className="highlight">₱{summary.cod_amount}</span>
              </p>
            </div>

            <button className="btn-place-order" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
         ADDRESS MODALS (unchanged logic)
      ========================================================= */}

      {/* SELECT ADDRESS */}
      {showAddressModal && (
        <div className="address-modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Shipping Address</h2>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>

            <div className="address-list">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <input
                    type="radio"
                    checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                  />

                  <div className="address-col">
                    <strong>{addr.full_name}</strong>
                    <br />
                    {addr.barangay}, {addr.city}, {addr.province}
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

            <div style={{ display: "flex", gap: 8 }}>
              <button className="modal-add-btn" onClick={() => setShowAddModal(true)}>
                + Add New Address
              </button>
              <button className="modal-save-btn" onClick={() => setShowAddressModal(false)}>
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADDRESS */}
      {showAddModal && (
        <div className="address-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Address</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="address-form-grid">
              {Object.keys(formAdd).map((field) => (
                <input
                  key={field}
                  name={field}
                  value={formAdd[field]}
                  placeholder={field.replace("_", " ").toUpperCase()}
                  onChange={handleAddChange}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="modal-save-btn" onClick={saveNewAddress}>
                Save
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ADDRESS */}
      {showEditModal && editAddressData && (
        <div className="address-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Address</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <div className="address-form-grid">
              {Object.keys(editAddressData).map((field) =>
                field === "is_default" ? (
                  <label key={field}>
                    Default?
                    <input
                      type="checkbox"
                      checked={!!editAddressData.is_default}
                      onChange={(e) =>
                        setEditAddressData({
                          ...editAddressData,
                          is_default: e.target.checked,
                        })
                      }
                    />
                  </label>
                ) : (
                  <input
                    key={field}
                    name={field}
                    value={editAddressData[field] || ""}
                    onChange={handleEditChange}
                  />
                )
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-danger" onClick={deleteAddress}>
                Delete
              </button>
              <button className="btn-secondary" onClick={saveEditAddress}>
                Save
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowEditModal(false)}>
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
