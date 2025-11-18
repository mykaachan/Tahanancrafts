import React, { useState } from "react";
import LayoutHeaderOnly from "./LayoutHeaderOnly";
import "./SellerProfile.css";

function SellerProfile() {
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Editable fields
  const [name, setName] = useState("—");
  const [location, setLocation] = useState("Batangas, Philippines");
  const [contact, setContact] = useState("tahanan@example.com\n+63 912 345 6789");

  // Temporary modal fields for profile editing
  const [tempName, setTempName] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempContact, setTempContact] = useState("");

  // Password modal fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Privacy deletion request text
  const [deleteMsg, setDeleteMsg] = useState("I would like to request deletion of my account.");

  // QR Code
  const [qrCode, setQrCode] = useState(null);

  const openModal = () => {
    setTempName(name);
    setTempLocation(location);
    setTempContact(contact);
    setShowModal(true);
  };

  const saveChanges = () => {
    setName(tempName);
    setLocation(tempLocation);
    setContact(tempContact);
    setShowModal(false);
  };

  const saveMainChanges = () => {
    alert("Main section changes saved!");
  };

  const cancelMainChanges = () => {
    alert("Main section changes canceled!");
  };

  return (
    <LayoutHeaderOnly>
      <div className={`seller-profile-container ${(showModal || showPasswordModal || showPrivacyModal) ? "blur-bg" : ""}`}>

        {/* ===== Sidebar ===== */}
        <aside className="seller-sidebar">
          <div className="profile-avatar">
            <img src="/images/blankimage.png" alt="Profile" />
          </div>

          <div className="seller-sidebar-info">
            <p className="sidebar-label">Name</p>
            <p className="sidebar-text">{name}</p>

            <p className="sidebar-label">Location</p>
            <p className="sidebar-text">{location}</p>

            <p className="sidebar-label">Email / Phone</p>
            <p className="sidebar-text" style={{ whiteSpace: "pre-line" }}>
              {contact}
            </p>
          </div>

          <button className="edit-profile-btn" onClick={openModal}>
            Edit Profile
          </button>

          <button className="edit-profile-btn" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>

          <button className="edit-profile-btn" onClick={() => setShowPrivacyModal(true)}>
            Privacy Settings
          </button>

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
          <div className="form-section">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Description</label>
            <textarea placeholder="Write something about your shop or products..." />

            {/* Save + Cancel Buttons */}
            <div className="main-buttons-right">
              <button className="edit-profile-btn small-btn" onClick={saveMainChanges}>Save</button>
              <button className="edit-profile-btn small-btn" onClick={cancelMainChanges}>Cancel</button>
            </div>

            {/* ===== FIXED QR CODE SECTION ===== */}
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
                  onChange={(e) => setQrCode(URL.createObjectURL(e.target.files[0]))}
                />

                <label htmlFor="qr-upload-input">
                  <button className="edit-profile-btn small-btn qr-upload-btn">
                    Upload QR Code
                  </button>
                </label>
              </div>

              <button
  className="edit-profile-btn small-btn save-qr-btn"
  onClick={() => qrCode ? alert("QR Code saved!") : alert("No QR Code uploaded.")}
>
  Save QR Code
</button>

            </div>
          </div>

{/* Upload Section */}
<div className="upload-section">
  <div className="main-upload-box">
    <img src="/images/blankimage.png" alt="Upload" />
    <p>drop your image here, or upload</p>
  </div>

  <div className="small-upload-grid">
    {[1, 2, 3, 4].map((n) => (
      <div className="small-upload-box" key={n}>
        <img src="/images/blankimage.png" alt={`Upload ${n}`} />
        <p>drop your image<br />here, or upload</p>
      </div>
    ))}
  </div>

  {/* Single Upload Button at the bottom */}
  <input
    type="file"
    accept="image/*"
    id="single-upload-input"
    style={{ display: "none" }}
    onChange={(e) => alert(`You selected: ${e.target.files[0].name}`)}
  />
  <label htmlFor="single-upload-input">
    <button className="edit-profile-btn" style={{ width: "100%", marginTop: "10px" }}>
      Upload
    </button>
  </label>
</div>


        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Edit Profile</h2>

            <label>Name</label>
            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} />

            <label>Location</label>
            <input type="text" value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} />

            <label>Email / Phone</label>
            <textarea value={tempContact} onChange={(e) => setTempContact(e.target.value)} />

            <div className="modal-buttons">
              <button className="save-btn" onClick={saveChanges}>Save</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Change Password</h2>

            <label>Old Password</label>
            <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />

            <label>New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />

            <label>Confirm Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />

            <div className="modal-buttons">
              <button className="save-btn" onClick={() => setShowPasswordModal(false)}>Save</button>
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY SETTINGS */}
      {showPrivacyModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Privacy Settings</h2>
            <p>You may request deletion of your account below.</p>

            <label>Reason / Request</label>
            <textarea
              value={deleteMsg}
              onChange={(e) => setDeleteMsg(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="save-btn" onClick={() => setShowPrivacyModal(false)}>
                Send Request
              </button>

              <button className="cancel-btn" onClick={() => setShowPrivacyModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </LayoutHeaderOnly>
  );
}

export default SellerProfile;