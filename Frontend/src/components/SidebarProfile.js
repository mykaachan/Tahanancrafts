// ProfileSidebar.js (CACHED + FAST + MOBILE READY)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../api";
import "../Profile.css";

const ProfileSidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const toggleAccountMenu = () => setIsAccountOpen((p) => !p);
  const userId = localStorage.getItem("user_id");

  /* ================= CACHE CONFIG ================= */
  const CACHE_KEY = `sidebar_profile_${userId}`;
  const CACHE_TIME_KEY = `sidebar_profile_time_${userId}`;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!userId) return;

    // 1️⃣ Load cached profile instantly
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
      setProfileData(JSON.parse(cached));
    }

    // 2️⃣ Fetch fresh data in background
    async function fetchFresh() {
      try {
        const data = await getProfile(userId);
        const user = data.user || data;

        setProfileData(user);
        localStorage.setItem(CACHE_KEY, JSON.stringify(user));
        localStorage.setItem(CACHE_TIME_KEY, Date.now());
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }

    fetchFresh();
  }, [userId]);

  if (!profileData) return null;

  /* ================= AVATAR ================= */
  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const avatarSrc = profileData.avatar
    ? profileData.avatar.startsWith("http")
      ? profileData.avatar
      : `${process.env.REACT_APP_API_URL}${profileData.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        initials
      )}&background=random&color=fff`;

  return (
    <>
      {/* ===== MOBILE OVERLAY ===== */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Mobile close button */}
        <button className="close-sidebar" onClick={onClose}>
          ✕
        </button>

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
                  <li>
                    <Link to="/profile" onClick={onClose}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile/change-password" onClick={onClose}>
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile/privacy" onClick={onClose}>
                      Privacy Settings
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link to="/my-purchases" onClick={onClose}>
                My Purchase
              </Link>
            </li>

            <li>
              <Link to="/notification" onClick={onClose}>
                Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default ProfileSidebar;
