import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import { FaBell } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const API_URL = "https://tahanancrafts.onrender.com";

const AdminHeader = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    "🧺 New artisan shop registered",
    "📦 An order has been delivered",
    "💬 New message from a customer",
  ];

  // Fetch admin profile on component mount
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchAdminProfile(userId);
  }, [navigate]);

  const fetchAdminProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/profile/profile/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setAdminProfile(data);
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      setAdminProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("artisan_id");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_admin");
    navigate("/login");
  };

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

          {/* Profile Dropdown */}
          <div className="profile-dropdown">
            <div
              className="admindash-profile-circle"
              onClick={() => setShowProfilePopup(true)}
            ></div>

            {/* Dropdown Menu */}
            <div className="dropdown-menu">
              <button onClick={() => setShowProfilePopup(true)}>
                View Profile
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div
          className="edit-modal-overlay"
          onClick={() => setShowProfilePopup(false)}
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Admin Profile</h2>
            {loading ? (
              <p>Loading profile...</p>
            ) : adminProfile ? (
              <>
                <label>Username</label>
                <input
                  type="text"
                  value={adminProfile.username || "N/A"}
                  readOnly
                />
                <label>Name</label>
                <input type="text" value={adminProfile.name || "N/A"} readOnly />
                <label>Email</label>
                <input
                  type="email"
                  value={adminProfile.email || "N/A"}
                  readOnly
                />
              </>
            ) : (
              <p>Failed to load profile</p>
            )}
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