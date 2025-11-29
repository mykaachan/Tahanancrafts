import React, { useState } from "react";
import LayoutHeaderOnly from "./LayoutHeaderOnly";
import "./SellerProfile.css";
function SellerProfile() {
  const [qrCode, setQrCode] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); 
  const [userInfo, setUserInfo] = useState({
    username: "habing_ibaan",
    name: "Habing Ibaan",
    email: "habing@example.com",
    address: "Ibaan, Batangas"
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const saveUserInfo = () => {
    alert("User info saved!");
    setShowEditModal(false);
    setShowProfileModal(false);
  };
  const cancelEdit = () => setShowEditModal(false);
  const savePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    alert("Password changed successfully!");
    setShowChangePasswordModal(false);
  };
  const cancelPasswordChange = () => setShowChangePasswordModal(false);
  const saveMainChanges = () => alert("Main section changes saved!");
  const cancelMainChanges = () => alert("Main section changes canceled!");
  return (
    <LayoutHeaderOnly>
      <div className="seller-profile-container">
        {/* ===== Sidebar ===== */}
        <aside className="seller-sidebar">
          <div className="profile-avatar">
            <img src="/images/blankimage.png" alt="Profile" />
          </div>
          <p className="sidebar-placeholder-name">Habing Ibaan</p>
          <div className="sidebar-menu">
            <button
              className="edit-profile-btn sidebar-menu-btn"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              My Account
            </button>
            {showAccountMenu && (
              <ul className="sidebar-submenu">
                <li onClick={() => setShowProfileModal(true)}>Profile</li>
                <li onClick={() => setShowChangePasswordModal(true)}>Change Password</li>
                <li onClick={() => setShowPrivacyModal(true)}>Privacy Settings</li>
              </ul>
            )}
          </div>
          <button
            className="edit-profile-btn"
            style={{ marginTop: "auto" }}
            onClick={() => alert("Logged out")}
          >
            Logout
          </button>
        </aside>
        {/* ===== Main Section ===== */}
        <div className="seller-main">
          {/* ===== Existing form and upload sections remain unchanged ===== */}
          <div className="form-section">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Description</label>
            <textarea placeholder="Write something about your shop or products..." />

            <div className="main-buttons-right">
              <button className="edit-profile-btn small-btn" onClick={saveMainChanges}>
                Save
              </button>
              <button className="edit-profile-btn small-btn" onClick={cancelMainChanges}>
                Cancel
              </button>
            </div>
            <div className="form-section-qr" style={{ marginTop: "20px" }}>
              <label>QR Code</label>
              <div className="qr-upload-box">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" />
                ) : (
                  <p>Drop your QR code here, or upload</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="qr-upload-input"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    setQrCode(URL.createObjectURL(e.target.files[0]))
                  }
                />
                <label htmlFor="qr-upload-input">
                  <button className="edit-profile-btn small-btn qr-upload-btn">
                    Upload QR Code
                  </button>
                </label>
              </div>

              <button
                className="edit-profile-btn small-btn save-qr-btn"
                onClick={() =>
                  qrCode ? alert("QR Code saved!") : alert("No QR Code uploaded.")
                }
              >
                Save QR Code
              </button>
            </div>
          </div>
          <div className="upload-section">
            <div className="main-upload-box">
              <img src="/images/blankimage.png" alt="Upload" />
              <p>drop your image here, or upload</p>
            </div>
            <div className="small-upload-grid">
              {[1, 2, 3, 4].map((n) => (
                <div className="small-upload-box" key={n}>
                  <img src="/images/blankimage.png" alt={`Upload ${n}`} />
                  <p>
                    drop your image
                    <br />
                    here, or upload
                  </p>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              id="single-upload-input"
              style={{ display: "none" }}
              onChange={(e) =>
                alert(`You selected: ${e.target.files[0].name}`)
              }
            />
            <label htmlFor="single-upload-input">
              <button
                className="edit-profile-btn"
                style={{ width: "100%", marginTop: "10px" }}
              >
                Upload
              </button>
            </label>
          </div>
        </div>
        {/* ===== Profile Modal ===== */}
        {showProfileModal && !showEditModal && (
          <div className="edit-modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Seller Profile</h2>
              <p><strong>Username:</strong> {userInfo.username}</p>
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Address:</strong> {userInfo.address}</p>
              <button
                className="edit-profile-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
        {/* ===== Edit Profile Modal ===== */}
        {showEditModal && (
          <div className="edit-modal-overlay" onClick={cancelEdit}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Profile</h2>

              <label>Username</label>
              <input
                type="text"
                value={userInfo.username}
                onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
              />
              <label>Name</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              />
              <label>Email</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              />
              <label>Address</label>
              <input
                type="text"
                value={userInfo.address}
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
              />
              <div className="main-buttons-right" style={{ marginTop: "20px" }}>
                <button className="edit-profile-btn small-btn" onClick={saveUserInfo}>
                  Save
                </button>
                <button className="edit-profile-btn small-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ===== Change Password Modal ===== */}
        {showChangePasswordModal && (
          <div className="edit-modal-overlay" onClick={cancelPasswordChange}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Change Password</h2>
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <div className="main-buttons-right" style={{ marginTop: "20px" }}>
                <button className="edit-profile-btn small-btn" onClick={savePasswordChange}>
                  Save
                </button>
                <button className="edit-profile-btn small-btn" onClick={cancelPasswordChange}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ===== Privacy Settings Modal (Delete Account Request) ===== */}
        {showPrivacyModal && (
          <div className="edit-modal-overlay" onClick={() => setShowPrivacyModal(false)}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Privacy Settings</h2>
              <p>
                If you want to delete your account, you can submit a request below.
                Your data will be removed after review.
              </p>
              <div className="main-buttons-right" style={{ marginTop: "20px" }}>
                <button
                  className="edit-profile-btn small-btn"
                  onClick={() => {
                    alert("Account deletion request submitted!");
                    setShowPrivacyModal(false);
                  }}
                >
                  Request Account Deletion
                </button>
                <button
                  className="edit-profile-btn small-btn"
                  onClick={() => setShowPrivacyModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutHeaderOnly>
  );
}
export default SellerProfile;
