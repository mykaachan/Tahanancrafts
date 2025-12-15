import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfile, updateProfile, changePassword } from "./api";
import "./Profile.css";
import SidebarProfile from "./components/SidebarProfile";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("user_id");

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Cache keys
  const CACHE_KEY = `profile_${userId}`;
  const CACHE_TIME_KEY = `profile_time_${userId}`;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /** Load cached profile data FIRST (instant UI) */
  useEffect(() => {
    if (!userId) {
      alert("Please log in to view your profile.");
      navigate("/login");
      return;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
      setProfileData(JSON.parse(cached));
      setLoading(false);
    }

    /** Fetch fresh profile info in background */
    async function fetchFresh() {
      try {
        const fresh = await getProfile(userId);
        const user = fresh.user || fresh;

        setProfileData(user);
        localStorage.setItem(CACHE_KEY, JSON.stringify(user));
        localStorage.setItem(CACHE_TIME_KEY, Date.now());
      } catch (err) {
        console.error("Failed loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFresh();
  }, [userId, navigate]);

  /** Avatar (must run BEFORE conditional returns) */
  const avatarSrc = useMemo(() => {
    if (!profileData) return "";

    if (previewAvatar) return previewAvatar;

    if (profileData.avatar) {
      return profileData.avatar.startsWith("http")
        ? profileData.avatar
        : `${process.env.REACT_APP_API_URL}${profileData.avatar}`;
    }

    const initials = profileData.name
      ? profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()
      : "U";

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=random&color=fff`;
  }, [profileData, previewAvatar]);

  // ❗ CONDITIONAL RETURNS MUST COME AFTER ALL HOOKS
  if (loading && !profileData) return <p>Loading...</p>;
  if (!profileData) return <p>No profile found.</p>;

  /** Actions */
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("artisan_id");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await updateProfile(userId, formData, true);
      alert(res.message || "Profile updated!");

      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);

      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const getGenderLabel = (code) =>
    code === "M" ? "Male" :
    code === "F" ? "Female" :
    code === "O" ? "Other" : "";

  return (
      <div className="profile-page">
        <SidebarProfile profile={profileData} />
        <main className="profile-content">

          {/* VIEW PROFILE */}
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
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>

              <button className="btn-logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}

          {/* EDIT PROFILE */}
          {location.pathname === "/profile" && isEditing && (
            <>
              <h2>Edit Profile</h2>
              <div className="profile-box editing">
                <form className="edit-profile-form" onSubmit={handleProfileSubmit}>
                  <label>Username
                    <input
                      type="text"
                      name="username"
                      value={profileData.username || ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, username: e.target.value })
                      }
                    />
                  </label>

                  <label>Name
                    <input
                      type="text"
                      name="name"
                      value={profileData.name || ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </label>

                  <label>Email
                    <input
                      type="email"
                      name="email"
                      value={profileData.email || ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </label>

                  <label>Phone
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone || ""}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">Save</button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setIsEditing(false)}
                    >
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

        </main>
      </div>
  );
}

export default Profile;
