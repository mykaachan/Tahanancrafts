import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";

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
    orderId: "#101011",
    icon: require("./images/bag1.png"),
    name: "Kalpi Habing Ibaan",
    category: "Coin Purse",
    stock: 5,
    price: "₱1,745",
    status: "Shipped",
    date: "1 May 2025",
  },
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  // Placeholder data for frontend only
  const topSellerProducts = [
    {
      icon: require("./images/bag.png"),
      name: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      price: "₱500",
      sales: 10,
    },
    {
      icon: require("./images/bag1.png"),
      name: "Kalpi Habing Ibaan",
      category: "Coin Purse",
      price: "₱349",
      sales: 5,
    },
  ];

  const latestTransactions = allTransactions.slice(0, 2);
  const latestProduct = {
    icon: require("./images/bag.png"),
    name: "Sakbit Habing Ibaan",
    category: "Weaved Bag",
    stock: 10,
    price: "₱500",
    status: "Low Stock",
    date: "1 May 2025",
  };

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
                    <span className="todo-count">10</span>
                    <span className="todo-label">Processed Shipment</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=delivered")}>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Delivered</span>
                  </div>
                  <div className="todo-item" onClick={() => navigate("/order-list?tab=refund-cancel") }>
                    <span className="todo-count">0</span>
                    <span className="todo-label">Return/Refund/Cancel</span>
                  </div>
                </div>
              </div>
              <div className="dashboard-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div className="dashboard-card business-insights" style={{ flex: 1, minWidth: '280px', boxSizing: 'border-box', border: '1px solid #e0e0e0', position: 'relative' }}>
                  <h4 style={{ fontWeight: 'bold', position: 'absolute', top: '16px', left: '16px', margin: 0 }}>Business Insights</h4>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginTop: '48px' }}>
                    <div>
                      <span style={{ color: '#7c6a58', fontSize: '1rem' }}>Sales</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#4d3c2e' }}>₱5,478</div>
                    </div>
                    <div>
                      <span style={{ color: '#7c6a58', fontSize: '1rem' }}>Orders</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#4d3c2e' }}>14</div>
                    </div>
                  </div>
                </div>
                <div className="dashboard-card graph-card" style={{ flex: 1, minWidth: '280px', boxSizing: 'border-box', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* TODO: Integrate backend sales trend graph here */}
                </div>
              </div>
              <div className="dashboard-card">
                <h4>Transaction History</h4>
                <div className="transaction-history-list">
                  {latestTransactions.map((tx, idx) => (
                    <div key={idx} className="transaction-row" onClick={() => setShowHistory(true)}>
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
              </div>
              <div className="dashboard-card products-card" style={{ marginTop: '24px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '24px' }}>
                <span className="products-count" style={{ color: '#7c6a58', fontSize: '1rem' }}>Products (6)</span>
                <div className="products-list" style={{ marginTop: '12px' }}>
                  <div className="product-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.7fr 1fr 1fr', alignItems: 'center', gap: '0', padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => navigate('/all-products')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={latestProduct.icon} alt={latestProduct.name} className="product-image" style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#eaf7e4', objectFit: 'cover' }} />
                      <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="product-name" style={{ fontWeight: 500, color: '#222', fontSize: '1rem' }}>{latestProduct.name}</span>
                        <span className="product-category" style={{ color: '#7c6a58', fontSize: '0.95rem' }}>{latestProduct.category}</span>
                      </div>
                    </div>
                    <span className="product-stock" style={{ color: '#222', fontSize: '1rem', textAlign: 'center' }}>{latestProduct.stock}</span>
                    <span className="product-price" style={{ color: '#222', fontSize: '1rem', textAlign: 'center' }}>₱{latestProduct.price.replace('₱','')}</span>
                    <span className={`product-status status-lowstock`} style={{ background: '#ffe5d0', color: '#d97a00', fontWeight: 500, borderRadius: '12px', padding: '4px 16px', fontSize: '1rem', textAlign: 'center', display: 'inline-block' }}>{latestProduct.status}</span>
                    <span className="product-date" style={{ color: '#b8a48a', fontSize: '1rem', textAlign: 'center' }}>{latestProduct.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-right">
              <div className="dashboard-card shop-performance-card" style={{ position: 'relative', minHeight: '120px' }}>
                <h4 style={{ fontWeight: 'bold', position: 'absolute', top: '24px', left: '32px', margin: 0 }}>Shop Performance</h4>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <span className="shop-performance-status">EXCELLENT</span>
                </div>
              </div>
              <div className="dashboard-card">
                <h4>Top Seller Products</h4>
                <div className="top-seller-list">
                  {topSellerProducts.map((prod, idx) => (
                    <div key={idx} className="top-seller-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={prod.icon} alt={prod.name} className="top-seller-image" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eaf7e4', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 500, color: '#222', fontSize: '1rem' }}>{prod.name}</span>
                          <span style={{ color: '#7c6a58', fontSize: '0.95rem' }}>{prod.category}</span>
                          <span style={{ color: '#b8a48a', fontSize: '1rem' }}>₱{prod.price.replace('₱','')}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: '#222', fontSize: '1rem' }}>{prod.sales} Sales</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-card forecast-card dashboard-forecast">
                <h4>Forecast & Trends</h4>
                <div className="dashboard-row">
                  <div className="forecast-card">
                    <span className="graph-placeholder">[Sales Trend Graph Placeholder]</span>
                  </div>
                  <div className="trending-categories-card">
                    <span className="trending-placeholder">[Trending Categories Placeholder]</span>
                  </div>
                  <div className="product-trends-card">
                    <span className="product-trends-placeholder">[Product Trends Placeholder]</span>
                  </div>
                  <div className="export-report-card">
                    <button className="export-report-btn">Export Report</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-main">
            <div className="dashboard-card" style={{ width: "100%" }}>
              <h3>Transaction History</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span></span>
                <input type="text" placeholder="Search" style={{ borderRadius: "20px", padding: "4px 16px", border: "1px solid #ccc", width: "220px" }} />
              </div>
              <div className="transaction-history-list">
                <div className="transaction-history-list-header">
                  <span>Order ID</span>
                  <span>Product</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {allTransactions.map((tx, idx) => (
                  <div key={idx} className="transaction-row">
                    <span className="transaction-order-id">{tx.orderId}</span>
                    <div className="transaction-product">
                      <img src={tx.icon} alt={tx.name} className="transaction-product-image" />
                      <div className="transaction-product-details">
                        <span className="transaction-product-name">{tx.name}</span>
                        <span className="transaction-product-category">{tx.category}</span>
                        <span className="transaction-product-stock">{tx.stock} pcs</span>
                      </div>
                    </div>
                    <span className="transaction-product-total">{tx.price}</span>
                    <span className="transaction-product-status" style={{ background: "#e6f7e6", color: "#2e7d32" }}>{tx.status}</span>
                    <span className="transaction-product-date">{tx.date}</span>
                  </div>
                ))}
              </div>
              <button className="export-report-btn" style={{ marginTop: "16px" }} onClick={() => setShowHistory(false)}>Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomeDashboard;