import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile, getImageUrl } from "./api"; // Only keep getProfile API
import "./Profile.css";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Purchases tabs
  const location = useLocation();

  const toggleAccountMenu = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  // Fetch profile from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile(); // only this API
      setProfileData(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  // Avatar
  const avatarSrc =
    profileData.avatar_url ||
    `https://ui-avatars.com/api/?name=${profileData.username[0].toUpperCase()}&background=random&color=fff`;

  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar ===== */}
        <aside className="sidebar">
          <div className="profile-info">
            <img src={getImageUrl(avatarSrc)} alt="Profile" className="profile-img" />
            <h3 className="username">{profileData.username}</h3>
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
              <li><Link to="/profile/notifications">Notifications</Link></li>
            </ul>
          </nav>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="profile-content">
          {location.pathname === "/profile" && (
            <>
              <h2>My Profile</h2>
              <p className="subtitle">Manage and protect your account</p>

              <div className="profile-box">
                <div className="profile-details">
                  <img src={getImageUrl(avatarSrc)} alt="Profile" className="profile-img" />
                  <p><strong>Username:</strong> {profileData.username}</p>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone Number:</strong> {profileData.phone}</p>
                  <p><strong>Gender:</strong> {profileData.gender || "-"}</p>
                  <p><strong>Date of Birth:</strong> {profileData.date_of_birth || "-"}</p>
                </div>
              </div>

              <button className="btn-logout">Log out</button>
            </>
          )}
        </main>
      </div>
    </HeaderFooter>
  );
}

export default Profile;
