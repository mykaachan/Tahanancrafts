import React, { useEffect, useState, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { FaUsers, FaStore, FaCartShopping, FaPesoSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

//const BASE_URL = "http://127.0.0.1:8000";
const BASE_URL = "https://tahanancrafts.onrender.com";

export default function AdminDash() {
  const navigate = useNavigate();

  // ---------------- STATES ----------------
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);

  // NEW DATA
  const [topArtisan, setTopArtisan] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // ---------------- AUTH + FETCH ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "admin") {
      alert("Admins only.");
      navigate("/login", { replace: true });
      return;
    }

    async function fetchAll() {
      try {
        const headers = { Authorization: `Token ${token}` };

        const [
          analyticsRes,
          topArtisanRes,
          topProductsRes,
          recentOrdersRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/products/admin/dashboard/analytics/`, { headers }),
          fetch(`${BASE_URL}/api/products/admin/top-artisan/`, { headers }),
          fetch(`${BASE_URL}/api/products/admin/top-products/`, { headers }),
          fetch(`${BASE_URL}/api/products/admin/recent-orders/`, { headers }),
        ]);

        if (!analyticsRes.ok) throw new Error("Analytics failed");

        setData(await analyticsRes.json());
        setTopArtisan(await topArtisanRes.json());
        setTopProducts(await topProductsRes.json());
        setRecentOrders(await recentOrdersRes.json());

      } catch (err) {
        console.error("Admin dashboard error:", err);
        localStorage.clear();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [navigate]);

  // ---------------- SAFE DATA ----------------
  const analytics = data?.analytics || {};

  // ---------------- CHART ----------------
  const monthlyData = analytics.monthly_platform_revenue || [];

  const availableYears = useMemo(
    () => [...new Set(monthlyData.map((m) => m.year))],
    [monthlyData]
  );

  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  const chartData = useMemo(() => {
    if (!selectedYear) return [];

    const yearData = monthlyData.filter((m) => m.year === selectedYear);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return months.map((name, i) => {
      const m = yearData.find((d) => d.month === i + 1);
      return { name, revenue: m ? Number(m.total) : 0 };
    });
  }, [monthlyData, selectedYear]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <strong>{label}</strong><br />
        Platform Revenue: ₱{payload[0].value.toLocaleString()}
      </div>
    );
  };

  if (loading || !data) {
    return <div className="admindash-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        <AdminHeader
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <h2 className="admindash-title">Welcome Back, Admin</h2>

        {/* METRIC CARDS */}
        <div className="admindash-cards">
          <div className="admindash-card">
            <FaUsers />
            <p>{analytics.total_customers ?? 0}</p>
            <small>Total Customers</small>
          </div>

          <div className="admindash-card">
            <FaStore />
            <p>{analytics.total_artisans ?? 0}</p>
            <small>Total Artisan Shops</small>
          </div>

          <div className="admindash-card">
            <FaCartShopping />
            <p>{analytics.total_orders ?? 0}</p>
            <small>Total Orders</small>
          </div>

          <div className="admindash-card">
            <FaPesoSign />
            <p>₱{Number(analytics.platform_revenue ?? 0).toLocaleString()}</p>
            <small>Platform Revenue</small>
          </div>

          <div className="admindash-card">
            <FaPesoSign />
            <p>₱{Number(analytics.artisan_total_earnings ?? 0).toLocaleString()}</p>
            <small>Artisan Earnings</small>
          </div>

          <div className="admindash-card">
            <FaPesoSign />
            <p>₱{Number(analytics.total_sales ?? 0).toLocaleString()}</p>
            <small>Total Sales</small>
          </div>

          <div className="admindash-card">
            <FaStore />
            <p>{topArtisan?.artisan_name || "—"}</p>
            <small>
              {topArtisan
                ? `₱${Number(topArtisan.total_earnings).toLocaleString()}`
                : "Top Artisan"}
            </small>
          </div>
        </div>

        {/* CHART */}
        <div className="admindash-chart">
          <ResponsiveContainer height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#6b5842" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TOP SELLING PRODUCTS */}
        <div className="admindash-panel">
          <h3>Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="empty-state">No sales yet</p>
          ) : (
            topProducts.map((p) => (
              <div key={p.product__id} className="panel-item">
                <img
                  src={p.product__main_image ? BASE_URL + p.product__main_image : "/placeholder.png"}
                  alt=""
                />
                <div>
                  <p>{p.product__name}</p>
                  <small>{p.product__artisan__name}</small>
                </div>
                <span>{p.total_sold} sold</span>
              </div>
            ))
          )}
        </div>

        {/* RECENT ORDERS */}
        <div className="admindash-panel">
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="empty-state">No recent orders</p>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} className="panel-item">
                <p>Order #{o.id}</p>
                <small>Status: {o.status}</small>
                <span>₱{o.grand_total || o.total_items_amount}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
