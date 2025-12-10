import React, { useState } from "react";
import "./AdminDash.css";
import { FaBell } from "react-icons/fa6";


const AdminHeader = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const notifications = [
    "🧺 New artisan shop registered",
    "📦 An order has been delivered",
    "💬 New message from a customer",
  ];

  return (
    <>
      <header className="admindash-header">
        <input className="admindash-search" placeholder="🔍 Search" />

        <div className="admindash-header-right">
          {/* Notifications Bell */}
          <div
            className="admindash-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell size={20} color="#fffdf9" />
            {notifications.length > 0 && <span className="notif-dot"></span>}

            {showNotifications && (
              <div className="admindash-dropdown">
                <h4>Notifications</h4>
                <ul>
                  {notifications.map((notif, idx) => (
                    <li key={idx}>{notif}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button className="admindash-logout" onClick={onLogout}>
              Logout
            </button>
          )}

          {/* Profile Icon */}
          <div
            className="admindash-profile-circle"
            onClick={() => setShowProfilePopup(true)}
          ></div>
        </div>
      </header>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div
          className="edit-modal-overlay"
          onClick={() => setShowProfilePopup(false)}
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Profile</h2>
            <label>Username</label>
            <input type="text" value="Admin123" readOnly />
            <label>Name</label>
            <input type="text" value="Admin User" readOnly />
            <label>Email</label>
            <input type="email" value="admin@example.com" readOnly />
            <div className="modal-buttons">
              <button
                className="save-btn"
                onClick={() => alert("Change password flow")}
              >
                Change Password
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowProfilePopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;