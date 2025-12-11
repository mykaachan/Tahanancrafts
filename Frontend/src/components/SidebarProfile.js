// ProfileSidebar.js (FAST VERSION - NO API CALLS)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Profile.css";

const ProfileSidebar = ({ profile }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const toggleAccountMenu = () => setIsAccountOpen(!isAccountOpen);

  if (!profile) return null;

  const initials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const avatarSrc =
    profile.avatar
      ? (profile.avatar.startsWith("http")
          ? profile.avatar
          : `${process.env.REACT_APP_API_URL}${profile.avatar}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`;

  return (
    <aside className="sidebar">
      <div className="profile-info">
        <img src={avatarSrc} alt="Profile" className="profile-img" />
        <h3 className="username">{profile.username || profile.name || "User"}</h3>
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
