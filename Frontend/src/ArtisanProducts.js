// src/ArtisanProducts.js
import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa";

export default function ArtisanProducts() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  const [products] = useState([
    {
      id: 1,
      name: "Product 1",
      category: "Weaved Bag",
      stock: 3,
      price: 500,
      orders: 3,
      status: "Low Stock",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 2,
      name: "Product 2",
      category: "Coin Purse",
      stock: 10,
      price: 349,
      orders: 3,
      status: "On Stock",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 3,
      name: "Product 3",
      category: "Table runner",
      stock: 10,
      price: 149,
      orders: 3,
      status: "On Stock",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 4,
      name: "Product 4",
      category: "Butterfly knife",
      stock: 11,
      price: 349,
      orders: 4,
      status: "On Stock",
      date: "1 May 2025",
      img: "https://via.placeholder.com/40.png?text=Product",
    },
    {
      id: 5,
      name: "Product 5",
      category: "Bucket Hat",
      stock: 15,
      price: 1200,
      orders: 1,
      status: "On Stock",
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
            placeholder="🔍 Search products..."
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
          <h2>Artisan &gt; Products</h2>
        </div>

        {/* ===== PRODUCTS TABLE ===== */}
        <div className="cust-history">
          <table className="cust-history-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cust-prod">
                      <img src={p.img} alt={`Placeholder ${p.id}`} />
                      <div>
                        <p className="prod-name">Placeholder</p>
                        <small className="prod-category">{p.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>{p.stock}</td>
                  <td>₱{p.price}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === "On Stock" ? "active" : "inactive"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.orders}</td>
                  <td>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== PAGINATION ===== */}
          <div className="pagination">
            <span>
              Showing 1 - {products.length} from {products.length}
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
