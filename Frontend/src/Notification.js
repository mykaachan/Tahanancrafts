// Notification.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile } from "./api"; // reuse your API
import "./Profile.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([
    "Your order #1234 has been shipped!",
    "New promo: 20% off all items!",
    "Your payment for order #1233 is confirmed."
  ]);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const toggleAccountMenu = () => setIsAccountOpen(!isAccountOpen);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfileData(data.user || data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, [userId]);

  const markAsRead = (index) => {
    const updated = [...notifications];
    updated.splice(index, 1);
    setNotifications(updated);
  };

  if (!profileData) return null;

  const initials = profileData.initials
    ? profileData.initials
    : profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const avatarSrc =
    profileData.avatar_url ||
    `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;

  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar (same as Profile.js) ===== */}
        <aside className="sidebar">
          <div className="profile-info">
            <img src={avatarSrc} alt="Profile" className="profile-img" />
            <h3 className="username">
              {profileData.username || profileData.name || "User"}
            </h3>
          </div>

          <nav className="profile-nav">
            <ul>
              <li className="parent-item">
                <button className="toggle-btn" onClick={toggleAccountMenu}>
                  My Account
                </button>
                {isAccountOpen && (
                  <ul className="submenu">
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/profile/change-password">Change Password</Link></li>
                    <li><Link to="/profile/privacy">Privacy Settings</Link></li>
                  </ul>
                )}
              </li>
              <li><Link to="/profile/purchase">My Purchase</Link></li>
              <li><Link to="/notification" className="toggle-btn">Notifications</Link></li>
            </ul>
          </nav>
        </aside>

        {/* ===== Main Content ===== */}
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
