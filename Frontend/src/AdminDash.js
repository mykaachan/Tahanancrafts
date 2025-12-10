import React, { useEffect, useState, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { FaUsers, FaStore, FaCartShopping, FaPesoSign } from "react-icons/fa6";

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
  //const BASE_URL = "https://tahanancrafts.onrender.com";
  const BASE_URL = "http://127.0.0.1:8000";


  // STATE
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("monthly");

  // Profile & Change Password Popups
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);


  // FETCH DASHBOARD DATA
  useEffect(() => {
    fetch("https://tahanancrafts.onrender.com/api/products/admin/dashboard/")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  // MONTHLY REVENUE DATA
  const monthlyData = useMemo(() => {
    return data?.analytics?.monthly_platform_revenue || [];
  }, [data]);

  const availableYears = useMemo(() => {
    return [...new Set(monthlyData.map((i) => i.year))];
  }, [monthlyData]);

  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  // CUSTOM TOOLTIP FOR CHART
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const revenue = Number(payload[0].value);
    const totalSales = revenue / 0.08; 
    const artisanEarnings = totalSales * 0.92;

    return (
      <div
        style={{
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "13px",
        }}
      >
        <strong>{label}</strong><br />
        Platform Revenue (8%): ₱{revenue.toFixed(2)}<br />
        Total Sales: ₱{totalSales.toFixed(2)}<br />
        Artisan Earnings: ₱{artisanEarnings.toFixed(2)}
      </div>
    );
  };

  // PRODUCT UTILITIES
  const SOLD_STATUSES = ["delivered", "completed", "to_review"];

  function getProductId(item) {
    if (typeof item.product === "number") return item.product;
    if (item.product?.id) return item.product.id;
    return item.product_id || null;
  }

  function getQty(item) {
    return Number(item.quantity) || 0;
  }

  // TOP SELLING PRODUCTS (Top 3)
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
              return getProductId(item) === product.id
                ? sub + getQty(item)
                : sub;
            }, 0)
          );
        }, 0);

        return {
          ...product,
          price: product.sales_price || product.regular_price,
          image: product.main_image || null,
          artisan_name:
            artisans.find((a) => a.id === product.artisan)?.name ||
            "Unknown Artisan",
          sold,
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3);
  }, [data]);

  // TOP ARTISAN BASED ON SALES
  const topArtisan = useMemo(() => {
    if (!data) return null;

    const orders = data.lists.orders;
    const products = data.lists.products;
    const artisans = data.lists.artisans;

    const artisanSales = {};

    orders.forEach((order) => {
      if (!SOLD_STATUSES.includes(order.status)) return;
      if (!order.items) return;

      order.items.forEach((item) => {
        const productId = getProductId(item);
        const qty = getQty(item);
        const product = products.find((p) => p.id === productId);

        if (!product) return;

        const artisanId = product.artisan;
        const price = Number(product.sales_price || product.regular_price);

        if (!artisanSales[artisanId]) artisanSales[artisanId] = 0;
        artisanSales[artisanId] += price * qty;
      });
    });

    const entries = Object.entries(artisanSales);
    if (entries.length === 0) return null;

    const [id, sales] = entries.sort((a, b) => b[1] - a[1])[0];
    const artisan = artisans.find((a) => a.id === Number(id));

    return artisan
      ? { name: artisan.name, total_sales: sales }
      : null;
  }, [data]);

  // EXTRACT ORDER PREVIEW (IMAGE, PRODUCT NAME, ARTISAN NAME)
  function extractOrderPreview(order, products, artisans) {
    if (!order.items || order.items.length === 0) {
      return { image: null, productName: "No items", artisanName: "" };
    }

    const firstItem = order.items[0];
    const productId = getProductId(firstItem);

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { image: null, productName: "Unknown Product", artisanName: "" };
    }

    const artisan = artisans.find((a) => a.id === product.artisan);

    return {
      image: product.main_image || null,
      productName: product.name,
      artisanName: artisan ? artisan.name : "Unknown Artisan",
    };
  }

  // RECENT ORDERS (Top 3)
  const recentOrders = useMemo(() => {
    if (!data) return [];
    return [...data.lists.orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [data]);

  // CHART DATA BUILDING
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

  if (loading || !data) {
    return <div className="admindash-loading">Loading Dashboard...</div>;
  }

  const analytics = data.analytics;
  const lists = data.lists;

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <AdminHeader
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          setShowProfilePopup={setShowProfilePopup}
        />

        {/* WELCOME */}
        <div className="admindash-welcome">
          <h2>Welcome Back, Admin!</h2>
        </div>

        {/* CARDS (4 per row — Option A) */}
        <div className="admindash-cards">
          
          {/* 1 */}
          <div className="admindash-card beige">
            <FaUsers className="admindash-icon" />
            <div>
              <h3>Total Customers</h3>
              <p>{analytics.total_customers}</p>
            </div>
          </div>

          {/* 2 */}
          <div className="admindash-card taupe">
            <FaStore className="admindash-icon" />
            <div>
              <h3>Total Artisan Shops</h3>
              <p>{analytics.total_artisans}</p>
            </div>
          </div>

          {/* 3 */}
          <div className="admindash-card lightgray">
            <FaCartShopping className="admindash-icon" />
            <div>
              <h3>Total Orders</h3>
              <p>{analytics.total_orders}</p>
            </div>
          </div>

          {/* 4 */}
          <div className="admindash-card green">
            <FaPesoSign className="admindash-icon" />
            <div>
              <h3>Platform Revenue</h3>
              <p>₱{analytics.platform_revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* 5 NEW */}
          <div className="admindash-card yellow">
            <FaPesoSign className="admindash-icon" />
            <div>
              <h3>Artisan Earnings</h3>
              <p>₱{analytics.artisan_total_earnings.toLocaleString()}</p>
            </div>
          </div>

          {/* 6 NEW */}
          <div className="admindash-card blue">
            <FaPesoSign className="admindash-icon" />
            <div>
              <h3>Total Sales</h3>
              <p>₱{analytics.total_sales.toLocaleString()}</p>
            </div>
          </div>

          {/* 7 NEW */}
          <div className="admindash-card purple">
            <FaStore className="admindash-icon" />
            <div>
              <h3>Top Artisan</h3>
              {topArtisan ? (
                <>
                  <p>{topArtisan.name}</p>
                  <small>₱{topArtisan.total_sales.toLocaleString()} sales</small>
                </>
              ) : (
                <p>No sales yet</p>
              )}
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
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <select 
                  value={selectedYear || ""}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
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

            {/* TOP 3 PRODUCTS */}
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

            {/* TOP 3 RECENT ORDERS */}
            <div className="recent-orders">
              <h3>Recent Orders</h3>

              {recentOrders.map((order) => {
                const preview = extractOrderPreview(order, lists.products, lists.artisans);

                return (
                  <div key={order.id} className="order-item styled-order">

                    <img
                      src={preview.image ? BASE_URL + preview.image : "https://via.placeholder.com/40"}
                      alt={preview.productName}
                      className="order-thumb"
                    />

                    <div className="order-text">
                      <p className="order-title">Order #{order.id}</p>
                      <p className="order-product">{preview.productName}</p>
                      <small className="order-artisan">{preview.artisanName}</small>
                    </div>

                    <div className="order-right">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                      <p className="order-total">₱{order.grand_total || order.total_items_amount}</p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
