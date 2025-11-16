import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css"; // ✅ separate CSS file
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItems = (location.state?.items || []).filter(i => i.selected);

  if (selectedItems.length === 0) {
    return <p>No items selected. Go back to cart.</p>;
  }

  const convertToCheckoutFormat = () => {
    return selectedItems.map(item => ({
      product_id: item.product_id || item.id,   // adjust based on your API
      quantity: item.qty,
    }));
  };

  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return navigate("/login");

    const itemsForBackend = selectedItems.map(i => ({
      product_id: i.product_id,
      quantity: i.qty,
    }));

    const shipping_address_id = 1; // later dynamic

    const res = await fetch("https://tahanancrafts.onrender.com/api/checkout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        shipping_address_id,
        cart_items: itemsForBackend,
      }),
    });

    const data = await res.json();
    console.log("Checkout response:", data);

    navigate("/order-success", { state: data });
  };


  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* ===== ADDRESS SECTION ===== */}
        <div className="address-bar">
          <div className="address-info">
            <span className="address-icon">📍</span>
            <div>
              <p className="address-title">Laurel, Taysan, Batangas</p>
              <p className="address-details">
                Kathryn Bernardo &nbsp; +63 961 073 5785 &nbsp; 081 Laurel,
                Taysan, Batangas
              </p>
            </div>
          </div>
          <button className="change-btn">Change</button>
        </div>

        <div className="checkout-container">
          {/* ===== LEFT SIDE ===== */}
          <div className="checkout-details">
            <h2>Products Ordered</h2>

            <div className="product-header">
              <span>Unit Price</span>
              <span>Quantity</span>
              <span>Item Subtotal</span>
            </div>

            {/* Products */}
            {selectedItems.map(item => (
              <div className="product-item" key={item.id}>
                <img src={item.img} alt={item.name} className="product-img" />
                <div className="product-details">
                  <p className="product-name">{item.name}</p>
                </div>
                <span className="unit-price">₱{item.price / item.qty}</span>
                <span className="quantity">{item.qty}</span>
                <span className="subtotal">₱{item.price}</span>
              </div>
            ))}

            {/* Message + Shipping */}
            <div className="checkout-footer">
              <div className="message-box">
                <label>Message for Artisan:</label>
                <input type="text" placeholder="Please leave a message..." />
              </div>
              <div className="shipping-info">
                <p>Shipping Option: Standard Local</p>
                <p className="guarantee">🚚 Guaranteed to get by 11 - 13 May</p>
                <p className="shipping-fee">₱58</p>
              </div>
            </div>

            <div className="order-total">
              <p>Order Total (2 Items): ₱556</p>
            </div>
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div className="checkout-summary">
            <h2>Payment Method</h2>
            <p className="payment-method">Cash on Delivery</p>

            <div className="summary-details">
              <p>
                Merchandise Subtotal <span>₱498</span>
              </p>
              <p>
                Shipping Payment <span>₱58</span>
              </p>
              <p className="total">
                Total Payment: <span>₱556</span>
              </p>
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
