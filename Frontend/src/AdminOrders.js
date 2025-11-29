// src/AdminOrders.js
import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar"; 
import { FaBell } from "react-icons/fa";
export default function AdminOrders() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);
  const [orders] = useState([
    {
      id: 1,
      orderId: "#2001",
      productName: "Weaved Bag",
      category: "Bag",
      price: 500,
      status: "Pending",
      date: "10 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 2,
      orderId: "#2002",
      productName: "Coin Purse",
      category: "Accessory",
      price: 349,
      status: "Completed",
      date: "11 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 3,
      orderId: "#2003",
      productName: "Table runner",
      category: "Home Decor",
      price: 149,
      status: "Shipped",
      date: "12 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 4,
      orderId: "#2004",
      productName: "Bucket Hat",
      category: "Fashion",
      price: 1200,
      status: "Pending",
      date: "13 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 5,
      orderId: "#2005",
      productName: "Butterfly Knife",
      category: "Tools",
      price: 349,
      status: "Completed",
      date: "14 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
  ]);
  return (
    <div className="admindash-container">
      <AdminSidebar /> {/* ✅ Sidebar included */}
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search orders..."
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
          <h2>Orders &gt; History</h2>
        </div>
        {/* ===== ORDERS TABLE ===== */}
        <div className="cust-history">
          <table className="cust-history-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order ID</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="cust-prod">
                      <img src={o.img} alt={`Product ${o.id}`} />
                      <div>
                        <p className="prod-name">{o.productName}</p>
                        <small className="prod-category">{o.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>{o.orderId}</td>
                  <td>{o.category}</td>
                  <td>₱{o.price}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        o.status === "Completed" || o.status === "Shipped"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* ===== PAGINATION ===== */}
          <div className="pagination">
            <span>
              Showing 1 - {orders.length} from {orders.length}
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
