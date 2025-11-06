import React from "react";
import LayoutHeaderOnly from "./LayoutHeaderOnly";
import "./SellerProfile.css"; // ✅ make sure this file is in src/

function SellerProfile() {
  return (
    <LayoutHeaderOnly>
      <div className="seller-profile-container">
        {/* ===== Sidebar ===== */}
        <aside className="seller-sidebar">
          <div className="profile-avatar">
            <img src="/images/blankimage.png" alt="Profile" />
          </div>

          <div className="seller-sidebar-info">
            <p className="sidebar-label">Name</p>
            <p className="sidebar-text">—</p>

            <p className="sidebar-label">Location</p>
            <p className="sidebar-text">Batangas, Philippines</p>

            <p className="sidebar-label">Email / Phone</p>
            <p className="sidebar-text">
              tahanan@example.com<br />
              +63 912 345 6789
            </p>
          </div>
        </aside>

        {/* ===== Main Section ===== */}
        <div className="seller-main">
          <div className="form-section">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Description</label>
            <textarea placeholder="Write something about your shop or products..." />
          </div>

          {/* ===== Upload Section ===== */}
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
          </div>
        </div>
      </div>
    </LayoutHeaderOnly>
  );
}

export default SellerProfile;
