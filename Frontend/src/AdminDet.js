import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa6";

const AdminDet = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  return (
    <div className="admindash-container">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Section */}
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search"
            readOnly
          />
          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
              {notifications.length > 0 && <span className="notif-dot"></span>}
              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {notifications.map((notif, index) => (
                      <li key={index}>{notif}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        {/* ===== PAGE TITLE ===== */}
        <div className="admindash-welcome">
          <h2>Product Details</h2>
        </div>

        {/* ===== PRODUCT DETAILS FORM ===== */}
        <div className="product-details-container">
          <div className="product-details-form">
            <div className="left-section">
              {/* Product Info */}
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value="Kalpi Habing Iban" readOnly />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value="A finely woven purse handcrafted by Batangueño artisans using local materials."
                  readOnly
                ></textarea>
              </div>

              <div className="form-group">
                <label>Category</label>
                <input type="text" value="Purse" readOnly />
              </div>

              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="text" value="100" readOnly />
              </div>

              {/* Price, Orders, Status Section */}
              <div className="product-details-grid">
                <div className="product-details-field">
                  <label>Regular Price</label>
                  <input type="text" value="₱500" readOnly />
                </div>
                <div className="product-details-field">
                  <label>Discounted Price</label>
                  <input type="text" value="₱399" readOnly />
                </div>
                <div className="product-details-field">
                  <label>Orders</label>
                  <input type="text" value="10" readOnly />
                </div>
                <div className="product-details-field">
                  <label>Status</label>
                  <input type="text" value="Available" readOnly />
                </div>
              </div>

              <div className="button-group">
                <button className="delete-btn">Delete</button>
                <button className="flag-btn">Flag</button>
              </div>
            </div>

            {/* Right Section (Images, Seller Info) */}
            <div className="right-section">
              <img
                src="https://via.placeholder.com/420x280"
                alt="Product"
                className="main-product-img"
              />

              <div className="gallery">
                <p>Product Gallery</p>
                <div className="gallery-grid">
                  {Array(6)
                    .fill()
                    .map((_, i) => (
                      <img
                        key={i}
                        src="https://via.placeholder.com/100x80"
                        alt="Gallery"
                      />
                    ))}
                </div>
              </div>

              <div className="artisan-seller">
                <p>Artisan Seller</p>
                <div className="seller-card">
                  <img
                    src="https://via.placeholder.com/75"
                    alt="Seller"
                    className="seller-img"
                  />
                  <div>
                    <h4>SM Sunrise Weaving Association</h4>
                    <small>Ibaan, Batangas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* end admindash-main */}
    </div>
  );
};

export default AdminDet;
