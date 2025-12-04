// src/HomeDashboard.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";



ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);


const API_URL = "https://tahanancrafts.onrender.com"; 
//const API_URL = "http://127.0.0.1:8000";


function getImageUrl(path) {
  if (!path) return "https://via.placeholder.com/150?text=No+Image";
  // path may already be absolute, or relative like "/media/..."
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // sometimes backend returns "/products/main/xxx.png" or "/media/..."
  return `${API_URL}${path}`;
}

function formatDateTime(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);

    const date = dt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const time = dt.toLocaleTimeString("en-US", {
      hour12: false, // 24-hour format
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${date}  ${time}`;
  } catch {
    return d;
  }
}

function getStatusStyle(status) {
  const s = status?.toLowerCase();

  // GREEN statuses
  if (["completed", "delivered", "to_review"].includes(s)) {
    return {
      background: "#e6f7e6",
      color: "#2e7d32",
    };
  }

  // RED statuses
  if (["cancelled"].includes(s)) {
    return {
      background: "#ffe6e6",
      color: "#d32f2f",
    };
  }

  // YELLOW (others like pending, awaiting, processing)
  return {
    background: "#fff8e1",
    color: "#b28900",
  };
}


function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  // Use locale string for thousands separators
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

const HomeDashboard = () => {
  const navigate = useNavigate();
  // Stored IDs
  const artisanIdFromStorage = localStorage.getItem("artisan_id");
  const userIdFromStorage = localStorage.getItem("user_id");

  // Data states
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  // Local UI states (keep some placeholders you used)
  const [showHistory, setShowHistory] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [topSellerProducts, setTopSellerProducts] = useState([]);
  const [loadingTopSellers, setLoadingTopSellers] = useState(false);

  // Business insight fallback
  const [insights, setInsights] = useState({ sales: 0, orders: 0 });
  const [shopPerformance, setShopPerformance] = useState("—");
  const [shopAverageRating, setShopAverageRating] = useState(null);

  // Transaction placeholder (keeps your earlier structure)
  const [transactions, setTransactions] = useState([
    {
      orderId: "#101011",
      icon: require("./images/bag.png"),
      name: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      stock: 10,
      price: "₱1,500",
      status: "Shipped",
      date: "1 May 2025",
    },
    {
      orderId: "#101012",
      icon: require("./images/bag1.png"),
      name: "Kalpi Habing Ibaan",
      category: "Coin Purse",
      stock: 5,
      price: "₱1,745",
      status: "Shipped",
      date: "1 May 2025",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    async function fetchMonthlySales() {
      if (!artisanIdFromStorage) return;

      try {
        const res = await fetch(`${API_URL}/api/products/dashboard/monthly-sales/${artisanIdFromStorage}/`);
        const data = await res.json();
        setMonthlySales(data);
      } catch (err) {
        console.error("Failed to load monthly sales:", err);
      }
    }

    fetchMonthlySales();
  }, [artisanIdFromStorage]);

  // =========================
  // Fetch REAL transaction history
  // =========================
  useEffect(() => {
    let mounted = true;

    async function fetchHistory() {
      if (!artisanIdFromStorage) return;

      try {
        const res = await fetch(`${API_URL}/api/products/dashboard/history/${artisanIdFromStorage}/`);
        const data = await res.json();

        if (!mounted) return;

        // normalize items
        const formatted = data.map((tx) => ({
          orderId: tx.order_id,
          status: tx.status,
          date: tx.created_at,
          name: tx.product_name,
          category: tx.product_description,
          qty: tx.quantity,
          unit_price: tx.unit_price,
          price: tx.item_total,
          image: tx.image,
        }));

        setTransactions(formatted);
      } catch (err) {
        console.error("Failed loading transaction history:", err);
      }
    }

    fetchHistory();
    return () => (mounted = false);
  }, [artisanIdFromStorage]);

  const chartData = {
    labels: monthlySales.map((m) => m.month),
    datasets: [
      {
        label: "Monthly Sales (₱)",
        data: monthlySales.map((m) => m.sales),
        borderColor: "#4d3c2e",
        backgroundColor: "rgba(77, 60, 46, 0.2)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "₱" + value.toLocaleString(),
        },
      },
    },
  };

  // =========================
  // Fetch artisan dashboard endpoint
  // =========================
  useEffect(() => {
    let mounted = true;
    async function fetchDashboard() {
      if (!artisanIdFromStorage) {
        setError("No artisan_id found in localStorage. Please login as an artisan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/products/dashboard/artisan/${artisanIdFromStorage}/`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed to load dashboard (${res.status})`);
        }
        const data = await res.json();

        if (!mounted) return;

        // normalize/compute some UI-friendly values
        const normalized = {
          pending_orders: Number(data.pending_orders || 0),
          processing_orders: Number(data.processing_orders || 0),
          shipped_orders: Number(data.shipped_orders || 0),
          delivered_orders: Number(data.delivered_orders || 0),
          refund_orders: Number(data.refund_orders || 0),
          cancelled_orders: Number(data.cancelled_orders || 0),
          total_sales: Number(data.total_sales || 0),
          sales_per_products: Array.isArray(data.sales_per_products) ? data.sales_per_products : [],
          sales_per_categories: Array.isArray(data.sales_per_categories) ? data.sales_per_categories : [],
          total_orders: Number(data.total_orders || 0),
          // round shop_performance to 2 decimals if provided
          shop_performance:
            data.shop_performance === null || data.shop_performance === undefined
              ? null
              : Math.round(Number(data.shop_performance || 0) * 100) / 100,
          top_selling_products: Array.isArray(data.top_selling_products) ? data.top_selling_products : [],
        };

        setDashboard(normalized);

        // derive insights shown in UI
        setInsights({
          sales: normalized.total_sales,
          orders: normalized.total_orders,
        });

        // set shop performance UI
        const avgRating = normalized.shop_performance;
        if (avgRating === null || avgRating === undefined) {
          setShopPerformance("NO RATING");
          setShopAverageRating(null);
        } else {
          // round to 2 decimals display
          const rounded = Number(avgRating.toFixed(2));
          setShopAverageRating(rounded);
          if (rounded <= 2.5) setShopPerformance("POOR");
          else if (rounded <= 3.8) setShopPerformance("AVERAGE");
          else setShopPerformance("EXCELLENT");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, [artisanIdFromStorage]);

  // =========================
  // Fetch seller products (for product list) - optional / mirrors earlier code
  // =========================
  useEffect(() => {
    let mounted = true;
    const fetchSellerProducts = async () => {
      if (!artisanIdFromStorage) {
        setSellerProducts([]);
        setLoadingProducts(false);
        return;
      }
      setLoadingProducts(true);
      try {
        const res = await fetch(`${API_URL}/api/products/product/shop/${artisanIdFromStorage}/`);
        if (!res.ok) {
          console.warn("Failed to fetch seller products:", res.status);
          setSellerProducts([]);
          return;
        }
        const resp = await res.json();
        const productsList = Array.isArray(resp) ? resp : resp.products || [];
        if (!mounted) return;

        const normalized = productsList.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          brandName: p.brandName,
          stock_quantity: p.stock_quantity ?? p.stock ?? 0,
          regular_price: p.regular_price,
          sales_price: p.sales_price,
          main_image: p.main_image,
          images: p.images || [],
          created_at: p.created_at,
          avg_rating: (p.avg_rating !== undefined && p.avg_rating !== null) ? Number(p.avg_rating) : 0,
          categories: p.categories || [],
          artisan: p.artisan || null,
        }));

        setSellerProducts(normalized);
      } catch (err) {
        console.error("fetchSellerProducts error:", err);
        setSellerProducts([]);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchSellerProducts();
    return () => {
      mounted = false;
    };
  }, [artisanIdFromStorage]);

  // =========================
  // Fetch top-seller products endpoint (if you have a dedicated endpoint)
  // =========================
  useEffect(() => {
    let mounted = true;
    const fetchTopSellers = async () => {
      if (!artisanIdFromStorage) {
        setTopSellerProducts([]);
        setLoadingTopSellers(false);
        return;
      }
      setLoadingTopSellers(true);
      try {
        const res = await fetch(`${API_URL}/api/products/product/top-selling/${artisanIdFromStorage}/`);
        if (!res.ok) {
          setTopSellerProducts([]);
          return;
        }
        const data = await res.json();
        const top = Array.isArray(data) ? data : data.products || [];
        if (!mounted) return;
        setTopSellerProducts(top);
      } catch (err) {
        console.error("fetchTopSelling error:", err);
        setTopSellerProducts([]);
      } finally {
        if (mounted) setLoadingTopSellers(false);
      }
    };
    fetchTopSellers();
    return () => (mounted = false);
  }, [artisanIdFromStorage]);

  // =========================
  // UI Actions
  // =========================
  const handleProductClick = useCallback(
    (productId) => {
      // log view (best-effort, don't block navigation)
      if (userIdFromStorage) {
        fetch(`${API_URL}/api/products/product/log-view/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, user_id: userIdFromStorage }),
        }).catch((err) => console.warn("log view failed:", err));
      }
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  // Small helper to safely access nested fields the API returned
  const safe = (v, fallback = null) => (v === undefined || v === null ? fallback : v);

  // ==============
  // Render
  // ==============
  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <span className="dashboard-breadcrumb">Home{showHistory ? " > Transaction History" : ""}</span>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>Loading dashboard...</div>
        ) : error ? (
          <div style={{ padding: 24, color: "crimson" }}>
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {!showHistory ? (
              <div className="dashboard-main">
                <div className="dashboard-left">
                  {/* To Do List */}
                  <div className="dashboard-card">
                    <h3>To Do List</h3>
                    <div className="todo-list-items">
                      <div
                        className="todo-item"
                        onClick={() => navigate("/order-list?tab=awaiting_payment")}
                      >
                        <span className="todo-count">{safe(dashboard?.pending_orders, 0)}</span>
                        <span className="todo-label">Pending Orders</span>
                      </div>
                      <div className="todo-item" onClick={() => navigate("/order-list?tab=processing")}>
                        <span className="todo-count">{safe(dashboard?.processing_orders, 0)}</span>
                        <span className="todo-label">To-Process Shipment</span>
                      </div>
                      <div className="todo-item" onClick={() => navigate("/order-list?tab=shipped")}>
                        <span className="todo-count">{safe(dashboard?.shipped_orders, 0)}</span>
                        <span className="todo-label">Processed Shipment</span>
                      </div>
                      <div className="todo-item" onClick={() => navigate("/order-list?tab=delivered")}>
                        <span className="todo-count">{safe(dashboard?.delivered_orders, 0)}</span>
                        <span className="todo-label">Delivered</span>
                      </div>
                      <div className="todo-item" onClick={() => navigate("/order-list?tab=refund")}>
                        <span className="todo-count">{safe(dashboard?.refund_orders, 0)}</span>
                        <span className="todo-label">Return/Refund/Cancel</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Insights */}
                  <div className="dashboard-row" style={{ gap: "24px", marginBottom: "24px" }}>
                    <div
                      className="dashboard-card business-insights"
                      style={{
                        flex: 1,
                        minWidth: "280px",
                        boxSizing: "border-box",
                        border: "1px solid #e0e0e0",
                        position: "relative",
                        padding: "24px",
                      }}
                    >
                      <h4 style={{ fontWeight: "bold", position: "absolute", top: "16px", left: "16px", margin: 0 }}>
                        Business Insights
                      </h4>
                      <div style={{ display: "flex", gap: "32px", alignItems: "center", marginTop: "48px" }}>
                        <div>
                          <span style={{ color: "#7c6a58", fontSize: "1rem" }}>Sales</span>
                          <div style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#4d3c2e" }}>
                            ₱{formatPrice(insights.sales)}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: "#7c6a58", fontSize: "1rem" }}>Orders</span>
                          <div style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#4d3c2e" }}>
                            {insights.orders}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card graph-card" style={{ flex: 1, minWidth: "280px", boxSizing: "border-box", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "100%", height: "250px" }}>
                        <Line data={chartData} options={chartOptions} />
                      </div>

                    </div>
                  </div>

                  {/* Transaction History (preview) */}
                  <div className="dashboard-card" style={{ cursor: "pointer" }} onClick={() => setShowHistory(true)}>
                    <h4>Transaction History</h4>
                    <div className="transaction-history-list">
                      {transactions.slice(0, 5) 

                        .filter((tx) => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            String(tx.orderId).toLowerCase().includes(q) ||
                            tx.name.toLowerCase().includes(q) ||
                            tx.status.toLowerCase().includes(q)
                          );
                        })
                        .map((tx, idx) => {
                          const formattedPrice = `₱${formatPrice(tx.price)}`;
                          const imageUrl = getImageUrl(tx.image);

                          return (
                            <div
                              key={idx}
                              className="transaction-row"
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                                gap: "12px",
                                padding: "12px 0",
                                alignItems: "center",
                                borderBottom: "1px solid #f1f1f1",
                              }}
                            >
                              <span>#{tx.orderId}</span>

                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <img
                                  src={imageUrl}
                                  alt={tx.name}
                                  style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{tx.name}</div>
                                  <div style={{ color: "#7c6a58" }}>{tx.category}</div>
                                  <div style={{ color: "#7c6a58", fontSize: "0.9rem" }}>
                                    Quantity: {tx.qty}
                                  </div>
                                </div>
                              </div>

                              <span>{formattedPrice}</span>

                              {/* Status */}
                              <span
                                style={{
                                  ...getStatusStyle(tx.status),
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  textAlign: "center",
                                  fontWeight: 500,
                                  fontSize: "0.95rem",
                                  display: "inline-block",
                                }}
                              >
                                {tx.status}
                              </span>
                              <span>{formatDateTime(tx.date)}</span>
                            </div>
                          );
                        })}

                    </div>
                    <button
                      className="export-report-btn"
                      style={{ marginTop: "16px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard/transaction-history");
                      }}
                    >
                      View All Transactions
                    </button>
                  </div>

                  {/* Products table */}
                  <div className="dashboard-card products-card" style={{ marginTop: "24px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", padding: "24px" }}>
                    <span className="products-count" style={{ color: "#7c6a58", fontSize: "1rem" }}>Products ({sellerProducts.length})</span>
                    <div className="products-list" style={{ marginTop: "12px" }}>
                      <div className="product-list-rows">
                        {loadingProducts ? (
                          <p>Loading your products...</p>
                        ) : sellerProducts.length > 0 ? (
                          sellerProducts.slice(0, 3).map((product) => {
                            const imageUrl = product.main_image ? getImageUrl(product.main_image) : (product.images && product.images.length > 0 ? getImageUrl(product.images[0].image) : "https://via.placeholder.com/150?text=No+Image");
                            const stock = product.stock_quantity ?? 0;
                            const stockStatus = stock <= 10 ? "Low Stock" : "In Stock";
                            const statusClass = stock <= 10 ? "status-lowstock" : "status-good";
                            return (
                              <div key={product.id} className="product-row" style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.7fr 1fr 1fr", alignItems: "center", gap: 0, padding: "12px 0", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => handleProductClick(product.id)}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                  <img src={imageUrl} alt={product.name} className="product-image" style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#eaf7e4", objectFit: "cover" }} />
                                  <div className="product-details" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span className="product-name" style={{ fontWeight: 500, color: "#222", fontSize: "1rem" }}>{product.name}</span>
                                  </div>
                                </div>
                                <span className="product-stock" style={{ color: "#222", fontSize: "1rem", textAlign: "center" }}>{stock}</span>
                                <span className="product-price" style={{ color: "#222", fontSize: "1rem", textAlign: "center" }}>₱{formatPrice(product.sales_price || product.regular_price)}</span>
                                <span className={`product-status ${statusClass}`} style={{ background: stock <= 10 ? "#ffe5d0" : "#e6f7e6", color: stock <= 10 ? "#d97a00" : "#2e7d32", fontWeight: 500, borderRadius: "12px", padding: "4px 16px", fontSize: "1rem", textAlign: "center", display: "inline-block" }}>{stockStatus}</span>
                                <span className="product-date" style={{ color: "#b8a48a", fontSize: "1rem", textAlign: "center" }}>{product.created_at ? product.created_at.slice(0, 10) : ""}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p>No products available.</p>
                        )}
                        <button
                          className="export-report-btn"
                          style={{ marginTop: "16px" }}
                          onClick={() => navigate("/seller-products")}
                        >
                          View All Products
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="dashboard-right">
                  {/* Shop performance */}
                  <div className="dashboard-card shop-performance-card" style={{ position: "relative", minHeight: "120px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <h4 style={{ fontWeight: "bold", position: "absolute", top: "16px", left: "24px", margin: 0 }}>Shop Performance</h4>
                    <div style={{ textAlign: "center", marginTop: "8px" }}>
                      <div style={{ fontSize: "2.0rem",marginTop: "30px", color: "green", fontWeight: 700, letterSpacing: ".06em" }}>{shopPerformance}</div>
                      <div style={{  color: "#7c6a58" }}>Average Rating: {shopAverageRating !== null ? shopAverageRating.toFixed(2) : "—"}</div>
                    </div>
                  </div>

                  {/* Top selling products */}
                  <div className="dashboard-card">
                    <h4>Top Selling Products</h4>
                    <div className="top-seller-list" style={{ marginTop: "12px" }}>
                      {loading ? (
                        <p>Loading top selling products...</p>
                      ) : !dashboard?.sales_per_products?.length ? (
                        <p>No top selling products available.</p>
                      ) : (
                        (() => {
                          const arr = dashboard.sales_per_products;

                          // STEP 1 — merge with sellerProducts so we can get price + category + real image
                          const merged = arr.map((p) => {
                            const full = sellerProducts.find((sp) => sp.id === p.product__id);

                            return {
                              id: p.product__id,
                              name: p.product__name,
                              image:
                                (full?.main_image && getImageUrl(full.main_image)) ||
                                (p.product__main_image && getImageUrl(p.product__main_image)) ||
                                "https://via.placeholder.com/150?text=No+Image",

                              sold: p.delivered_count || p.total_orders || 0,

                              price:
                                full?.sales_price ??
                                full?.regular_price ??
                                0,
                            };
                          });

                          // STEP 2 — sort & take top 3
                          const top3 = merged.sort((a, b) => b.sold - a.sold).slice(0, 3);

                          return top3.map((prod, idx) => (
                            <div
                              key={prod.id || idx}
                              className="top-seller-row"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "18px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                  }}
                                />

                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 500, color: "#222" }}>{prod.name}</span>
                                  <span style={{ color: "#7c6a58", fontSize: ".95rem" }}>
                                    {prod.category}
                                  </span>
                                  <span style={{ color: "#b8a48a" }}>₱{formatPrice(prod.price)}</span>
                                </div>
                              </div>

                              <span style={{ fontWeight: 600, color: "#222", fontSize: "1rem" }}>
                                {prod.sold} Sold
                              </span>
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </div>


                  {/* Forecast & trends */}
                  <div className="dashboard-card forecast-card" style={{ marginTop: "16px" }}>
                    <h4>Forecast & Trends</h4>
                    <div className="dashboard-row" style={{ gap: "12px" }}>
                      <div className="forecast-card" style={{ padding: "12px", border: "1px dashed #e0e0e0", borderRadius: "8px" }}>
                        <span className="graph-placeholder">[Sales Trend Graph Placeholder]</span>
                      </div>
                      <div className="trending-categories-card" style={{ padding: "12px", border: "1px dashed #e0e0e0", borderRadius: "8px" }}>
                        <span className="trending-placeholder">[Trending Categories Placeholder]</span>
                      </div>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      <button className="export-report-btn">Export Report</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Transaction history page
              <div className="dashboard-main">
                <div className="dashboard-card" style={{ width: "100%" }}>
                  <h3>Transaction History</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span></span>
                    <input type="text" placeholder="Search" style={{ borderRadius: "20px", padding: "4px 16px", border: "1px solid #ccc", width: "220px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="transaction-history-list" style={{ marginTop: "12px" }}>
                    <div className="transaction-history-list-header" style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: "12px", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                      <span>Order ID</span>
                      <span>Product</span>
                      <span>Total</span>
                      <span>Status</span>
                      <span>Date</span>
                    </div>
                    {transactions
                      .filter(tx => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return tx.orderId.toLowerCase().includes(q) || tx.name.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q);
                      })
                      .map((tx, idx) => (
                        <div key={idx} className="transaction-row" style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: "12px", padding: "12px 0", alignItems: "center", borderBottom: "1px solid #f1f1f1" }}>
                          <span>{tx.orderId}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img src={tx.icon} alt={tx.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{tx.name}</div>
                              <div style={{ color: "#7c6a58" }}>{tx.category}</div>
                            </div>
                          </div>
                          <span>{tx.price}</span>
                          <span style={{ background: "#e6f7e6", color: "#2e7d32", padding: "6px 10px", borderRadius: "8px", textAlign: "center" }}>{tx.status}</span>
                          <span>{tx.date}</span>
                        </div>
                      ))}
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                    <button className="export-report-btn" onClick={() => setShowHistory(false)}>Back to Dashboard</button>
                    <button className="export-report-btn">Export as CSV</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default HomeDashboard;
