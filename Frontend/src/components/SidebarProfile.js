// ProfileSidebar.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../api";
import "../Profile.css";
const ProfileSidebar = () => {
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
          <li><Link to="/my-purchases">My Purchase</Link></li>
          <li><Link to="/notification" className="toggle-btn">Notifications</Link></li>
        </ul>
      </nav>
    </aside>
  );
};
export default ProfileSidebar;
