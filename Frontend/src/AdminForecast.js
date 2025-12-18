import React, { useState } from "react";
import "./AdminDash.css"; 
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa6";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export default function AdminForecast() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "📈 Forecast data updated",
    "🧺 New artisan trend identified",
    "💬 Market insight report generated",
  ]);
  const salesData = [
    { name: "Jan", value: 9800 },
    { name: "Feb", value: 10200 },
    { name: "Mar", value: 10800 },
    { name: "Apr", value: 11200 },
    { name: "May", value: 11800 },
    { name: "Jun", value: 12400 },
    { name: "Jul", value: 16800 }, // peak aligns with July 2025 spike
    { name: "Aug", value: 13200 },
    { name: "Sep", value: 13800 },
    { name: "Oct", value: 14200 },
    { name: "Nov", value: 13600 },
    { name: "Dec", value: 15800 },
  ];
  const trendingCategories = [
    { rank: 1, category: "Clothing", growth: "+42.6%", top: "Traditional Barong" },
    { rank: 2, category: "Home Decor", growth: "+35.1%", top: "Vase" },
    { rank: 3, category: "Placemat", growth: "+28.4%", top: "Floor Mat" },
    { rank: 4, category: "Bag", growth: "+22.9%", top: "Stylish Bag" },
  ];

  const productTrends = [
    {
      name: "Traditional Barong",
      type: "Clothing",
      growth: "+47%",
      tag: "High Demand Forecast",
      img: "http://127.0.0.1:8000/media/products/main/barong.png",
    },
    {
      name: "Vase",
      type: "Home Decor",
      growth: "+34%",
      tag: "Trending Soon",
      img: "http://127.0.0.1:8000/media/media/products/main/20087121_50173208_600.webp",
    },
    {
      name: "Floor Mat",
      type: "Home Decor",
      growth: "+29%",
      tag: "Seasonal Demand",
      img: "http://127.0.0.1:8000/media/products/main/mat.png",
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
        {/* ===== PAGE TITLE ===== */}
        <div className="admindash-welcome">
          <h2>Forecast & Trends</h2>
        </div>
        {/* ===== MAIN FORECAST SECTION ===== */}
        <div className="forecast-container">
          {/* SALES TREND + TRENDING CATEGORIES */}
          <div className="forecast-top">
            <div className="sales-trend-card">
              <div className="chart-header">
                <h3>Sales Trend</h3>
                <select>
                  <option>All Category</option>
                  <option>Bags</option>
                  <option>Home Decor</option>
                  <option>Accessories</option>
                </select>
                <select>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#6b5842" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="trending-categories-card">
              <h3>Trending Categories</h3>
              <table className="trending-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Category</th>
                    <th>Forecasted Growth</th>
                    <th>Top Product</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingCategories.map((cat, index) => (
                    <tr key={index}>
                      <td>{cat.rank}</td>
                      <td>{cat.category}</td>
                      <td>{cat.growth}</td>
                      <td>{cat.top}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* PRODUCT TRENDS TABLE */}
          <div className="product-trends-card">
            <h3>Product Trends</h3>
            <table className="product-trends-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Forecasted Growth</th>
                  <th>Tag</th>
                </tr>
              </thead>
              <tbody>
                {productTrends.map((prod, i) => (
                  <tr key={i}>
                    <td>
                      <div className="product-info">
                        <img src={prod.img} alt={prod.name} />
                        <div>
                          <p>{prod.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>{prod.type}</td>
                    <td>{prod.growth}</td>
                    <td>{prod.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
