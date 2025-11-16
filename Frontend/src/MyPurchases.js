import React, { useState } from "react";
import HeaderFooter from "./HeaderFooter";
import SidebarProfile from "./components/SidebarProfile";
import "./Profile.css";

function MyPurchases() {
  const [activeTab, setActiveTab] = useState("all");

  // Review modal
  const [showReview, setShowReview] = useState(false);

  // Payment proof modal
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
            {["all", "to-pay", "to-ship", "to-receive", "to-review", "completed"].map(
              (tab) => (
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
              )
            )}
          </div>

          {/* ===== Purchases Box ===== */}
          <div className="purchase-box">

            {/* ======================== ALL ======================== */}
            {activeTab === "all" && (
              <div className="orders-list">
                {/* SAMPLE ORDER */}
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
                      alt="Product"
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
              </div>
            )}

            {/* ======================== TO PAY ======================== */}
            {activeTab === "to-pay" && (
              <div className="orders-list">
                {/* Example Order waiting for payment */}
                <div className="order-card">
                  <div className="order-header">
                    <h3>Order #12345</h3>
                    <span className="order-status">Waiting for Payment</span>
                  </div>

                  <div className="order-body">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Product"
                      className="order-img"
                    />

                    <div className="order-info">
                      <h4>Sample Product</h4>
                      <p>Qty: 1</p>
                      <p>Price: ₱149</p>
                    </div>

                    <button
                      className="btn-buy"
                      onClick={() => {
                        setSelectedOrder({
                          id: 12345,
                          product_name: "Sample Product",
                          quantity: 1,
                          price: 149,
                          total_items_amount: 149,
                          shipping_fee: 58,
                          downpayment_required: true,
                          downpayment_amount: 74.5,
                          cod_amount: 74.5,
                          total_pay_now: 132.5,
                          qr_code: "https://via.placeholder.com/200",
                          created_at: "2025-01-01",
                          ship_date: "2025-01-08",
                        });
                        setShowPaymentPopup(true);
                      }}
                    >
                      Upload Proof of Payment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================== TO SHIP ======================== */}
            {activeTab === "to-ship" && <p>No items to ship.</p>}

            {/* ======================== TO RECEIVE ======================== */}
            {activeTab === "to-receive" && <p>No items to receive.</p>}

            {/* ======================== TO REVIEW ======================== */}
            {activeTab === "to-review" && (
              <div className="orders-list">
                <div className="order-card">
                  <div className="order-body">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="Product"
                      className="order-img"
                    />

                    <div className="order-info">
                      <h4>Product Name</h4>
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

            {/* ======================== COMPLETED ======================== */}
            {activeTab === "completed" && <p>No completed orders yet.</p>}
          </div>

          {/* =======================================================
              REVIEW MODAL
          ======================================================= */}
          {showReview && (
            <div className="review-modal-overlay">
              <div className="review-modal">
                <h2>Write a Review</h2>

                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="star">★</span>
                  ))}
                </div>

                <textarea
                  className="review-textarea"
                  placeholder="Share your thoughts..."
                ></textarea>

                <div className="image-upload-container">
                  <label className="image-upload-label">
                    Upload Photo
                    <input type="file" />
                  </label>
                </div>

                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => setShowReview(false)}>
                    Cancel
                  </button>
                  <button className="btn-submit">Submit Review</button>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              PAYMENT PROOF MODAL
          ======================================================= */}
          {showPaymentPopup && selectedOrder && (
            <div className="review-modal-overlay">
              <div className="review-modal">

                <h2>Upload Payment Proof</h2>
                <p className="subtitle">Order #{selectedOrder.id}</p>

                {/* ORDER DETAILS */}
                <div className="payment-details">
                  <p><strong>Product:</strong> {selectedOrder.product_name}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Price:</strong> ₱{selectedOrder.price}</p>
                  <p><strong>Shipping Fee:</strong> ₱{selectedOrder.shipping_fee}</p>

                  <p>
                    <strong>Preorder:</strong>{" "}
                    {selectedOrder.downpayment_required ? "Yes" : "No"}
                  </p>

                  {selectedOrder.downpayment_required && (
                    <p><strong>Downpayment:</strong> ₱{selectedOrder.downpayment_amount}</p>
                  )}

                  <p><strong>Total to Pay Now:</strong> ₱{selectedOrder.total_pay_now}</p>
                  <p><strong>COD Balance:</strong> ₱{selectedOrder.cod_amount}</p>

                  <p><strong>Created At:</strong> {selectedOrder.created_at}</p>

                  {selectedOrder.ship_date && (
                    <p><strong>Shipment Date:</strong> {selectedOrder.ship_date}</p>
                  )}
                </div>

                {/* QR CODE SECTION */}
                <div className="qr-section">
                  <h3>Scan to Pay</h3>
                  <img
                    src={selectedOrder.qr_code}
                    alt="QR Code"
                    className="qr-preview"
                  />
                </div>

                {/* FILE UPLOAD */}
                <h3>Upload Screenshot</h3>

                <div className="image-upload-container">
                  <label className="image-upload-label">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedOrder({
                            ...selectedOrder,
                            proof_file: file,
                            proof_preview: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {selectedOrder.proof_preview && (
                  <img
                    src={selectedOrder.proof_preview}
                    className="preview-img"
                    alt="Preview"
                  />
                )}

                <div className="modal-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowPaymentPopup(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-submit"
                    onClick={() => {
                      const formData = new FormData();
                      formData.append("order_id", selectedOrder.id);
                      formData.append("payment_proof", selectedOrder.proof_file);

                      fetch("/api/orders/upload-proof/", {
                        method: "POST",
                        body: formData,
                      })
                        .then((res) => res.json())
                        .then(() => {
                          alert("Payment proof uploaded!");
                          setShowPaymentPopup(false);
                        });
                    }}
                  >
                    Submit Proof
                  </button>
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
