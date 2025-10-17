import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import {
  FaBell,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function AdminArtisanDetails() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  const [artisan] = useState({
    name: "Sm Sunrise Weaving Association",
    shop: "Habing Ibaan",
    sellerId: "ID-FFF012",
    email: "habingibaan@email.com",
    phone: "09888888888",
    address: "V537+RX2, Ibaan, Batangas",
    logo: "https://via.placeholder.com/100x100.png?text=Logo",
    totalRevenue: 5478,
    totalOrders: 14,
    totalRefunds: 0,
    latestTransaction: "1 May 2025",
  });

  const transactions = [
    {
      id: "#101011",
      product: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      total: 1500,
      status: "Processing",
      date: "1 May 2025",
      img: "https://via.placeholder.com/60.png?text=Product",
    },
  ];

  const products = [
    {
      id: 1,
      name: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      stock: 10,
      price: 500,
      status: "Low Stock",
      date: "1 May 2025",
      img: "https://via.placeholder.com/60.png?text=Product",
    },
  ];

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search artisan details..."
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
          <h2>Artisan Details</h2>
        </div>

        {/* ===== ARTISAN DETAILS PAGE ===== */}
        <div className="customer-details">
          {/* LEFT: Summary & Tables */}
          <div className="cust-summary">
            {/* Summary Cards */}
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Revenue</h4>
                <p className="amount">₱{artisan.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="cust-card orders">
                <h4>Total Orders</h4>
                <p className="amount">{artisan.totalOrders}</p>
              </div>
              <div className="cust-card refunds">
                <h4>Total Refunds</h4>
                <p className="amount">{artisan.totalRefunds}</p>
              </div>
            </div>

            {/* Transaction History */}
            <div className="cust-history">
              <div className="cust-history-header">
                <h4>Transaction History</h4>
              </div>
              <table className="cust-history-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>
                        <div className="cust-prod">
                          <img src={t.img} alt={t.product} />
                          <div>
                            <p className="prod-name">{t.product}</p>
                            <p className="prod-category">{t.category}</p>
                          </div>
                        </div>
                      </td>
                      <td>₱{t.total.toLocaleString()}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            t.status === "Processing" ? "active" : "inactive"
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
            </div>

            {/* Products Table */}
            <div className="cust-history">
              <div className="cust-history-header">
                <h4>Products ({products.length})</h4>
              </div>
              <table className="cust-history-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="cust-prod">
                          <img src={p.img} alt={p.name} />
                          <div>
                            <p className="prod-name">{p.name}</p>
                            <p className="prod-category">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td>{p.stock}</td>
                      <td>₱{p.price}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            p.status === "Low Stock" ? "inactive" : "active"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Profile Card with Icons */}
          <div className="cust-profile-card">
            <img src={artisan.logo} alt="artisan-logo" className="cust-avatar" />
            <h3 className="cust-name">{artisan.name}</h3>
            <p className="cust-username">{artisan.shop}</p>
            <hr />

            {/* Icon Info List */}
            <div className="cust-info-list">
              <p>
                <FaUser className="cust-icon" />
                <strong>Seller ID:</strong> {artisan.sellerId}
              </p>
              <p>
                <FaEnvelope className="cust-icon" />
                <strong>Email:</strong> {artisan.email}
              </p>
              <p>
                <FaPhone className="cust-icon" />
                <strong>Phone:</strong> {artisan.phone}
              </p>
              <p>
                <FaMapMarkerAlt className="cust-icon" />
                <strong>Address:</strong> {artisan.address}
              </p>
              <p>
                <FaCalendarAlt className="cust-icon" />
                <strong>Latest Transaction:</strong> {artisan.latestTransaction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
