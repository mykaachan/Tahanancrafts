import React from "react";
import "./components/Layout.css";

function LayoutHeaderOnly({ children }) {
  return (
    <div className="layout">
      {/* ===== Header Only ===== */}
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
            <img
              src="/images/notifications.png"
              alt="Notifications"
              className="notification-icon"
            />
            <img
              src="/images/inbox.png"
              alt="Messages"
              className="message-icon"
            />
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <span className="username">habingibaan</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Page Content (below header) ===== */}
      <main>{children}</main>
    </div>
  );
}

export default LayoutHeaderOnly;
