// src/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile, updateProfile,changePassword } from "./api";
import "./Profile.css";
import SidebarProfile from "./components/SidebarProfile";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);


  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("Please log in to view your cart.");
        navigate("/login");
        return;
      }
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

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const handleChangePassword = async (e) => {
  e.preventDefault();
  setPasswordError("");
  setPasswordSuccess("");
  setPasswordLoading(true); // start loading

  try {
    const res = await changePassword(oldPassword, newPassword, repeatPassword);
    setPasswordSuccess(res.success);
    setOldPassword("");
    setNewPassword("");
    setRepeatPassword("");
  } catch (err) {
    setPasswordError(err.message);
  } finally {
    setPasswordLoading(false); // stop loading
  }
};



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

                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Log out</button>
            </>
          )}

         {/* ✅ Edit Profile */}
          {location.pathname === "/profile" && isEditing && (
            <>
              <h2>Edit Profile</h2>
              <p className="subtitle">Update your account information</p>

              <div className="profile-box editing">
                <form className="edit-profile-form">
                  <label>
                    Username
                    <input type="text" name="username" value={profileData.username} />
                  </label>
                  <label>
                    Name
                    <input type="text" name="name" value={profileData.name} />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" value={profileData.email} />
                  </label>
                  <label>
                    Phone
                    <input type="text" name="phone" value={profileData.phone} />
                  </label>

                  <div className="dob-gender">
                    <label>
                      Date of Birth
                      <input type="date" name="date_of_birth" value={profileData.date_of_birth} />
                    </label>
                    <label>
                      Gender
                      <select name="gender" value={profileData.gender}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">Save</button>
                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>

                <div className="profile-avatar">
                  <img src={avatarSrc} alt="Profile" className="profile-img" />
                  <button type="button" className="btn-select">Change Avatar</button>
                </div>
              </div>

            </>
          )}

          {/* ✅ Change Password Page */}
          {location.pathname === "/profile/change-password" && (
            <>
              <h2>Change Password</h2>
              <p className="subtitle">Secure your account by changing your password</p>

              <div className="profile-box">
                <form className="edit-profile-form" onSubmit={handleChangePassword}>
                  <label>
                    Old Password:
                    <input
                      type="password"
                      placeholder="Enter old password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={passwordLoading} // disable input while loading
                    />
                  </label>

                  <label>
                    New Password:
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </label>

                  <label>
                    Confirm New Password:
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </label>

                  {passwordError && <p className="error">{passwordError}</p>}
                  {passwordSuccess && <p className="success">{passwordSuccess}</p>}

                  <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={passwordLoading}>
                      {passwordLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => window.history.back()}
                      disabled={passwordLoading}
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
