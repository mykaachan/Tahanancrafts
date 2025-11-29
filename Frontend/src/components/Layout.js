import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';
const Layout = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };
  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-top"></div>
        <div className="header-main">
          <div className="logo">
            <img
              src="/images/TahananCraftsLogo.png"
              alt="TahananCrafts"
              className="logo-image"
            />
          </div>
          <div className="header-actions">
            {/* Notification Icon */}
            <img
              src="/images/notifications.png"
              alt="Notifications"
              className="notification-icon"
              onClick={toggleNotifications}
              style={{ cursor: 'pointer' }}
            />
            <a href="/sellerprofile" style={{ textDecoration: "none", color: "inherit" }}>
  <div className="user-info">
    <div className="user-avatar">👤</div>
    <span className="username">Profile</span>
  </div>
</a>

          </div>
        </div>

       {/* Notification Popup */}
{showNotifications && (
  <div className="notification-popup">
    <h4>Notifications</h4>
    <ul>
      <li>
        🛒 New Order Request – COD
        <button className="view-order-btn">View Order</button>
      </li>
      <li>
        🛒 New Order Request – Preorder (Downpayment Required)
        <button className="view-order-btn">View Order</button>
      </li>
      <li>
        Buyer Paid Shipping Fee
        <button className="view-order-btn">View Order</button>
      </li>
      <li>
        Buyer Uploaded Downpayment Proof
        <button className="view-order-btn">View Order</button>
      </li>
      <li>
        Buyer Requested Cancellation
        <button className="view-order-btn">View Order</button>
      </li>
    </ul>
  </div>
)}
      </header>
      <div className="main-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <Link to="/seller-dashboard" className="nav-item no-underline">
              <img src="/images/Home.png" alt="Home" className="nav-icon" />
              <span className="nav-text">HOME</span>
            </Link>
            <Link to="/all-products" className="nav-item no-underline">
              <img src="/images/ALLPRODUCTS.png" alt="All Products" className="nav-icon" />
              <span className="nav-text">ALL PRODUCTS</span>
            </Link>
            <Link to="/order-list" className="nav-item no-underline">
              <img src="/images/ORDERLIST.png" alt="Order List" className="nav-icon" />
              <span className="nav-text">ORDER LIST</span>
            </Link>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;
