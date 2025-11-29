import React, { useState } from "react";
import HeaderFooter from "./HeaderFooter";
import SidebarProfile from "./components/SidebarProfile";
import "./Profile.css";
function MyPurchases() {
  const [activeTab, setActiveTab] = useState("all");
  const [showReview, setShowReview] = useState(false);
  const [showToPayModal, setShowToPayModal] = useState(false);
  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar ===== */}
        <SidebarProfile />
        {/* ===== Main Content ===== */}
        <main className="profile-content">
          <h2>My Purchases</h2>
          <p className="subtitle">Track your order status here</p>
          {/* ===== Tabs ===== */}
          <div className="purchases-tabs">
            {[
              "all",
              "to-pay",
              "to-ship",
              "to-receive",
              "to-review",
              "completed",
            ].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all"
                  ? "All"
                  : tab
                      .replace("-", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
          {/* ===== Purchases Box ===== */}
          <div className="purchase-box">
            {/* ===== ALL ===== */}
            {activeTab === "all" && (
              <div className="orders-list">
                {/* ===== Order 1 ===== */}
                <div className="order-card">
                  <div className="order-header">
                    <h3>Burdang Taal Lace Medallions</h3>
                    <div className="order-actions">
                      <button className="btn-small">Message</button>
                      <button className="btn-small">View Shop</button>
                    </div>
                    <span className="order-status">
                      Parcel has been delivered | <strong>COMPLETED</strong>
                    </span>
                  </div>

                  <div className="order-body">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Product Placeholder"
                      className="order-img"
                    />
                    <div className="order-info">
                      <h4>Burdang Taal Lace Medallions</h4>
                      <p>Table runner</p>
                    </div>
                  </div>

                  <div className="order-footer">
                    <p className="order-total">
                      Order Total: <strong>₱149</strong>
                    </p>
                    <div className="order-buttons">
                      <button className="btn-buy">Buy Again</button>
                      <button className="btn-contact">Contact Artisan</button>
                    </div>
                  </div>
                </div>
                {/* ===== Order 2 ===== */}
                <div className="order-card">
                  <div className="order-header">
                    <h3>Habing Ibaan</h3>
                    <div className="order-actions">
                      <button className="btn-small">Message</button>
                      <button className="btn-small">View Shop</button>
                    </div>
                    <span className="order-status">
                      Parcel has been delivered | <strong>COMPLETED</strong>
                    </span>
                  </div>
                  <div className="order-body">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Product Placeholder"
                      className="order-img"
                    />
                    <div className="order-info">
                      <h4>Kalpi</h4>
                      <p>Hand-woven Coin Purse</p>
                    </div>
                  </div>
                  <div className="order-footer">
                    <p className="order-total">
                      Order Total: <strong>₱149</strong>
                    </p>
                    <div className="order-buttons">
                      <button className="btn-buy">Buy Again</button>
                      <button className="btn-contact">Contact Artisan</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ===== TO PAY ===== */}
{activeTab === "to-pay" && (
  <div className="orders-list">
    <div className="order-card">
      <div className="order-body">
        <img
          src="https://via.placeholder.com/120"
          alt="Product Placeholder"
          className="order-img"
        />
        <div className="order-info">
          <h4>Product Name Placeholder</h4>
          <p>Quantity: 1</p>
          <p>Price: ₱149</p>
          <p>Shipping Fee: ₱50</p>
        </div>
        <button
          className="btn-upload"
          onClick={() => setShowToPayModal(true)}
        >
          Upload Payment Proof
        </button>
      </div>
    </div>
  </div>
)}
{/* ===== To Pay Modal ===== */}
{showToPayModal && (
  <div className="review-modal-overlay">
    <div className="review-modal" style={{ width: "500px", maxWidth: "95%" }}>
      <h2>Payment Details</h2>
      <div className="to-pay-grid" style={{ display: "flex", gap: "20px" }}>
        <div className="to-pay-col" style={{ flex: 1 }}>
          <p><strong>Order Number:</strong> #12345</p>
          <p><strong>Product:</strong> Product Name Placeholder</p>
          <p><strong>Quantity:</strong> 1</p>
          <p><strong>Price:</strong> ₱149</p>
          <p><strong>Shipping Fee:</strong> ₱50</p>
          <p><strong>Preorder:</strong> Yes</p>
        </div>
        <div className="to-pay-col" style={{ flex: 1 }}>
          <p><strong>Downpayment:</strong> ₱100</p>
          <p><strong>Total to Pay Now:</strong> ₱99</p>
          <p><strong>COD Balance:</strong> ₱50</p>
          <p><strong>Created At:</strong> 2025-11-17</p>
          <p><strong>Shipment Date:</strong> 2025-11-20</p>
         <p><strong>Scan to Pay:</strong></p>
<img
  src="https://via.placeholder.com/150?text=QR+Code"
  alt="QR Code"
  style={{
    width: "150px",
    height: "150px",
    borderRadius: "10px",
    marginTop: "5px",
    border: "1px solid #ccc"
  }}
/>
          {/* Upload screenshot */}
          <div className="image-upload-container">
            <label className="image-upload-label">
              Upload Screenshot
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    console.log("Uploaded file:", e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="modal-buttons">
        <button
          className="btn-cancel"
          onClick={() => setShowToPayModal(false)}
        >
          Cancel
        </button>
        <button className="btn-submit">Submit Proof</button>
      </div>
    </div>
  </div>
)}
            {/* ===== TO SHIP ===== */}
            {activeTab === "to-ship" && <p>No items to ship.</p>}
            {/* ===== TO RECEIVE ===== */}
            {activeTab === "to-receive" && <p>No items to receive.</p>}
            {/* ===== TO REVIEW ===== */}
            {activeTab === "to-review" && (
              <div className="orders-list">
                <div className="order-card">
                  <div className="order-body">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Product Placeholder"
                      className="order-img"
                    />
                    <div className="order-info">
                      <h4>Product Name Placeholder</h4>
                      <p>Quantity: 1</p>
                      <p>Price: ₱149</p>
                    </div>
                    <button
                      className="btn-review"
                      onClick={() => setShowReview(true)}
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* ===== COMPLETED ===== */}
            {activeTab === "completed" && <p>No completed orders yet.</p>}
          </div>
{/* ===== Review Modal ===== */}
{showReview && (
  <div className="review-modal-overlay">
    <div className="review-modal">
      <h2>Write a Review</h2>
      {/* ⭐ Stars */}
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="star">
            ★
          </span>
        ))}
      </div>
      {/* 📝 Thoughts */}
      <textarea
        className="review-textarea"
        placeholder="Share your thoughts..."
      ></textarea>
   {/* 🆕 Anonymous Checkbox */}
<div className="anonymous-option">
  <label className="checkbox-label">
    <input type="checkbox" /> Post review anonymously
  </label>
</div>
      {/* Buttons */}
      <div className="modal-buttons">
        <button
          className="btn-cancel"
          onClick={() => setShowReview(false)}
        >
          Cancel
        </button>
        <button className="btn-submit">Submit Review</button>
      </div>
    </div>
  </div>
)}
        </main>
      </div>
    </HeaderFooter>
  );
}
export default MyPurchases;
