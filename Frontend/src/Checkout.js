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

  const [shippingFee, setShippingFee] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  const [paymentOption, setPaymentOption] = useState("sf_only"); // sf_only, partial, full
  const [partialAmount, setPartialAmount] = useState("");

  const [tempDeliveryId, setTempDeliveryId] = useState(null);

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

  // -------------------------------------------------------------
  // LOAD SELECTED CART ITEMS
  // -------------------------------------------------------------
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
        console.error("Error loading items:", err);
      }
    };

    if (cart_item_ids.length > 0) loadSelectedItems();
  }, [cart_item_ids, items_frontend]);

  // -------------------------------------------------------------
  // LOAD ADDRESSES
  // -------------------------------------------------------------
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
        const def = data.find((a) => a.is_default) || data[0];
        setSelectedAddress(def || null);
      } catch (err) {
        console.error("Address load failed:", err);
      }
    };

    loadAddrs();
  }, []);

  // -------------------------------------------------------------
  // CALL LALAMOVE QUOTATION
  // -------------------------------------------------------------
  const fetchShippingFee = async () => {
    if (!selectedAddress || selectedItems.length === 0) return;

    setLoadingFee(true);

    const artisanId = selectedItems[0].artisan_id; // ✔ your backend provides this
    const userId = localStorage.getItem("user_id");

    try {
      const res = await fetch(
        "https://tahanancrafts.onrender.com/api/products/delivery/checkout-quotation/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipping_address_id: selectedAddress.id,
            artisan_id: artisanId,
            user_id: userId,
          }),
        }
      );

      const data = await res.json();
      console.log("Quotation Response:", data);

      if (data.quotation?.priceBreakdown?.total) {
        setShippingFee(Number(data.quotation.priceBreakdown.total));
        setTempDeliveryId(data.temp_delivery_id);
      } else {
        alert("Failed to compute shipping fee");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load shipping fee.");
    }

    setLoadingFee(false);
  };

  useEffect(() => {
    if (selectedAddress && selectedItems.length > 0) {
      fetchShippingFee();
    }
  }, [selectedAddress, selectedItems]);

  // -------------------------------------------------------------
  // PAYMENT COMPUTATION
  // -------------------------------------------------------------
  const itemsSubtotal = selectedItems.reduce(
    (sum, item) =>
      sum + Number(item.total_price || item.price * item.quantity || 0),
    0
  );

  const hasPreorder = selectedItems.some((i) => i.is_preorder === true);
  const preorderDownpayment = hasPreorder ? itemsSubtotal * 0.5 : 0;

  let payNow = 0;
  let codAmount = 0;

  if (paymentOption === "sf_only") {
    payNow = (shippingFee || 0);
    codAmount = itemsSubtotal;
  }

  if (paymentOption === "partial") {
    let partial = Number(partialAmount || 0);
    payNow = partial + (shippingFee || 0);

    if (partial > itemsSubtotal) {
      partial = itemsSubtotal;
    }

    codAmount = itemsSubtotal - partial;
  }

  if (paymentOption === "full") {
    payNow = itemsSubtotal + (shippingFee || 0);
    codAmount = 0;
  }

  if (hasPreorder) {
    if (paymentOption === "sf_only") {
      payNow = preorderDownpayment + (shippingFee || 0);
      codAmount = itemsSubtotal - preorderDownpayment;
    }

    if (paymentOption === "partial") {
      payNow = preorderDownpayment + (shippingFee || 0);
      codAmount = itemsSubtotal - preorderDownpayment;
    }

    if (paymentOption === "full") {
      payNow = itemsSubtotal + (shippingFee || 0);
      codAmount = 0;
    }
  }

  // -------------------------------------------------------------
  // PLACE ORDER
  // -------------------------------------------------------------
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");
    if (!shippingFee) {
      alert("Shipping fee not loaded yet.");
      return;
    }

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
            payment_option: paymentOption,
            partial_amount: Number(partialAmount || 0),
            pay_now: payNow,
            cod_amount: codAmount,
            delivery_id: tempDeliveryId,
          }),
        }
      );

      navigate("/my-purchases?tab=to-pay");
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // UI STARTS HERE
  // -------------------------------------------------------------
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
                    {selectedAddress.city}, {selectedAddress.province}
                  </p>
                  <p className="address-details">
                    {selectedAddress.full_name} ({selectedAddress.phone}) <br />
                    {selectedAddress.address}
                  </p>
                </>
              ) : (
                <p>No address selected</p>
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

          {/* PRODUCT LIST */}
          <div className="checkout-details">
            <h2>Products Ordered</h2>
            <div className="product-header">
              <span>Unit Price</span>
              <span>Qty</span>
              <span>Subtotal</span>
            </div>

            {selectedItems.map((item) => (
              <div className="product-item" key={item.id}>
                <img
                  src={
                    item.img ||
                    item.product_main_image ||
                    "https://via.placeholder.com/150"
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

          {/* SUMMARY */}
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
                  {loadingFee ? "Calculating..." : `₱${shippingFee}`}
                </span>
              </p>

              {hasPreorder && (
                <p>
                  <span>Required Downpayment (50%):</span>
                  <span>₱{preorderDownpayment}</span>
                </p>
              )}

              {/* PAYMENT OPTIONS */}
              <div className="payment-options" style={{ marginTop: "20px" }}>
                <h3>Payment Options</h3>

                {!hasPreorder && (
                  <>
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
                        onChange={(e) => setPartialAmount(e.target.value)}
                        min="1"
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
                  </>
                )}

                {/* PREORDER FORCED RULE */}
                {hasPreorder && (
                  <>
                    <label>
                      <input
                        type="radio"
                        value="downpayment"
                        checked={paymentOption === "sf_only"}
                        onChange={() => setPaymentOption("sf_only")}
                      />
                      Pay 50% + Shipping Fee
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="full"
                        checked={paymentOption === "full"}
                        onChange={() => setPaymentOption("full")}
                      />
                      Pay Full Amount
                    </label>
                  </>
                )}
              </div>

              <p className="total">
                <span>Total Pay Now:</span>
                <span>₱{payNow}</span>
              </p>

              <p className="cod-amount">
                <span>COD Remaining:</span>
                <span>₱{codAmount}</span>
              </p>
            </div>

            {/* QR CODE */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <h3>Scan to Pay</h3>
              {selectedItems[0]?.artisan_qr ? (
                <img
                  src={selectedItems[0].artisan_qr}
                  alt="GCash QR"
                  style={{
                    width: "200px",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                />
              ) : (
                <p>No QR available</p>
              )}
            </div>

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
