import React, { useEffect, useState } from "react";
import "./components/Layout.css";
import { useNavigate, Link } from "react-router-dom";

// 🔧 EASY-TO-EDIT API URL
const API_URL = "https://tahanancrafts.onrender.com";

function LayoutHeaderOnly({ children }) {
  const [artisan, setArtisan] = useState(null);
  const navigate = useNavigate();

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
