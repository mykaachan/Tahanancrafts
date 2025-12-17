import React, { useEffect, useState } from "react";
import "./components/Layout.css";
import { useNavigate, Link } from "react-router-dom";

// 🔧 EASY-TO-EDIT API URL
const API_URL = "https://tahanancrafts.onrender.com";
//const API_URL = "http://127.0.0.1:8000";

function LayoutHeaderOnly({ children }) {
  const [artisan, setArtisan] = useState(null);
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const fetchNotifications = async () => {
    const artisanId = localStorage.getItem("artisan_id");
    if (!artisanId) return;

    setLoadingNotif(true);
    try {
      const res = await fetch(
        `${API_URL}/api/chat/artisan/${artisanId}/`
      );
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoadingNotif(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await fetch(
        `${API_URL}/api/chat/read/${notifId}/`,
        { method: "POST" }
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notifId)
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };



  // Fetch artisan info using ID from localStorage
  useEffect(() => {
    const artisanId = localStorage.getItem("artisan_id");
    if (!artisanId) return;

    fetch(`${API_URL}/api/users/artisan/story/${artisanId}/`)
      .then((res) => res.json())
      .then((data) => setArtisan(data))
      .catch((err) => console.error("Error fetching artisan:", err));
  }, []);

  return (
    <div className="layout">
      {/* ===== Header Only ===== */}
      <header className="header">
        <div className="header-top"></div>
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

        <div className="header-main">
          {/* CLICKABLE LOGO */}
          <div className="logo" onClick={() => navigate("/seller-dashboard")}>
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
              onClick={() => {
                setShowNotif(!showNotif);
                fetchNotifications();
              }}
              style={{ cursor: "pointer" }}
            />


            {/* DASHBOARD LINK (no style name changes) */}
            <Link to="/seller-dashboard" className="dashboard-link">
              Dashboard
            </Link>

            {/* USER INFO (DYNAMIC) */}
            <div className="user-info">
              <div className="user-avatar">
                {artisan?.main_photo ? (
                  <img
                    src={`${API_URL}${artisan.main_photo}`}
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
                {artisan?.name || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Page Content ===== */}
      <main>{children}</main>
    </div>
  );
}

export default LayoutHeaderOnly;
