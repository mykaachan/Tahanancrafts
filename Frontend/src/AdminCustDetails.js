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

export default function AdminCustDetails() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);
  return (
    <div className="admindash-container">
      {/* ===== SIDEBAR ===== */}
      <AdminSidebar />
      {/* ===== MAIN CONTENT ===== */}
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search customers..."
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
          <h2>Customer Details</h2>
        </div>
        {/* ===== CUSTOMER DETAILS CONTENT ===== */}
        <div className="customer-details">
          {/* LEFT: Customer Profile Card */}
          <div className="cust-profile-card">
            <img
              src="https://via.placeholder.com/100"
              alt="Customer"
              className="cust-avatar"
            />
            <h3>Mikaela Mindanao</h3>
            <p className="cust-username">@Mikaela_M40</p>
            <hr />
            {/* ===== ICON INFO LIST ===== */}
            <div className="cust-info-list">
              <p>
                <FaUser className="cust-icon" />
                <strong>User ID:</strong> ID-0112233
              </p>
              <p>
                <FaEnvelope className="cust-icon" />
                <strong>Billing Email:</strong> Mikaelam@email.com
              </p>
              <p>
                <FaPhone className="cust-icon" />
                <strong>Phone:</strong> 09999999999
              </p>
              <p>
                <FaMapMarkerAlt className="cust-icon" />
                <strong>Delivery Address:</strong> Villa Maria Subdivision, Cahigam, Rosario Batangas
              </p>
              <p>
                <FaCalendarAlt className="cust-icon" />
                <strong>Latest Transaction:</strong> 1 May 2025
              </p>
            </div>
          </div>
          {/* RIGHT: Summary Cards and Transaction History */}
          <div className="cust-summary">
            {/* ===== Summary Cards ===== */}
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Spent</h4>
                <p className="amount">₱1,249</p>
              </div>
              <div className="cust-card orders">
                <h4>Total Orders</h4>
                <p className="amount">3</p>
              </div>
              <div className="cust-card refunds">
                <h4>Total Refunds</h4>
                <p className="amount">0</p>
              </div>
            </div>
            {/* ===== Transaction History ===== */}
            <div className="cust-history">
              <div className="cust-history-header">
                <h4>Transaction History</h4>
                <input type="text" placeholder="Search..." />
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
                  <tr>
                    <td>#101011</td>
                    <td>
                      <div className="cust-prod">
                        <img
                          src="https://via.placeholder.com/40"
                          alt="Basket"
                        />
                        <div>
                          <p>Iraya Basket Lipa</p>
                          <small>Basket</small>
                        </div>
                      </div>
                    </td>
                    <td>₱550</td>
                    <td>
                      <span className="status-badge active">Processing</span>
                    </td>
                    <td>1 May 2025</td>
                  </tr>
                  <tr>
                    <td>#101012</td>
                    <td>
                      <div className="cust-prod">
                        <img
                          src="https://via.placeholder.com/40"
                          alt="Coin Purse"
                        />
                        <div>
                          <p>Kalpi Habing Ibaan</p>
                          <small>Coin Purse</small>
                        </div>
                      </div>
                    </td>
                    <td>₱699</td>
                    <td>
                      <span className="status-badge active">Processing</span>
                    </td>
                    <td>1 May 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
