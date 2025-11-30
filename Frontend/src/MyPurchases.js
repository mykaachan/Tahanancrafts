import React, { useState } from "react";
import HeaderFooter from "./HeaderFooter";
import SidebarProfile from "./components/SidebarProfile";
import "./Profile.css";
import { useLocation } from "react-router-dom";

function MyPurchases() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get("tab") || "all";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showReview, setShowReview] = useState(false);
  const [showToPayModal, setShowToPayModal] = useState(false);

  // Example placeholder orders — each has its OWN status
  const orders = [
  {
    id: 1,
    title: "Burdang Taal Lace Medallions",
    subtitle: "Table runner",
    price: 149,
    img: "https://via.placeholder.com/120",
    status: "completed",
  },
  {
    id: 2,
    title: "Kalpi - Habing Ibaan",
    subtitle: "Hand-woven Coin Purse",
    price: 149,
    img: "https://via.placeholder.com/120",
    status: "to-pay",
  },
  {
    id: 3,
    title: "Sample Weaving Product",
    subtitle: "Banig",
    price: 199,
    img: "https://via.placeholder.com/120",
    status: "to-ship",
  },
  {
    id: 4,
    title: "Wooden Spoon Set",
    subtitle: "Handcrafted",
    price: 99,
    img: "https://via.placeholder.com/120",
    status: "to-review",
  },
  {
    id: 5,
    title: "Ceramic Coffee Mug",
    subtitle: "Handmade Pottery",
    price: 299,
    img: "https://via.placeholder.com/120",
    status: "to-receive",   // ⭐ ADDED THIS ONE
  },
];

  // STATUS TEXT BASED ON order.status
  const renderStatusText = (status) => {
    switch (status) {
      case "to-pay":
        return <>Awaiting Payment | <strong>TO PAY</strong></>;
      case "to-ship":
        return <>Seller will ship soon | <strong>TO SHIP</strong></>;
      case "to-receive":
        return <>Your parcel is on the way | <strong>TO RECEIVE</strong></>;
      case "to-review":
        return <>Delivered | <strong>TO REVIEW</strong></>;
      case "completed":
      default:
        return <>Parcel has been delivered | <strong>COMPLETED</strong></>;
    }
  };

  // BUTTON GROUP BASED ON order.status
  const renderButtonsForStatus = (status) => {
    switch (status) {
      case "to-pay":
        return (
          <>
            <button className="btn-buy" onClick={() => setShowToPayModal(true)}>
              Upload Payment Proof
            </button>
            <button className="btn-cancel">Cancel</button>
          </>
        );

      case "to-ship":
        return <button className="btn-contact">Message</button>;

      case "to-receive":
        return (
          <>
            <button className="btn-buy">To Receive</button>
            <button className="btn-contact">Message</button>
          </>
        );

      case "to-review":
        return (
          <>
            <button className="btn-buy" onClick={() => setShowReview(true)}>
              Write a Review
            </button>
            <button className="btn-contact">Message</button>
          </>
        );

      case "completed":
      default:
        return (
          <>
            <button className="btn-buy">Buy Again</button>
            <button className="btn-contact">Message</button>
          </>
        );
    }
  };

  // FILTER ORDERS WHEN NOT IN "ALL"
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <HeaderFooter>
      <div className="profile-page">
        <SidebarProfile />

        <main className="profile-content">
          <h2>My Purchases</h2>
          <p className="subtitle">Track your order status here</p>

          {/* TABS */}
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
                onClick={() => {
                  setActiveTab(tab);
                  window.history.replaceState(
                    null,
                    "",
                    `/my-purchases?tab=${tab}`
                  );
                }}
              >
                {tab === "all"
                  ? "All"
                  : tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* ORDER LIST */}
          <div className="purchase-box">
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div className="order-card" key={order.id}>
                  {/* HEADER */}
                  <div className="order-header">
                    <h3>{order.title}</h3>

                    <div className="order-actions">
                      <button className="btn-small">View Shop</button>
                    </div>

                    <span className="order-status">
                      {renderStatusText(order.status)}
                    </span>
                  </div>

                  {/* BODY */}
                  <div className="order-body">
                    <img
                      src={order.img}
                      alt="Product"
                      className="order-img"
                    />
                    <div className="order-info">
                      <h4>{order.title}</h4>
                      <p>{order.subtitle}</p>
                      <p>Quantity: 1</p>
                      <p>Price: ₱{order.price}</p>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="order-footer">
                    <p className="order-total">
                      Order Total: <strong>₱{order.price}</strong>
                    </p>

                    <div className="order-buttons">
                      {renderButtonsForStatus(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* === TO PAY MODAL === */}
            {showToPayModal && (
              <div className="review-modal-overlay">
                <div
                  className="review-modal"
                  style={{ width: "500px", maxWidth: "95%" }}
                >
                  <h2>Payment Details</h2>

                  <div
                    className="to-pay-grid"
                    style={{
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <p><strong>Order Number:</strong> #12345</p>
                      <p><strong>Product:</strong> Sample Product</p>
                      <p><strong>Quantity:</strong> 1</p>
                      <p><strong>Price:</strong> ₱149</p>
                      <p><strong>Shipping Fee:</strong> ₱50</p>
                      <p><strong>Preorder:</strong> Yes</p>
                    </div>

                    <div style={{ flex: 1, minWidth: 220 }}>
                      <p><strong>Downpayment:</strong> ₱100</p>
                      <p><strong>Total to Pay Now:</strong> ₱99</p>
                      <p><strong>COD Balance:</strong> ₱50</p>
                      <p><strong>Created At:</strong> 2025-11-17</p>

                      <p><strong>Scan to Pay:</strong></p>
                      <img
                        src="https://via.placeholder.com/150?text=QR+Code"
                        alt="QR Code"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                        }}
                      />

                      <div style={{ marginTop: 10 }}>
                        <label className="image-upload-label">
                          Upload Screenshot
                          <input type="file" accept="image/*" />
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

            {/* === REVIEW MODAL === */}
            {showReview && (
              <div className="review-modal-overlay">
                <div
                  className="review-modal"
                  style={{ width: "500px", maxWidth: "95%" }}
                >
                  <h2>Write a Review</h2>

                  <div className="stars" style={{ fontSize: 22, margin: "8px 0" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="star" style={{ marginRight: 6 }}>
                        ★
                      </span>
                    ))}
                  </div>

                  <textarea
                    className="review-textarea"
                    placeholder="Share your thoughts about the product..."
                    style={{ width: "100%", minHeight: 100 }}
                  ></textarea>

                  <div style={{ marginTop: 10, marginBottom: 12 }}>
                    <label className="checkbox-label">
                      <input type="checkbox" /> Post review anonymously
                    </label>
                  </div>

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
          </div>
        </main>
      </div>
    </HeaderFooter>
  );
}

export default MyPurchases;
