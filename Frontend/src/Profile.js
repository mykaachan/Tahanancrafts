import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import { getProfile, updateProfile, changePassword } from "./api";
import "./Profile.css";
import SidebarProfile from "./components/SidebarProfile";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        alert("Please log in to view your profile.");
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
  }, [userId, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profileData) return null;

  // Generate initials for fallback avatar
  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Decide which avatar to display
  const avatarSrc =
    previewAvatar ||
    (profileData.avatar
      ? profileData.avatar.startsWith("http")
        ? profileData.avatar
        : `${process.env.REACT_APP_BASE_URL || `fetch(${process.env.REACT_APP_API_URL}`}${profileData.avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          initials
        )}&background=random&color=fff`);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      formData.append("phone", profileData.phone);
      formData.append("gender", profileData.gender || "");
      formData.append("date_of_birth", profileData.date_of_birth || "");
      if (avatarFile) formData.append("avatar", avatarFile);

      const updated = await updateProfile(userId, formData, true);
      alert(updated.message || "Profile updated successfully!");
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword, repeatPassword);
      setPasswordSuccess(res.success || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Convert short gender codes to readable form for display
  const getGenderLabel = (code) => {
    if (code === "M") return "Male";
    if (code === "F") return "Female";
    if (code === "O") return "Other";
    return "";
  };

  return (
    <HeaderFooter>
      <div className="profile-page">
        <SidebarProfile />
        <main className="profile-content">
          {/* ✅ View Profile */}
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
                  <p><strong>Gender:</strong> {getGenderLabel(profileData.gender)}</p>
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
                <form className="edit-profile-form" onSubmit={handleProfileSubmit}>
                  <label>
                    Username
                    <input type="text" name="username" value={profileData.username || ""} onChange={handleChange} />
                  </label>
                  <label>
                    Name
                    <input type="text" name="name" value={profileData.name || ""} onChange={handleChange} />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" value={profileData.email || ""} onChange={handleChange} />
                  </label>
                  <label>
                    Phone
                    <input type="text" name="phone" value={profileData.phone || ""} onChange={handleChange} />
                  </label>

                  <div className="dob-gender">
                    <label>
                      Date of Birth
                      <input
                        type="date"
                        name="date_of_birth"
                        value={profileData.date_of_birth || ""}
                        onChange={handleChange}
                      />
                    </label>
                    <label>
                      Gender
                      <select
                        name="gender"
                        value={profileData.gender || ""}
                        onChange={(e) =>
                          setProfileData({ ...profileData, gender: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">Save</button>
                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="profile-avatar">
                  <img src={avatarSrc} alt="Profile" className="profile-img" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
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