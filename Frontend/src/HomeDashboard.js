import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";
import { getImageUrl } from "./api";
// Keep placeholder/sample transactions (you had these)
const allTransactions = [
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
];
const API_URL = process.env.REACT_APP_API_URL;
const HomeDashboard = () => {
  const navigate = useNavigate();
  // Breadcrumb / view state
  const [showHistory, setShowHistory] = useState(false);
  // Seller identification (saved at login)
  const artisanIdFromStorage = localStorage.getItem("artisan_id");
  const userIdFromStorage = localStorage.getItem("user_id");
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  // Top selling (seller)
  const [topSellerProducts, setTopSellerProducts] = useState([]);
  const [loadingTopSellers, setLoadingTopSellers] = useState(true);
  // Shop performance
  const [shopPerformance, setShopPerformance] = useState("—");
  const [shopAverageRating, setShopAverageRating] = useState(null);
  // Business insights (placeholders)
  const [insights, setInsights] = useState({
    sales: 0,
    orders: 0,
  });
  // Transaction History UI state
  const [transactions, setTransactions] = useState(allTransactions);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Helper: compute shop performance from avg_rating in products
  const computeShopPerformance = (products) => {
    if (!products || products.length === 0) {
      setShopPerformance("NO RATING");
      setShopAverageRating(null);
      return;
    }
    const ratings = products
      .map((p) => p.avg_rating)
      .filter((r) => typeof r === "number");
    if (ratings.length === 0) {
      setShopPerformance("NO RATING");
      setShopAverageRating(null);
      return;
    }
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    setShopAverageRating(Number(avg.toFixed(2)));
    if (avg <= 2.5) setShopPerformance("POOR");
    else if (avg <= 3.8) setShopPerformance("AVERAGE");
    else setShopPerformance("EXCELLENT");
  };
  // Fetch seller products (main)
  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        if (!artisanIdFromStorage) {
          console.warn("No artisan_id in localStorage — seller may not be logged in.");
          setSellerProducts([]);
          return;
        }
        setLoadingProducts(true);
        const res = await fetch(`${API_URL}/api/products/product/shop/${artisanIdFromStorage}/`);
        if (!res.ok) {
          console.error("Failed fetching shop products:", res.status, await res.text());
          setSellerProducts([]);
          return;
        }
        const data = await res.json();
        const products = data.products || data;
        // Normalise keys: your API sometimes uses stock_quantity
        const normalized = products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          brandName: p.brandName,
          stock_quantity: p.stock_quantity ?? p.stock ?? p.stock_quantity ?? 0,
          regular_price: p.regular_price,
          sales_price: p.sales_price,
          main_image: p.main_image,
          images: p.images || [],
          created_at: p.created_at,
          avg_rating: typeof p.avg_rating === "number" ? p.avg_rating : Number(p.avg_rating) || 0,
          category: (p.categories && p.categories.length>0) ? String(p.categories[0]) : p.category || "",
          // keep any other fields you might use
          artisan: p.artisan || data.artisan || null,
        }));
        setSellerProducts(normalized);
        // compute insights placeholders (simple sums — replace by real API if available)
        const totalSales = 0; // placeholder (requires orders endpoint)
        const totalOrders = 0;
        setInsights({ sales: totalSales, orders: totalOrders });
        // compute shop performance from avg_rating values
        computeShopPerformance(normalized);
      } catch (err) {
        console.error("Error fetching seller products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchSellerProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisanIdFromStorage]);
  // Fetch top selling for seller
  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        if (!artisanIdFromStorage) {
          setTopSellerProducts([]);
          return;
        }
        setLoadingTopSellers(true);
        const res = await fetch(`${API_URL}/api/products/product/top-selling/${artisanIdFromStorage}/`);
        if (!res.ok) {
          console.error("Failed fetching top selling:", res.status, await res.text());
          setTopSellerProducts([]);
          return;
        }
        const data = await res.json();
        // Some endpoints return array directly; some wrap
        const top = Array.isArray(data) ? data : (data.products || data);
        setTopSellerProducts(top);
      } catch (err) {
        console.error("Error fetching top selling:", err);
      } finally {
        setLoadingTopSellers(false);
      }
    };
    fetchTopSelling();
  }, [artisanIdFromStorage]);
  // ================================
  // Optional: fetch transactions (placeholder)
  // You can replace with real orders endpoint when available
  // ================================
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        // If you have an API for seller orders, call it here.
        // Example: /api/orders/seller/{artisan_id}/ or /api/orders?seller={userId}
        // For now we keep the placeholder 'allTransactions'.
        setTransactions(allTransactions);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);
  // Utility: handle product click (navigate to product page and log view)

  const handleProductClick = (productId) => {
    const userId = userIdFromStorage;
    if (userId) {
      fetch(`${API_URL}/api/products/product/log-view/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, user_id: userId }),
      }).catch((err) => console.error("Failed to log product view:", err));
    }
    navigate(`/product/${productId}`);
  };
  // Render helpers
  const formatPrice = (p) => {
    if (!p) return "—";
    try {
      const n = Number(p);
      if (isNaN(n)) return p;
      return n.toLocaleString();
    } catch {
      return p;
    }
  };
  // Main return
  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <span className="dashboard-breadcrumb">
            Home{showHistory ? " > Transaction History" : ""}
          </span>
        </div>
        {!showHistory ? (
          <div className="dashboard-main">
            <div className="dashboard-left">
              {/* =======================
                  TODO LIST
              ======================== */}
              <div className="dashboard-card">
                <h3>To Do List</h3>
                <div className="todo-list-items">
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=order-request")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Pending Orders</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=to-ship")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">To-Process Shipment</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=shipped")}>
                    <span className="todo-count">{insights.orders || 10}</span>
                    <span className="todo-label">Processed Shipment</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=delivered")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Delivered</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=refund-cancel")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Return/Refund/Cancel</span>
                  </div>
                </div>
              </div>
              {/* =======================
                  BUSINESS INSIGHTS
              ======================== */}
              <div className="dashboard-row" style={{ gap: "24px", marginBottom: "24px" }}>
                <div className="dashboard-card business-insights" style={{ flex: 1, minWidth: '280px', boxSizing: 'border-box', border: '1px solid #e0e0e0', position: 'relative', padding: '24px' }}>
                  <h4 style={{ fontWeight: 'bold', position: 'absolute', top: '16px', left: '16px', margin: 0 }}>Business Insights</h4>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginTop: '48px' }}>
                    <div>
                      <span style={{ color: '#7c6a58', fontSize: '1rem' }}>Sales</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#4d3c2e' }}>₱{formatPrice(insights.sales)}</div>
                    </div>
                    <div>
                      <span style={{ color: '#7c6a58', fontSize: '1rem' }}>Orders</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#4d3c2e' }}>{insights.orders}</div>
                    </div>
                  </div>
                </div>
                <div className="dashboard-card graph-card" style={{ flex: 1, minWidth: '280px', boxSizing: 'border-box', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* TODO: Integrate backend sales trend graph here */}
                  <div style={{ textAlign: 'center', padding: '12px' }}>[Sales trend graph placeholder]</div>
                </div>
              </div>
              {/* ===========================
                 TRANSACTION HISTORY
              ============================ */}
              <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowHistory(true)}>
                <h4>Transaction History</h4>
                <div className="transaction-history-list">
                  {(transactions || []).slice(0,2).map((tx, idx) => (
                    <div key={idx} className="transaction-row">
                      <span className="transaction-order-id">{tx.orderId}</span>
                      <img src={tx.icon} alt={tx.name} className="transaction-product-image" />
                      <div className="transaction-product-details">
                        <span className="transaction-product-name">{tx.name}</span>
                        <span className="transaction-product-category">{tx.category}</span>
                      </div>
                      <span className="transaction-product-total">{tx.price}</span>
                      <span className="transaction-product-status">{tx.status}</span>
                      <span className="transaction-product-date">{tx.date}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="export-report-btn"
                  style={{ marginTop: '16px' }}
                  onClick={(e) => { e.stopPropagation(); navigate('/dashboard/transaction-history'); }}
                >
                  View All Transactions
                </button>
              </div>
              {/* ===========================
                 PRODUCTS CARD (Restored layout)
              ============================ */}
              <div className="dashboard-card products-card" style={{ marginTop: "24px", background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '24px' }}>
                <span className="products-count" style={{ color: '#7c6a58', fontSize: '1rem' }}>Products ({sellerProducts.length})</span>
                <div className="products-list" style={{ marginTop: '12px' }}>
                  <div className="product-list-rows">
                    {loadingProducts ? (
                      <p>Loading your products...</p>
                    ) : sellerProducts.length > 0 ? (
                      sellerProducts.map((product) => {
                        const imageUrl = product.main_image ? getImageUrl(product.main_image) : (product.images && product.images.length > 0 ? getImageUrl(product.images[0].image) : "https://via.placeholder.com/150?text=No+Image");
                        const stock = product.stock_quantity ?? 0;
                        const stockStatus = stock <= 10 ? "Low Stock" : "In Stock";
                        const statusClass = stock <= 10 ? "status-lowstock" : "status-good";
                        return (
                          <div key={product.id} className="product-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.7fr 1fr 1fr', alignItems: 'center', gap: 0, padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleProductClick(product.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <img src={imageUrl} alt={product.name} className="product-image" style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#eaf7e4', objectFit: 'cover' }} />
                              <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="product-name" style={{ fontWeight: 500, color: '#222', fontSize: '1rem' }}>{product.name}</span>
                                <span className="product-category" style={{ color: '#7c6a58', fontSize: '0.95rem' }}>{product.category}</span>
                              </div>
                            </div>
                            <span className="product-stock" style={{ color: '#222', fontSize: '1rem', textAlign: 'center' }}>{stock}</span>
                            <span className="product-price" style={{ color: '#222', fontSize: '1rem', textAlign: 'center' }}>₱{formatPrice(product.sales_price || product.regular_price)}</span>
                            <span className={`product-status ${statusClass}`} style={{ background: stock <= 10 ? '#ffe5d0' : '#e6f7e6', color: stock <= 10 ? '#d97a00' : '#2e7d32', fontWeight: 500, borderRadius: '12px', padding: '4px 16px', fontSize: '1rem', textAlign: 'center', display: 'inline-block' }}>{stockStatus}</span>
                            <span className="product-date" style={{ color: '#b8a48a', fontSize: '1rem', textAlign: 'center' }}>{product.created_at ? product.created_at.slice(0,10) : ''}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p>No products available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* ===========================
                RIGHT SIDE CARDS (Restored)
            ============================ */}
            <div className="dashboard-right">
              {/* SHOP PERFORMANCE CARD */}
              <div className="dashboard-card shop-performance-card" style={{ position: 'relative', minHeight: '120px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h4 style={{ fontWeight: 'bold', position: 'absolute', top: '16px', left: '24px', margin: 0 }}>Shop Performance</h4>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '.06em' }}>
                    {shopPerformance}
                  </div>
                  <div style={{ marginTop: '8px', color: '#7c6a58' }}>
                    Average Rating: {shopAverageRating !== null ? shopAverageRating : "—"}
                  </div>
                </div>
              </div>
              {/* TOP SELLER PRODUCTS */}
              <div className="dashboard-card">
                <h4>Top Seller Products</h4>
                <div className="top-seller-list" style={{ marginTop: '12px' }}>
                  {loadingTopSellers ? (
                    <p>Loading top selling products...</p>
                  ) : topSellerProducts.length > 0 ? (
                    topSellerProducts.map((prod, idx) => {
                      const imageUrl = prod.main_image ? getImageUrl(prod.main_image) : (prod.images && prod.images.length > 0 ? getImageUrl(prod.images[0].image) : "https://via.placeholder.com/150?text=No+Image");
                      return (
                        <div key={prod.id || idx} className="top-seller-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={imageUrl} alt={prod.name} className="top-seller-image" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500, color: '#222' }}>{prod.name}</span>
                              <span style={{ color: '#7c6a58', fontSize: '.95rem' }}>{prod.category || "Handcrafted Product"}</span>
                              <span style={{ color: '#b8a48a' }}>₱{formatPrice(prod.sales_price || prod.regular_price)}</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: 600, color: '#222', fontSize: '1rem' }}>{prod.total_sold || prod.sales || 0} Sales</span>
                        </div>
                      );
                    })
                  ) : (
                    <p>No top selling products available.</p>
                  )}
                </div>
              </div>
              {/* FORECAST & TRENDS */}
              <div className="dashboard-card forecast-card" style={{ marginTop: '16px' }}>
                <h4>Forecast & Trends</h4>
                <div className="dashboard-row" style={{ gap: '12px' }}>
                  <div className="forecast-card" style={{ padding: '12px', border: '1px dashed #e0e0e0', borderRadius: '8px' }}>
                    <span className="graph-placeholder">[Sales Trend Graph Placeholder]</span>
                  </div>
                  <div className="trending-categories-card" style={{ padding: '12px', border: '1px dashed #e0e0e0', borderRadius: '8px' }}>
                    <span className="trending-placeholder">[Trending Categories Placeholder]</span>
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button className="export-report-btn">Export Report</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========== TRANSACTION HISTORY VIEW ========== */
          <div className="dashboard-main">
            <div className="dashboard-card" style={{ width: '100%' }}>
              <h3>Transaction History</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span></span>
                <input type="text" placeholder="Search" style={{ borderRadius: '20px', padding: '4px 16px', border: '1px solid #ccc', width: '220px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="transaction-history-list" style={{ marginTop: '12px' }}>
                <div className="transaction-history-list-header" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '12px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>Order ID</span>
                  <span>Product</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {(transactions || []).filter(tx => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return tx.orderId.toLowerCase().includes(q) || tx.name.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q);
                }).map((tx, idx) => (
                  <div key={idx} className="transaction-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '12px', padding: '12px 0', alignItems: 'center', borderBottom: '1px solid #f1f1f1' }}>
                    <span>{tx.orderId}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={tx.icon} alt={tx.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{tx.name}</div>
                        <div style={{ color: '#7c6a58' }}>{tx.category}</div>
                      </div>
                    </div>
                    <span>{tx.price}</span>
                    <span style={{ background: '#e6f7e6', color: '#2e7d32', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>{tx.status}</span>
                    <span>{tx.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="export-report-btn" onClick={() => setShowHistory(false)}>Back to Dashboard</button>
                <button className="export-report-btn">Export as CSV</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default HomeDashboard;
