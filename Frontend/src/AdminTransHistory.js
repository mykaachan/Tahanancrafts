// src/AdminTransHistory.js
import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa";
export default function AdminTransHistory() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);
  const [transactions] = useState([
    {
      id: 1,
      orderId: "#1001",
      category: "Weaved Bag",
      price: 500,
      status: "Completed",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 2,
      orderId: "#1002",
      category: "Coin Purse",
      price: 349,
      status: "Pending",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 3,
      orderId: "#1003",
      category: "Table runner",
      price: 149,
      status: "Completed",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 4,
      orderId: "#1004",
      category: "Butterfly knife",
      price: 349,
      status: "Shipped",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 5,
      orderId: "#1005",
      category: "Bucket Hat",
      price: 1200,
      status: "Pending",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
  ]);
  return (
    <div className="admindash-container">
      <AdminSidebar />
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search transactions..."
          />
          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
              {notifications.length > 0 && <span className="notif-dot"></span>}
              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {notifications.map((notif, index) => (
                      <li key={index}>{notif}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>
        {/* ===== PAGE TITLE ===== */}
        <div className="admindash-welcome">
          <h2>Transactions &gt; History</h2>
        </div>
        {/* ===== TRANSACTIONS TABLE ===== */}
        <div className="cust-history">
          <table className="cust-history-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order ID</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="cust-prod">
                      <img src={t.img} alt={`Placeholder ${t.id}`} />
                      <div>
                        <p className="prod-name">Placeholder</p>
                        <small className="prod-category">{t.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>{t.orderId}</td>
                  <td>₱{t.price}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        t.status === "Completed" || t.status === "Shipped"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* ===== PAGINATION ===== */}
          <div className="pagination">
            <span>
              Showing 1 - {transactions.length} from {transactions.length}
            </span>
            <div className="pagination-buttons">
              <button disabled>&lt;</button>
              <button className="active">1</button>
              <button disabled>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
