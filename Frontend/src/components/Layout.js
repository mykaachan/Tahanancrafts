import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

// Easy to update API URL in one place
const API_URL = "https://tahanancrafts.onrender.com";

const Layout = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [artisan, setArtisan] = useState(null);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Fetch artisan info using ID from localStorage
  useEffect(() => {
    const artisanId = localStorage.getItem("artisan_id");
    if (!artisanId) return;

    fetch(`${API_URL}/api/users/artisan/story/${artisanId}/`)
      .then((res) => res.json())
      .then((data) => {
        setArtisan(data);
      })
      .catch((err) => console.error("Error fetching artisan:", err));
  }, []);

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

            <a href="/sellerprofile" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="user-info">
                {/* Dynamic Avatar */}
                <div className="user-avatar">
                  {artisan?.main_photo ? (
                    <img
                      src={`${API_URL}${artisan.main_photo}`}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                {/* Dynamic Username */}
                <span className="username">
                  {artisan?.name || "Loading..."}
                </span>
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
