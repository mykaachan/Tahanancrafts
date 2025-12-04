import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";

//const API_URL = "http://127.0.0.1:8000"; 
const API_URL = "https://tahanancrafts.onrender.com"; 



function formatPrice(value) {
  if (!value) return "0";
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return " ";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

function formatDateTime(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);

    const date = dt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const time = dt.toLocaleTimeString("en-US", {
      hour12: false, // 24-hour format
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${date}  ${time}`;
  } catch {
    return d;
  }
}

function getImageUrl(path) {
  if (!path) return "https://via.placeholder.com/40?text=No+Image";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

function getStatusStyle(status) {
  const s = status?.toLowerCase();

  // GREEN statuses
  if (["completed", "delivered", "to_review"].includes(s)) {
    return {
      background: "#e6f7e6",
      color: "#2e7d32",
    };
  }

  // RED statuses
  if (["cancelled"].includes(s)) {
    return {
      background: "#ffe6e6",
      color: "#d32f2f",
    };
  }

  // YELLOW (others like pending, awaiting, processing)
  return {
    background: "#fff8e1",
    color: "#b28900",
  };
}


const TransactionHistory = () => {
  const navigate = useNavigate();
  const artisanId = localStorage.getItem("artisan_id");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  
  
  // Fetch API data
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_URL}/api/products/dashboard/history/${artisanId}/`);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed loading history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [artisanId]);

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
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderRadius: "20px",
                  padding: "4px 16px",
                  border: "1px solid #ccc",
                  width: "220px",
                }}
              />

            </div>

            <div className="transaction-history-list" style={{ marginTop: "16px" }}>
              <div
                className="transaction-history-list-header"
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1.5fr 240px 170px 100px",
                  fontWeight: "bold",
                  color: "#4d3c2e",
                  marginBottom: "8px",
                }}
              >
                <span>Order ID</span>
                <span>Product</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                // ⭐⭐⭐ APPLY SEARCH FILTER HERE ⭐⭐⭐
                transactions
                  .filter((tx) => {
                    if (!searchQuery.trim()) return true;

                    const q = searchQuery.toLowerCase();

                    return (
                      String(tx.order_id).includes(q) ||
                      `#${tx.order_id}`.includes(q) ||
                      tx.product_name?.toLowerCase().includes(q) ||
                      tx.product_description?.toLowerCase().includes(q) ||
                      tx.status?.toLowerCase().includes(q) ||
                      String(tx.item_total)?.includes(q) ||
                      formatDateTime(tx.created_at)?.toLowerCase().includes(q)
                    );
                  })
                  .map((tx, idx) => {
                    const total = formatPrice(tx.item_total);
                    const img = getImageUrl(tx.image);

                    return (
                      <div
                        key={idx}
                        className="transaction-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1.5fr 300px 200px 140px",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {/* Order ID */}
                        <span className="transaction-order-id">#{tx.order_id}</span>

                        {/* Product */}
                        <div
                          className="transaction-product"
                          style={{ display: "flex", gap: "12px", alignItems: "center" }}
                        >
                          <img
                            src={img}
                            alt={tx.product_name}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              background: "#f7f0e4",
                            }}
                          />

                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600, color: "#4d3c2e" }}>
                              {tx.product_name}
                            </span>
                            <span style={{ fontSize: "0.9rem", color: "#7c6a58" }}>
                              {tx.product_description}
                            </span>
                            <span style={{ fontSize: "0.9rem", color: "#7c6a58" }}>
                              Quantity: {tx.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Total */}
                        <span style={{ color: "#4d3c2e", fontSize: "1rem" }}>
                          ₱{total}
                        </span>

                        {/* Status */}
                        <span
                          style={{
                            ...getStatusStyle(tx.status),
                            padding: "4px 12px",
                            borderRadius: "12px",
                            textAlign: "center",
                            fontWeight: 500,
                            fontSize: "0.95rem",
                            display: "inline-block",
                          }}
                        >
                          {tx.status}
                        </span>

                        {/* Date */}
                        <span style={{ fontSize: "1rem", color: "#b8a48a" }}>
                          {formatDate(tx.created_at)}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
            <button
              className="export-report-btn"
              style={{ marginTop: "16px" }}
              onClick={() => navigate("/seller-dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
