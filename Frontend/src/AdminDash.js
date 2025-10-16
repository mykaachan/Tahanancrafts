import React, { useState } from "react";
import "./AdminDash.css"; 
import AdminSidebar from "./AdminSidebar";
import {
  FaBell,
  FaUsers,
  FaStore,
  FaCartShopping,
  FaPesoSign,
} from "react-icons/fa6";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ Static data
const data = [
  { name: "Jan", revenue: 20000 },
  { name: "Feb", revenue: 15000 },
  { name: "Mar", revenue: 18000 },
  { name: "Apr", revenue: 8000 },
  { name: "May", revenue: 22000 },
  { name: "Jun", revenue: 16000 },
  { name: "Jul", revenue: 14000 },
  { name: "Aug", revenue: 20000 },
  { name: "Sep", revenue: 23000 },
  { name: "Oct", revenue: 25000 },
  { name: "Nov", revenue: 24000 },
  { name: "Dec", revenue: 26000 },
];

export default function AdminDash() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
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
            placeholder="🔍 Search"
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

        {/* ===== WELCOME SECTION ===== */}
        <div className="admindash-welcome">
          <h2>Welcome Back, Admin!</h2>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="admindash-cards">
          <div className="admindash-card beige">
            <FaUsers className="admindash-icon" />
            <div>
              <h3>Total Customers</h3>
              <p>50</p>
            </div>
          </div>

          <div className="admindash-card taupe">
            <FaStore className="admindash-icon" />
            <div>
              <h3>Total Artisan Shops</h3>
              <p>10</p>
            </div>
          </div>

          <div className="admindash-card lightgray">
            <FaCartShopping className="admindash-icon" />
            <div>
              <h3>Total Orders</h3>
              <p>50</p>
            </div>
          </div>

          <div className="admindash-card green">
            <FaPesoSign className="admindash-icon" />
            <div>
              <h3>Revenue</h3>
              <p>₱200,000</p>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="admindash-maincontent">
          <div className="admindash-chart">
            <div className="chart-header">
              <h3>Revenue Statistics</h3>
              <select>
                <option>All Time</option>
                <option>This Year</option>
                <option>This Month</option>
              </select>
            </div>

            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#6b5842" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admindash-side">
            <div className="top-products">
              <h3>Top Selling Products</h3>
              <div className="product-item">
                <img src="https://via.placeholder.com/40" alt="product" />
                <div className="product-info">
                  <p>Iraya Basket Lipa</p>
                  <small>₱6,000</small>
                  <span className="status low">Low Stock</span>
                </div>
              </div>

              <div className="product-item">
                <img src="https://via.placeholder.com/40" alt="product" />
                <div className="product-info">
                  <p>Kalipi Habing Iban</p>
                  <small>₱3,600</small>
                  <span className="status ok">In Stock</span>
                </div>
              </div>
            </div>

            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <div className="order-item">
                <img src="https://via.placeholder.com/40" alt="order" />
                <div className="order-info">
                  <p>Burdang Taal Lace</p>
                  <small>₱149</small>
                  <span className="status delivered">Delivered</span>
                </div>
              </div>

              <div className="order-item">
                <img src="https://via.placeholder.com/40" alt="order" />
                <div className="order-info">
                  <p>Kalipi Habing Iban</p>
                  <small>₱249</small>
                  <span className="status delivered">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
