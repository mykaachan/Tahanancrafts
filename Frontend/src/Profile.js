// src/Profile.js
import React, { useState, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom";  
import HeaderFooter from "./HeaderFooter";
import { getProfile, getAvatarUrl } from "./api"; // Use your API helper
import "./Profile.css";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // ✅ for purchases tabs
  const location = useLocation();

  const toggleAccountMenu = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;
  if (!profileData) return null;

  // Safely generate avatar URL
  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const avatarSrc = getAvatarUrl(profileData.avatar_url || initials);

  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar ===== */}
        <aside className="sidebar">
          <div className="profile-info">
            <img
              src={avatarSrc}
              alt="Profile"
              className="profile-img"
            />
            <h3 className="username">{profileData.username || profileData.name}</h3>
          </div>

          <nav className="profile-nav">
            <ul>
              <li className="parent-item">
                <button 
                  className="toggle-btn" 
                  onClick={toggleAccountMenu}
                >
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
          {/* ✅ Profile Page */}
          {location.pathname === "/profile" && !isEditing && (
            <>
              <h2>My Profile</h2>
              <p className="subtitle">Manage and protect your account</p>

              <div className="profile-box">
                <div className="profile-details">
                  <img src={avatarSrc} alt="Profile" className="profile-img" />
                  <p><strong>Username:</strong> {profileData.username || "-"}</p>
                  <p><strong>Name:</strong> {profileData.name || "-"}</p>
                  <p><strong>Email:</strong> {profileData.email || "-"}</p>
                  <p><strong>Phone Number:</strong> {profileData.phone || "-"}</p>
                  <p><strong>Gender:</strong> {profileData.gender || "-"}</p>
                  <p><strong>Date of Birth:</strong> {profileData.date_of_birth || "-"}</p>
                  
                  <button 
                    className="btn-edit" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </button>
                </div>
              </div>

              <button className="btn-logout">Log out</button>
            </>
          )}

          {/* ✅ Edit Profile */}
          {location.pathname === "/profile" && isEditing && (
            <>
              <h2>Edit Profile</h2>
              <p className="subtitle">Update your account information</p>

              <div className="profile-box">
                <form className="edit-profile-form">
                  <div className="profile-avatar">
                    <img src={avatarSrc} alt="Profile" className="profile-img" />
                    <button className="btn-select" type="button">Select Image</button>
                  </div>

                  <label>
                    Username:
                    <input type="text" defaultValue={profileData.username || ""} />
                  </label>
                  <label>
                    Name:
                    <input type="text" defaultValue={profileData.name || ""} />
                  </label>
                  <label>
                    Email:
                    <input type="email" defaultValue={profileData.email || ""} />
                  </label>
                  <label>
                    Phone Number:
                    <input type="text" defaultValue={profileData.phone || ""} />
                  </label>
                  <label>
                    Gender:
                    <select defaultValue={profileData.gender || "Other"}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    Date of Birth:
                    <input type="date" defaultValue={profileData.date_of_birth || ""} />
                  </label>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-save"
                      onClick={() => setIsEditing(false)}
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ✅ Change Password Page */}
          {location.pathname === "/profile/change-password" && (
            <>
              <h2>Change Password</h2>
              <p className="subtitle">Secure your account by changing your password</p>

              <div className="profile-box">
                <form className="edit-profile-form">
                  <label>
                    Old Password:
                    <input type="password" placeholder="Enter old password" />
                  </label>
                  <label>
                    New Password:
                    <input type="password" placeholder="Enter new password" />
                  </label>
                  <label>
                    Confirm New Password:
                    <input type="password" placeholder="Confirm new password" />
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ✅ Privacy Settings Page */}
          {location.pathname === "/profile/privacy" && (
            <>
              <h2>Privacy Settings</h2>
              <p className="subtitle">Manage your privacy and account settings</p>

              <div className="profile-box">
                <p>
                  If you would like to permanently delete your account, you can send a
                  request below. This action cannot be undone.
                </p>
                <button className="btn-delete">
                  Request Account Deletion
                </button>
              </div>
            </>
          )}

          {/* ✅ My Purchases Page */}
          {location.pathname === "/profile/purchase" && (
            <>
              <h2>My Purchases</h2>
              <p className="subtitle">Track your order status here</p>

              {/* Tabs */}
              <div className="purchases-tabs">
                <button 
                  className={activeTab === "all" ? "active" : ""} 
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>
                <button 
                  className={activeTab === "to-pay" ? "active" : ""} 
                  onClick={() => setActiveTab("to-pay")}
                >
                  To Pay
                </button>
                <button 
                  className={activeTab === "to-ship" ? "active" : ""} 
                  onClick={() => setActiveTab("to-ship")}
                >
                  To Ship
                </button>
                <button 
                  className={activeTab === "to-receive" ? "active" : ""} 
                  onClick={() => setActiveTab("to-receive")}
                >
                  To Receive
                </button>
                <button 
                  className={activeTab === "completed" ? "active" : ""} 
                  onClick={() => setActiveTab("completed")}
                >
                  Completed
                </button>
              </div>

              {/* Orders List */}
              <div className="purchase-box">
                {activeTab === "all" && (
                  <div className="orders-list">
                    {/* ===== Order 1 ===== */}
                    <div className="order-card">
                      <div className="order-header">
                        <h3>Burdang Taal Lace Medallions</h3>
                        <div className="order-actions">
                          <button className="btn-small">Message</button>
                          <button className="btn-small">View Shop</button>
                        </div>
                        <span className="order-status">Parcel has been delivered | <strong>COMPLETED</strong></span>
                      </div>
                      
                      <div className="order-body">
                        <img 
                          src="https://via.placeholder.com/120" 
                          alt="Product Placeholder" 
                          className="order-img"
                        />
                        <div className="order-info">
                          <h4>Burdang Taal Lace Medallions</h4>
                          <p>Table runner</p>
                        </div>
                      </div>

                      <div className="order-footer">
                        <p className="order-total">Order Total: <strong>₱149</strong></p>
                        <div className="order-buttons">
                          <button className="btn-buy">Buy Again</button>
                          <button className="btn-contact">Contact Artisan</button>
                        </div>
                      </div>
                    </div>

                    {/* ===== Order 2 ===== */}
                    <div className="order-card">
                      <div className="order-header">
                        <h3>Habing Ibaan</h3>
                        <div className="order-actions">
                          <button className="btn-small">Message</button>
                          <button className="btn-small">View Shop</button>
                        </div>
                        <span className="order-status">Parcel has been delivered | <strong>COMPLETED</strong></span>
                      </div>
                      
                      <div className="order-body">
                        <img 
                          src="https://via.placeholder.com/120" 
                          alt="Product Placeholder" 
                          className="order-img"
                        />
                        <div className="order-info">
                          <h4>Kalpi</h4>
                          <p>Hand-woven Coin Purse</p>
                        </div>
                      </div>

                      <div className="order-footer">
                        <p className="order-total">Order Total: <strong>₱149</strong></p>
                        <div className="order-buttons">
                          <button className="btn-buy">Buy Again</button>
                          <button className="btn-contact">Contact Artisan</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "to-pay" && <p>No items to pay.</p>}
                {activeTab === "to-ship" && <p>No items to ship.</p>}
                {activeTab === "to-receive" && <p>No items to receive.</p>}
                {activeTab === "completed" && <p>No completed orders yet.</p>}
              </div>
            </>
          )}
        </main>
      </div>
    </HeaderFooter>
  );
}

export default Profile;
