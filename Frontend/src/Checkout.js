import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css"; // ✅ separate CSS file

function Checkout() {
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

            {/* Product 1 */}
            <div className="product-item">
              <img
                src="https://via.placeholder.com/100"
                alt="Product"
                className="product-img"
              />
              <div className="product-details">
                <p className="product-name">Iraya Basket Lipa</p>
              </div>
              <span className="unit-price">₱349</span>
              <span className="quantity">1</span>
              <span className="subtotal">₱349</span>
            </div>

            {/* Product 2 */}
            <div className="product-item">
              <img
                src="https://via.placeholder.com/100"
                alt="Product"
                className="product-img"
              />
              <div className="product-details">
                <p className="product-name">Burdang Taal Lace Medallions</p>
              </div>
              <span className="unit-price">₱149</span>
              <span className="quantity">1</span>
              <span className="subtotal">₱149</span>
            </div>

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

            <button className="btn-place-order">Place Order</button>
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default Checkout;
