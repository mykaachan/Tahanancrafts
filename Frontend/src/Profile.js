// src/Profile.js
import React, { useState, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom";  
import HeaderFooter from "./HeaderFooter";
import { getProfile, getAvatarUrl, updateProfile } from "./api"; // Use your API helper
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

  // Get user ID from localStorage or auth context
  const userId = localStorage.getItem("user_id"); // Adjust based on your auth

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile(userId);
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId]);

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

  const avatarSrc = getAvatarUrl(
    profileData?.avatar_url,   // avatar path (if uploaded)
    profileData?.name || "User" // fallback name for initials
  );

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
                    <input type="text" name="username" defaultValue={profileData.username || ""} />
                  </label>
                  <label>
                    Name:
                    <input type="text" name="name" defaultValue={profileData.name || ""} />
                  </label>
                  <label>
                    Email:
                    <input type="email" name="email" defaultValue={profileData.email || ""} />
                  </label>
                  <label>
                    Phone Number:
                    <input type="text" name="phone" defaultValue={profileData.phone || ""} />
                  </label>
                  <label>
                    Gender:
                    <select name="gender" defaultValue={profileData.gender || "Other"}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    Date of Birth:
                    <input type="date" name="date_of_birth" defaultValue={profileData.date_of_birth || ""} />
                  </label>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-save"
                      onClick={async () => {
                        try {
                          const formData = {
                            username: document.querySelector('input[name="username"]').value,
                            name: document.querySelector('input[name="name"]').value,
                            email: document.querySelector('input[name="email"]').value,
                            phone: document.querySelector('input[name="phone"]').value,
                            gender: document.querySelector('select[name="gender"]').value,
                            date_of_birth: document.querySelector('input[name="date_of_birth"]').value,
                          };
                          await updateProfile(userId, formData);
                          alert("Profile updated successfully!");
                          setIsEditing(false);
                          const updated = await getProfile(userId);
                          setProfileData(updated);
                        } catch (err) {
                          console.error(err);
                          alert("Failed to update profile");
                        }
                      }}
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

          {/* ===== Remaining pages (Change Password, Privacy, Purchases) remain unchanged ===== */}
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

          {location.pathname === "/profile/purchase" && (
            <>
              <h2>My Purchases</h2>
              <p className="subtitle">Track your order status here</p>

              {/* Tabs and orders list remain unchanged */}
            </>
          )}
        </main>
      </div>
    </HeaderFooter>
  );
}

export default Profile;
