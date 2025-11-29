// Notification.js
import React, { useState } from "react";
import HeaderFooter from "./HeaderFooter";
import SidebarProfile from "./components/SidebarProfile";
import "./Profile.css";
const Notification = () => {
  const [notifications, setNotifications] = useState([
    "Your order #1234 has been shipped!",
    "New promo: 20% off all items!",
    "Your payment for order #1233 is confirmed."
  ]);
  const markAsRead = (index) => {
    const updated = [...notifications];
    updated.splice(index, 1);
    setNotifications(updated);
  };
  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* Sidebar (separate component now) */}
        <SidebarProfile />
        {/* Main Content */}
        <main className="profile-content">
          <h2>Notifications</h2>
          <p className="subtitle">All your recent notifications</p>
          <div className="profile-box">
            {notifications.length === 0 ? (
              <p>No new notifications</p>
            ) : (
              notifications.map((note, index) => (
                <div key={index} className="notification-item">
                  <p>{note}</p>
                  <button
                    className="btn-save"
                    onClick={() => markAsRead(index)}
                  >
                    Mark as read
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </HeaderFooter>
  );
};
export default Notification;
