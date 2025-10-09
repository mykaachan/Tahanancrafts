import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";

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

const TransactionHistory = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <span className="dashboard-breadcrumb">Home &gt; Transaction History</span>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-card" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>Transaction History</h3>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <input type="text" placeholder="Search" style={{ borderRadius: "20px", padding: "4px 16px", border: "1px solid #ccc", width: "220px" }} />
            </div>
            <div className="transaction-history-list" style={{ marginTop: "16px" }}>
              <div className="transaction-history-list-header" style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 120px 120px 120px", alignItems: "center", fontWeight: "bold", color: "#4d3c2e", marginBottom: "8px" }}>
                <span>Order ID</span>
                <span>Product</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              {allTransactions.map((tx, idx) => (
                <div key={idx} className="transaction-row" style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 120px 120px 120px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <span className="transaction-order-id">{tx.orderId}</span>
                  <div className="transaction-product" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={tx.icon} alt={tx.name} className="transaction-product-image" style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f7f0e4", objectFit: "cover" }} />
                    <div className="transaction-product-details" style={{ display: "flex", flexDirection: "column" }}>
                      <span className="transaction-product-name" style={{ fontWeight: 500, color: "#4d3c2e" }}>{tx.name}</span>
                      <span className="transaction-product-category" style={{ fontSize: "0.95rem", color: "#7c6a58" }}>{tx.category}</span>
                      <span className="transaction-product-stock" style={{ fontSize: "0.95rem", color: "#7c6a58" }}>{tx.stock} pcs</span>
                    </div>
                  </div>
                  <span className="transaction-product-total" style={{ fontSize: "1rem", color: "#4d3c2e" }}>{tx.price}</span>
                  <span className="transaction-product-status" style={{ background: "#e6f7e6", color: "#2e7d32", padding: "4px 12px", borderRadius: "12px", fontWeight: 500, fontSize: "0.95rem", textAlign: "center", display: "inline-block" }}>{tx.status}</span>
                  <span className="transaction-product-date" style={{ fontSize: "1rem", color: "#b8a48a" }}>{tx.date}</span>
                </div>
              ))}
            </div>
            <button className="export-report-btn" style={{ marginTop: "16px" }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
