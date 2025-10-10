// src/Profile.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile, updateProfile } from "./api";
import "./Profile.css";
import SidebarProfile from "./components/SidebarProfile";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile(userId);
        setProfileData(data.user || data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profileData) return null;

  const initials = profileData.name
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
        <SidebarProfile />
        <main className="profile-content">
          {location.pathname === "/profile" && !isEditing && (
            <>
              <h2>My Profile</h2>
              <p className="subtitle">Manage and protect your account</p>
              <div className="profile-box">
                <div className="profile-avatar">
                  <img src={avatarSrc} alt="Profile" className="profile-img" />
                </div>
                <div className="profile-details">
                  <p><strong>Username:</strong> {profileData.username}</p>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone:</strong> {profileData.phone}</p>
                  <p><strong>Gender:</strong> {profileData.gender}</p>
                  <p><strong>Date of Birth:</strong> {profileData.date_of_birth}</p>
                  <p><strong>Address:</strong> {profileData.address}</p>

                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    Edit Profile
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
