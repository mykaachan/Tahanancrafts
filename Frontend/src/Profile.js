// src/Profile.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile, updateProfile } from "./api"; // Simplified import
import "./Profile.css";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();

  const toggleAccountMenu = () => setIsAccountOpen(!isAccountOpen);

  const userId = localStorage.getItem("user_id"); // assumes saved after login

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile(userId);
        // Ensure we access the nested user object if backend wraps in { user: ... }
        const user = data.user || data;
        setProfileData(user);
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

  // ✅ Use backend initials if available; otherwise compute locally
  const initials = profileData.initials
    ? profileData.initials
    : profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // ✅ Use avatar_url from backend or generate one with initials
  const avatarSrc =
    profileData.avatar_url ||
    `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;

  return (
    <HeaderFooter>
      <div className="profile-page">
        {/* ===== Sidebar ===== */}
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
               <li>
      <li>
  <Link to="/notification" className="toggle-btn">
    Notifications
  </Link>
</li>
    </li>
  </ul>
</nav>
        </aside>
<main className="profile-content">
 {/* ✅ My Profile View */}
{location.pathname === "/profile" && !isEditing && (
  <>
    <h2>My Profile</h2>
    <p className="subtitle">Manage and protect your account</p>

    <div className="profile-box">
      <div className="profile-avatar">
        <img src={avatarSrc} alt="Profile" className="profile-img" />
      </div>

      <div className="profile-details">
        <p><strong>Username:</strong> {profileData.username || "-"}</p>
        <p><strong>Name:</strong> {profileData.name || "-"}</p>
        <p><strong>Email:</strong> {profileData.email || "-"}</p>
        <p><strong>Phone:</strong> {profileData.phone || "-"}</p>
        <p><strong>Gender:</strong> {profileData.gender || "-"}</p>
        <p><strong>Date of Birth:</strong> {profileData.date_of_birth || "-"}</p>
        <p><strong>Address:</strong> {profileData.address || "-"}</p> {/* NEW */}

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
          Phone:
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
        <label>
          Address:
          <input type="text" name="address" defaultValue={profileData.address || ""} /> {/* NEW */}
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
                  address: document.querySelector('input[name="address"]').value, // NEW
                };
                await updateProfile(userId, formData);
                alert("Profile updated successfully!");
                setIsEditing(false);
                const updated = await getProfile(userId);
                setProfileData(updated.user || updated);
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

{/* ✅ Change Password */}
{location.pathname === "/profile/change-password" && (
  <>
    <h2>Change Password</h2>
    <p className="subtitle">Update your password for security</p>

    <div className="profile-box">
      <form className="profile-form">
        <label>
          Old Password:
          <input type="password" name="old_password" placeholder="Enter old password" />
        </label>
        <label>
          New Password:
          <input type="password" name="new_password" placeholder="Enter new password" />
        </label>
        <label>
          Confirm New Password:
          <input type="password" name="confirm_password" placeholder="Confirm new password" />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-save">Update Password</button>
          <button type="button" className="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  </>
)}



  {/* ✅ Privacy Settings */}
  {location.pathname === "/profile/privacy" && (
    <div>
      <h2>Privacy Settings</h2>
      <div className="profile-box">
        <p>You can request account deletion. This action is irreversible.</p>
        <button className="btn-delete">Request Account Deletion</button>
      </div>
    </div>
  )}

  {/* ✅ My Purchase */}
  {location.pathname === "/profile/purchase" && (
    <div>
      <h2>My Purchase</h2>
      <div className="purchase-box">
        <p>No purchases yet.</p>
      </div>
    </div>
  )}
</main>

      </div>
    </HeaderFooter>
  );
}

export default Profile;