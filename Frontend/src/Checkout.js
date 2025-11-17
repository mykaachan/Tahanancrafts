import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems = location.state?.items || [];
  console.log("Selected Items:", selectedItems);


  // ----------------------------
  // Address State
  // ----------------------------
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddress, setSelectedAddress] = React.useState(null);

  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editAddressData, setEditAddressData] = React.useState(null);

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

        const def =
          (data && data.find((a) => a.is_default)) || (data && data[0]);
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

      const def =
        (data && data.find((a) => a.is_default)) || (data && data[0]);

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

  // ----------------------------
  // Summary Calculations
  // ----------------------------
  const SHIPPING_PLACEHOLDER = 58;

  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.qty),
    0
  );

  const shippingFee = selectedAddress?.shipping_fee
    ? Number(selectedAddress.shipping_fee)
    : SHIPPING_PLACEHOLDER;

  const hasPreorder = selectedItems.some(
    (item) => item.is_preorder === true
  );

  const downpaymentAmount = hasPreorder ? itemsSubtotal * 0.5 : 0;
  const totalPayNow = shippingFee + downpaymentAmount;
  const codAmount = itemsSubtotal - downpaymentAmount;

  // ----------------------------
  // FIXED QR CODE HANDLING
  // ----------------------------
  const rawQR = selectedItems[0]?.artisan_qr || null;

  const cleanedQR =
    rawQR && rawQR.endsWith("/") ? rawQR.slice(0, -1) : rawQR;

  const fullQR = cleanedQR
    ? `https://tahanancrafts.onrender.com${cleanedQR}`
    : null;

  const summary = {
    total_items_amount: itemsSubtotal,
    shipping_fee: shippingFee,
    downpayment_required: hasPreorder,
    downpayment_amount: downpaymentAmount,
    total_pay_now: totalPayNow,
    cod_amount: codAmount,
    qr_code: fullQR,
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

    const cart_item_ids = selectedItems.map((i) => i.id);

    try {
      await fetch(
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

      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  // =======================================================================
  // UI START
  // =======================================================================
  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* Address Section */}
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
          {/* Items Ordered */}
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
                <span className="subtotal">
                  ₱{Number(item.unit_price) * Number(item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY SECTION */}
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
                <span>COD Remaining Balance:</span>
                <span>₱{summary.cod_amount}</span>
              </p>
            </div>

            {/* QR PAYMENT */}
            <div style={{ marginTop: "25px", textAlign: "center" }}>
              <h3>
                Pay Shipping Fee{" "}
                {summary.downpayment_required && " + Downpayment"}
              </h3>

              {selectedItems[0]?.artisan_qr ? (
                <img
                  src={selectedItems[0]?.artisan_qr}
                  alt="GCash QR"
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
                Scan the QR to pay. After payment, upload proof in your
                Orders page.
              </p>
            </div>

            {/* Place Order */}
            <button className="btn-place-order" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default Checkout;
