import React, { useEffect, useState, useMemo } from "react";
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

export default function AdminDash() {
  const BASE_URL = "https://tahanancrafts.onrender.com";

  // -------------------------------------
  // STATE
  // -------------------------------------
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("monthly");

  const notifications = [
    "🧺 New artisan shop registered",
    "📦 An order has been delivered",
    "💬 New message from a customer",
  ];

  // -------------------------------------
  // FETCH DASHBOARD DATA
  // -------------------------------------
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/admin/dashboard/")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  // -------------------------------------
  // MONTHLY REVENUE (SAFE useMemo)
  // -------------------------------------
  const monthlyData = useMemo(() => {
    return data?.analytics?.monthly_platform_revenue || [];
  }, [data]);

  // AVAILABLE YEARS
  const availableYears = useMemo(() => {
    return [...new Set(monthlyData.map((i) => i.year))];
  }, [monthlyData]);

  // SET DEFAULT YEAR
  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const revenue = Number(payload[0].value); // platform revenue for that month
    const totalSales = revenue / 0.08;        // since 8% of sales = platform revenue
    const artisanEarnings = totalSales * 0.92;

    return (
      <div
        style={{
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "13px"
        }}
      >
        <strong>{label}</strong>
        <br />

        <span>Platform Revenue (8%): ₱{revenue.toFixed(2)}</span>
        <br />
        
        <span>Total Sales: ₱{totalSales.toFixed(2)}</span>
        <br />

        <span>Artisan Total Earnings: ₱{artisanEarnings.toFixed(2)}</span>
      </div>
    );
  };

  const SOLD_STATUSES = ["delivered", "completed", "to_review"];

  function getProductId(item) {
    if (typeof item.product === "number") return item.product;
    if (item.product?.id) return item.product.id;
    return item.product_id || null;
  }

  function getQty(item) {
    return Number(item.quantity) || 0;
  }

  const topProducts = useMemo(() => {
    if (!data) return [];

    const products = data.lists.products;
    const orders = data.lists.orders;
    const artisans = data.lists.artisans;

    return products
      .map((product) => {
        const sold = orders.reduce((total, order) => {
          if (!SOLD_STATUSES.includes(order.status)) return total;
          if (!order.items) return total;

          return (
            total +
            order.items.reduce((sub, item) => {
              return getProductId(item) === product.id ? sub + getQty(item) : sub;
            }, 0)
          );
        }, 0);

        return {
          ...product,
          price: product.sales_price || product.regular_price,
          image: product.main_image ? product.main_image : null,
          artisan_name:
            artisans.find((a) => a.id === product.artisan)?.name ||
            "Unknown Artisan",
          sold,
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [data]);

  // -------------------------------------
  // RECENT ORDERS
  // -------------------------------------
  const recentOrders = useMemo(() => {
    if (!data) return [];
    return [...data.lists.orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [data]);

  // -------------------------------------
  // CHART DATA
  // -------------------------------------
  const chartData = useMemo(() => {
    if (!selectedYear) return [];

    const yearData = monthlyData.filter((m) => m.year === selectedYear);

    if (selectedFilter === "monthly") {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months.map((name, i) => {
        const m = yearData.find((d) => d.month === i + 1);
        return { name, revenue: m ? Number(m.total) : 0 };
      });
    }

    if (selectedFilter === "quarterly") {
      return ["Q1", "Q2", "Q3", "Q4"].map((label, i) => {
        const start = i * 3 + 1;
        const end = start + 2;

        const sum = yearData
          .filter((d) => d.month >= start && d.month <= end)
          .reduce((acc, cur) => acc + Number(cur.total), 0);

        return { name: label, revenue: sum };
      });
    }

    if (selectedFilter === "yearly") {
      const total = yearData.reduce((acc, m) => acc + Number(m.total), 0);
      return [{ name: selectedYear.toString(), revenue: total }];
    }

    return [];
  }, [selectedYear, selectedFilter, monthlyData]);

  // -------------------------------------
  // NOW: EARLY RETURN (AFTER ALL HOOKS)
  // -------------------------------------
  if (loading || !data) {
    return <div className="admindash-loading">Loading Dashboard...</div>;
  }

  const analytics = data.analytics;
  const lists = data.lists;

  // -------------------------------------
  // RENDER
  // -------------------------------------
  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">

        {/* HEADER */}
        <header className="admindash-header">
          <input className="admindash-search" placeholder="🔍 Search" />
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
                    {notifications.map((notif, idx) => (
                      <li key={idx}>{notif}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        {/* WELCOME */}
        <div className="admindash-welcome">
          <h2>Welcome Back, Admin!</h2>
        </div>

        {/* CARDS */}
        <div className="admindash-cards">
          <div className="admindash-card beige">
            <FaUsers className="admindash-icon" />
            <div>
              <h3>Total Customers</h3>
              <p>{analytics.total_customers}</p>
            </div>
          </div>

          <div className="admindash-card taupe">
            <FaStore className="admindash-icon" />
            <div>
              <h3>Total Artisan Shops</h3>
              <p>{analytics.total_artisans}</p>
            </div>
          </div>

          <div className="admindash-card lightgray">
            <FaCartShopping className="admindash-icon" />
            <div>
              <h3>Total Orders</h3>
              <p>{analytics.total_orders}</p>
            </div>
          </div>

          <div className="admindash-card green">
            <FaPesoSign className="admindash-icon" />
            <div>
              <h3>Revenue</h3>
              <p>₱{analytics.platform_revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="admindash-maincontent">
          {/* CHART */}
          <div className="admindash-chart">
            <div className="chart-header">
              <h3>Platform Revenue</h3>

              <div className="chart-filters">
                <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <select value={selectedYear || ""} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#ddd" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#6b5842" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="admindash-side">
            {/* TOP PRODUCTS */}
            <div className="top-products">
              <h3>Top Selling Products</h3>

              {topProducts.map((item) => (
                <div key={item.id} className="product-item">
                  <img
                    src={item.image ? BASE_URL + item.image : "https://via.placeholder.com/40"}
                    alt={item.name}
                  />

                  <div className="product-info">
                    <div className="product-text">
                      <p className="product-name">{item.name}</p>
                      <small className="artisan-name">{item.artisan_name}</small>
                    </div>

                    <div className="product-right">
                      <small className="product-price">₱{item.price}</small>
                      <small className="sold-count">{item.sold} sold</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT ORDERS */}
            <div className="recent-orders">
              <h3>Recent Orders</h3>

              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <p>Order #{order.id}</p>
                    <small>₱{order.total_items_amount}</small>
                    <span className={`status ${order.status}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
