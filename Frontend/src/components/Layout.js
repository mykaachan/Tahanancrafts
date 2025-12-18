import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Layout.css";

const API_URL = "https://tahanancrafts.onrender.com";

const Layout = ({ children }) => {
  const [artisan, setArtisan] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const artisanId = localStorage.getItem("artisan_id");

  // ===============================
  // FETCH NOTIFICATIONS (FIXED)
  // ===============================
  const fetchNotifications = async () => {
    if (!artisanId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/chat/artisan/${artisanId}` // ✅ NO TRAILING SLASH
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // backend may return object or array
      const list = Array.isArray(data) ? data : [data];
      setNotifications(list);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // MARK AS READ (FRONTEND ONLY)
  // ===============================
  const markAsRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, is_read: true } : n
      )
    );
  };

  // ===============================
  // FETCH ARTISAN INFO
  // ===============================
  useEffect(() => {
    if (!artisanId) return;

    fetch(`${API_URL}/api/users/artisan/story/${artisanId}/`)
      .then((res) => res.json())
      .then((data) => setArtisan(data))
      .catch((err) =>
        console.error("Error fetching artisan:", err)
      );
  }, [artisanId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
            <div style={{ position: "relative" }}>
              <img
                src="/images/notifications.png"
                alt="Notifications"
                className="notification-icon"
                onClick={() => {
                  setShowNotif((prev) => !prev);
                  fetchNotifications();
                }}
                style={{ cursor: "pointer" }}
              />

              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount}
                </span>
              )}
            </div>

            <Link
              to="/sellerprofile"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="user-info">
                <div className="user-avatar">
                  {artisan?.main_photo ? (
                    <img
                      src={`${API_URL}${artisan.main_photos}`}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                <span className="username">
                  {artisan?.names || "Admin Myka"}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ===============================
            NOTIFICATION POPUP
        =============================== */}
        {showNotif && (
          <div className="notif-overlay" onClick={() => setShowNotif(false)}>
            <div className="notif-popup" onClick={(e) => e.stopPropagation()}>
              <div className="notif-header">
                <h4>Notifications</h4>
                <button onClick={() => setShowNotif(false)}>✖</button>
              </div>

              <div className="notif-content">
                {loadingNotif ? (
                  <p>Loading...</p>
                ) : notifications.length === 0 ? (
                  <p>No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="notif-item">
                      <span className="notif-icon">{notif.icon}</span>
                      <div className="notif-text">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <small>
                          {new Date(notif.created_at).toLocaleString()}
                        </small>
                      </div>

                      {!notif.is_read && (
                        <button
                          className="notif-read-btn"
                          onClick={() => markAsRead(notif.id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="main-container">
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

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
