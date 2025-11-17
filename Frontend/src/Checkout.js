 import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart_item_ids = location.state?.cart_item_ids || [];
  const [selectedItems, setSelectedItems] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

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

  // 🔥 Load item details from backend
  useEffect(() => {
    const loadSelectedItems = async () => {
      const userId = localStorage.getItem("user_id");

      const res = await fetch(
        `https://tahanancrafts.onrender.com/api/products/cart/carts/${userId}/`
      );

      const allItems = await res.json();

      const filtered = allItems.filter((item) =>
        cart_item_ids.includes(item.id)
      );

      setSelectedItems(filtered);
    };

    loadSelectedItems();
  }, [cart_item_ids]);

  // 🔥 Load addresses same as before
  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    fetch(
      `https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`
    )
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data);
        setSelectedAddress(
          data.find((a) => a.is_default) || data[0] || null
        );
      });
  }, []);

  if (selectedItems.length === 0) {
    return <p>Loading selected items...</p>;
  }

  // === Summary ===
  const itemsSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  );

  const shippingFee = selectedAddress?.shipping_fee || 58;

  const hasPreorder = false;

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
    qr_code: selectedItems[0]?.artisan_qr || null,
  };

  // === Place Order (unchanged) ===
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");

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
  };

  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-container">
          {/* LEFT SIDE */}
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
                  src={item.main_image}
                  alt={item.product_name}
                  className="product-img"
                />

                <div className="product-details">
                  <p className="product-name">{item.product_name}</p>
                </div>

                <span>₱{item.price}</span>
                <span>{item.quantity}</span>
                <span>₱{item.total_price}</span>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
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

              <p className="total">
                <span>Total to Pay Now:</span>
                <span>₱{summary.total_pay_now}</span>
              </p>

              <p className="cod-amount">
                <span>COD Remaining Balance:</span>
                <span>₱{summary.cod_amount}</span>
              </p>
            </div>

            {/* QR CODE */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              {summary.qr_code ? (
                <img
                  src={summary.qr_code}
                  alt="QR"
                  style={{ width: 200, borderRadius: 12 }}
                />
              ) : (
                <p>No QR uploaded by seller</p>
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
