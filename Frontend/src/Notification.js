// Notification.js
import React, { useEffect, useState } from "react";
import ProfileSidebar from "./components/SidebarProfile";
import "./Profile.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Notification = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔑 Adjust which ID to use
  const userId = localStorage.getItem("user_id");
  const artisanId = localStorage.getItem("artisan_id"); // if artisan

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      let endpoint = "";

      if (artisanId) {
        endpoint = `${API_URL}/api/chat/artisan/${artisanId}/`;
      } else {
        endpoint = `${API_URL}/api/chat/user/${userId}/`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await fetch(
        `${API_URL}/api/chat/read/${notifId}/`,
        {
          method: "POST",
        }
      );

      // remove from UI after marking as read
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notifId)
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <ProfileSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="profile-content">
        <h2>Notifications</h2>

        {/* ☰ Mobile Hamburger */}
        <button
          className="mobile-hamburger"
          onClick={() => setMobileSidebarOpen(true)}
        >
          ☰
        </button>

        <p className="subtitle">All your recent notifications</p>

        <div className="profile-box">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <div className="notif-left">
                  <span className="notif-icon">{notif.icon}</span>
                </div>

                <div className="notif-body">
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>
                    {new Date(notif.created_at).toLocaleString()}
                  </small>
                </div>

                {!notif.is_read && (
                  <button
                    className="btn-save"
                    onClick={() => markAsRead(notif.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Notification;
