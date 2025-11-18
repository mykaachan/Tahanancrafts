// =======================
// HomeDashboard.js
// Updated for dynamic products
// =======================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";
import { getImageUrl } from "./api";

const API_URL = process.env.REACT_APP_API_URL;

// Temporary demos
const allTransactions = [
  {
    orderId: "#101011",
    icon: require("./images/bag.png"),
    name: "Sakbit Habing Ibaan",
    category: "Weaved Bag",
    stock: 10,
    price: "₱1,500",
    status: "Shipped",
    date: "1 May 2025",
  },
  {
    orderId: "#101011",
    icon: require("./images/bag1.png"),
    name: "Kalpi Habing Ibaan",
    category: "Coin Purse",
    stock: 5,
    price: "₱1,745",
    status: "Shipped",
    date: "1 May 2025",
  },
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  // ================================
  // NEW: Dynamic seller product states
  // ================================
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ================================
  // NEW: Fetch Seller Products
  // ================================
  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.log("❌ No user_id found in localStorage");
          return;
        }

        // 1️⃣ Get artisan_id
        const artisanRes = await fetch(
          `${API_URL}/api/users/get-artisan/${userId}/`
        );
        const artisanData = await artisanRes.json();

        const artisanId = artisanData.artisan_id;
        if (!artisanId) {
          console.log("❌ No artisan found for this user");
          return;
        }

        // 2️⃣ Get products of this artisan
        const prodRes = await fetch(
          `${API_URL}/api/products/product/shop/${artisanId}/`
        );
        const prodData = await prodRes.json();

        setSellerProducts(prodData.products || prodData);
      } catch (err) {
        console.error("Failed to load seller products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchSellerProducts();
  }, []);

  // =====================================
  // STATIC PLACEHOLDER FOR RIGHT SIDE
  // =====================================
  const topSellerProducts = [
    {
      icon: require("./images/bag.png"),
      name: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      price: "₱500",
      sales: 10,
    },
    {
      icon: require("./images/bag1.png"),
      name: "Kalpi Habing Ibaan",
      category: "Coin Purse",
      price: "₱349",
      sales: 5,
    },
  ];

  const latestTransactions = allTransactions.slice(0, 2);

  // =====================================
  // MAIN RETURN
  // =====================================

  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <span className="dashboard-breadcrumb">
            Home{showHistory ? " > Transaction History" : ""}
          </span>
        </div>

        {!showHistory ? (
          <div className="dashboard-main">
            <div className="dashboard-left">

              {/* =======================
                  TODO LIST
              ======================== */}
              <div className="dashboard-card">
                <h3>To Do List</h3>
                <div className="todo-list-items">
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=order-request")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Pending Orders</span>
                  </div>

                  <div className="todo-item" onClick={() => navigate("/order-list?tab=to-ship")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">To-Process Shipment</span>
                  </div>

                  <div className="todo-item" onClick={() => navigate("/order-list?tab=shipped")}>
                    <span className="todo-count">10</span>
                    <span className="todo-label">Processed Shipment</span>
                  </div>

                  <div className="todo-item" onClick={() => navigate("/order-list?tab=delivered")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Delivered</span>
                  </div>

                  <div className="todo-item" onClick={() => navigate("/order-list?tab=refund-cancel")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Return/Refund/Cancel</span>
                  </div>
                </div>
              </div>

              {/* =======================
                  BUSINESS INSIGHTS
              ======================== */}
              <div className="dashboard-row" style={{ gap: "24px", marginBottom: "24px" }}>
                <div className="dashboard-card business-insights" style={{ flex: 1 }}>
                  <h4>Business Insights</h4>
                  <div style={{ display: "flex", gap: "32px", marginTop: "48px" }}>
                    <div>
                      <span>Sales</span>
                      <div>₱5,478</div>
                    </div>
                    <div>
                      <span>Orders</span>
                      <div>14</div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card graph-card" style={{ flex: 1 }}>
                  {/* Future chart here */}
                </div>
              </div>

              {/* ===========================
                 TRANSACTION HISTORY
              ============================ */}
              <div className="dashboard-card" onClick={() => navigate("/dashboard/transaction-history")}>
                <h4>Transaction History</h4>
                <div className="transaction-history-list">
                  {latestTransactions.map((tx, idx) => (
                    <div key={idx} className="transaction-row">
                      <span>{tx.orderId}</span>
                      <img src={tx.icon} alt={tx.name} />
                      <div>
                        <span>{tx.name}</span>
                        <span>{tx.category}</span>
                      </div>
                      <span>{tx.price}</span>
                      <span>{tx.status}</span>
                      <span>{tx.date}</span>
                    </div>
                  ))}
                </div>

                <button className="export-report-btn">View All Transactions</button>
              </div>

              {/* ===========================
                 UPDATED PRODUCT SECTION
              ============================ */}
              <div className="dashboard-card products-card" style={{ marginTop: "24px" }}>
                <span className="products-count">Products ({sellerProducts.length})</span>

                <div className="products-list" style={{ marginTop: "12px" }}>
                  {loadingProducts ? (
                    <p>Loading your products...</p>
                  ) : sellerProducts.length > 0 ? (
                    sellerProducts.map((product) => {
                      const imageUrl =
                        product.main_image
                          ? getImageUrl(product.main_image)
                          : product.images?.length > 0
                          ? getImageUrl(product.images[0].image)
                          : "https://via.placeholder.com/150?text=No+Image";

                      const stockStatus = product.stock <= 10 ? "Low Stock" : "In Stock";
                      const statusClass = product.stock <= 10 ? "status-lowstock" : "status-good";

                      return (
                        <div
                          key={product.id}
                          className="product-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 0.5fr 0.7fr 1fr 1fr",
                            padding: "12px 0",
                            borderBottom: "1px solid #eee",
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {/* Product image + name */}
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <img
                              src={imageUrl}
                              alt={product.name}
                              style={{ width: "48px", height: "48px", borderRadius: "8px" }}
                            />
                            <div>
                              <span style={{ fontWeight: 500 }}>{product.name}</span>
                              <br />
                              <span style={{ fontSize: ".9rem", color: "#7c6a58" }}>
                                {product.category}
                              </span>
                            </div>
                          </div>

                          {/* Stock */}
                          <span style={{ textAlign: "center" }}>{product.stock}</span>

                          {/* Price */}
                          <span style={{ textAlign: "center" }}>
                            ₱{product.sales_price || product.regular_price}
                          </span>

                          {/* Status */}
                          <span
                            className={`product-status ${statusClass}`}
                            style={{
                              textAlign: "center",
                              padding: "4px 12px",
                              borderRadius: "12px",
                            }}
                          >
                            {stockStatus}
                          </span>

                          {/* Date */}
                          <span style={{ textAlign: "center", color: "#b8a48a" }}>
                            {product.created_at?.slice(0, 10)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p>No products available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===========================
                RIGHT SIDE CARDS
            ============================ */}
            <div className="dashboard-right">
              <div className="dashboard-card shop-performance-card">
                <h4>Shop Performance</h4>
                <div className="shop-performance-status">EXCELLENT</div>
              </div>

              <div className="dashboard-card">
                <h4>Top Seller Products</h4>
                {topSellerProducts.map((prod, idx) => (
                  <div key={idx} className="top-seller-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <img src={prod.icon} alt={prod.name} style={{ width: "48px" }} />
                      <div>
                        <span>{prod.name}</span>
                        <br />
                        <span style={{ color: "#7c6a58" }}>{prod.category}</span>
                        <br />
                        <span>{prod.price}</span>
                      </div>
                    </div>

                    <span>{prod.sales} Sales</span>
                  </div>
                ))}
              </div>

              <div className="dashboard-card forecast-card">
                <h4>Forecast & Trends</h4>
                <span>[Graphs Coming Soon]</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-main">
            <div className="dashboard-card">
              <h3>Transaction History</h3>
              <input
                type="text"
                placeholder="Search Orders"
                style={{
                  borderRadius: "20px",
                  padding: "4px 16px",
                  border: "1px solid #ccc",
                  width: "220px",
                }}
              />

              <div className="transaction-history-list">
                {allTransactions.map((tx, idx) => (
                  <div key={idx} className="transaction-row">
                    <span>{tx.orderId}</span>
                    <img src={tx.icon} alt={tx.name} />
                    <span>{tx.name}</span>
                    <span>{tx.price}</span>
                    <span>{tx.status}</span>
                    <span>{tx.date}</span>
                  </div>
                ))}
              </div>

              <button className="export-report-btn" onClick={() => setShowHistory(false)}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomeDashboard;
