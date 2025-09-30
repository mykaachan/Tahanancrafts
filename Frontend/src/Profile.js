// src/Profile.js
import React, { useState } from "react"; 
import { Link, useLocation } from "react-router-dom";  // ✅ useLocation added
import HeaderFooter from "./HeaderFooter";
import "./Profile.css";

function Profile() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation(); // ✅ detect current route

  const toggleAccountMenu = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar ===== */}
        <aside className="sidebar">
          <div className="profile-info">
            <img
              src="/images/profile.jpg"
              alt="Profile"
              className="profile-img"
            />
            <h3 className="username">kathrynbernardo</h3>
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
                  <p><strong>Username:</strong> kathrynbernardo</p>
                  <p><strong>Name:</strong> Kath</p>
                  <p><strong>Email:</strong> kathrynbernardo@gmail.com</p>
                  <p><strong>Phone Number:</strong> 09610375896</p>
                  <p><strong>Gender:</strong> Female</p>
                  <p><strong>Date of Birth:</strong> **/**/2000</p>
                  
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
                    <div className="avatar-circle"></div>
                    <button className="btn-select" type="button">Select Image</button>
                  </div>

                  <label>
                    Username:
                    <input type="text" defaultValue="kathrynbernardo" />
                  </label>
                  <label>
                    Name:
                    <input type="text" defaultValue="Kath" />
                  </label>
                  <label>
                    Email:
                    <input type="email" defaultValue="kathrynbernardo@gmail.com" />
                  </label>
                  <label>
                    Phone Number:
                    <input type="text" defaultValue="09610375896" />
                  </label>
                  <label>
                    Gender:
                    <select defaultValue="Female">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    Date of Birth:
                    <input type="date" />
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
                      onClick={() => window.history.back()} // go back
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
        </main>
      </div>
    </HeaderFooter>
  );
}

export default Profile;
