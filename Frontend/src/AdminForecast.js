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
    { name: "Jan", value: 12000 },
    { name: "Feb", value: 9500 },
    { name: "Mar", value: 11000 },
    { name: "Apr", value: 8000 },
    { name: "May", value: 14000 },
    { name: "Jun", value: 10000 },
    { name: "Jul", value: 13000 },
    { name: "Aug", value: 15000 },
    { name: "Sep", value: 12500 },
    { name: "Oct", value: 16000 },
    { name: "Nov", value: 12000 },
    { name: "Dec", value: 14500 },
  ];
  const trendingCategories = [
    { rank: 1, category: "Home Decor", growth: "+28.5%", top: "Burdang Taal" },
    { rank: 2, category: "Kitchen Ware", growth: "+19.3%", top: "Kalis Taal" },
    { rank: 3, category: "Furniture", growth: "+15.1%", top: "Iraya Basket" },
    { rank: 4, category: "Accessories", growth: "+9.8%", top: "Kalipi Habing Iban" },
  ];
  const productTrends = [
    {
      name: "Saklit Habing Ibaan",
      type: "Bag",
      growth: "+42%",
      tag: "Trending Soon!",
      img: "https://via.placeholder.com/40",
    },
    {
      name: "Kalipi Habing Ibaan",
      type: "Bag",
      growth: "+36%",
      tag: "Expected Demand!",
      img: "https://via.placeholder.com/40",
    },
    {
      name: "Burdang Taal Lace",
      type: "Home Decor",
      growth: "+30%",
      tag: "Trending Soon!",
      img: "https://via.placeholder.com/40",
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
                  <option>2025</option>
                  <option>2024</option>
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
