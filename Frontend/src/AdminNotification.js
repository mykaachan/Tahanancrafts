// src/AdminNotification.js
import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
const AdminNotification = () => {
const [showNotifications, setShowNotifications] = useState(false);
const notifications = [
  {
    id: 1,
    title: "Artisan Registration",
    storeName: "Artisan Store Name",
    date: "Oct 17, 2025",
    status: "Waiting",
    sellerType: "Registered Business",
    businessRegNo: "PL201001703",
    shopName: "Artisan Store Name 2",
    address: "V537+RX2, Ibaan, Batangas",
    email: "samplemail@email.com",
    phone: "09234452345",
    documents: "See Attached Documents",
    photos: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2,
    title: "Artisan Registration",
    storeName: "Artisan Store Name",
    date: "Oct 16, 2025",
    status: "Approved",
    sellerType: "Registered Business",
    businessRegNo: "PL201001704",
    shopName: "Artisan Store Name 3",
    address: "V538+RX2, Ibaan, Batangas",
    email: "samplemail2@email.com",
    phone: "09234452346",
    documents: "See Attached Documents",
    photos: [1, 2, 3],
  },
  {
    id: 3,
    title: "Artisan Registration",
    storeName: "Artisan Store Name",
    date: "Oct 15, 2025",
    status: "Approved",
    sellerType: "Individual Seller",
    businessRegNo: "PL201001705",
    shopName: "Artisan Store Name 4",
    address: "V539+RX2, Ibaan, Batangas",
    email: "samplemail3@email.com",
    phone: "09234452347",
    documents: "See Attached Documents",
    photos: [1, 2],
  },
  {
    id: 4,
    title: "Artisan Registration",
    storeName: "Artisan Store Name",
    date: "Oct 14, 2025",
    status: "Declined",
    sellerType: "Registered Business",
    businessRegNo: "PL201001706",
    shopName: "Artisan Store Name 5",
    address: "V540+RX2, Ibaan, Batangas",
    email: "samplemail4@email.com",
    phone: "09234452348",
    documents: "See Attached Documents",
    photos: [1, 2, 3],
  },
];
  const [selectedNotif, setSelectedNotif] = useState(notifications[0]);
  const simpleNotifications = [
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ];
  return (
    <div className="admindash-container">
      <AdminSidebar />
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search notifications..."
          />
          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
              {simpleNotifications.length > 0 && <span className="notif-dot"></span>}
              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {simpleNotifications.map((notif, index) => (
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
          <h2>Notifications</h2>
        </div>
        {/* ===== NOTIFICATIONS CONTENT ===== */}
        <div className="notification-wrapper">
          {/* ===== LEFT: Notification List ===== */}
          <div className="notification-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-card ${
                  selectedNotif.id === notif.id ? "selected" : ""
                } ${notif.status.toLowerCase()}`}
                onClick={() => setSelectedNotif(notif)}
              >
                <div className="notif-info">
                  <p className="notif-title">{notif.title}</p>
                  <small>{notif.storeName}</small>
                  <br />
                  <small>{notif.date}</small>
                </div>
                <span className={`status-badge ${notif.status.toLowerCase()}`}>
                  {notif.status}
                </span>
              </div>
            ))}
          </div>
          {/* ===== MIDDLE: Notification Details ===== */}
          <div className="notification-details">
            <h3>Seller Registration Approval</h3>
            <p><b>Seller Type:</b> {selectedNotif.sellerType}</p>
            <p><b>Company Name:</b> {selectedNotif.storeName}</p>
            <p><b>Business Registration No:</b> {selectedNotif.businessRegNo}</p>
            <p><b>Shop Name:</b> {selectedNotif.shopName}</p>
            <p><b>Pickup Address:</b> {selectedNotif.address}</p>
            <p><b>Email Address:</b> {selectedNotif.email}</p>
            <p>
              <b>Business Documents:</b> 
              <span className="documents-badge">{selectedNotif.documents}</span>
            </p>
            <p><b>Photos:</b></p>
            <div className="photos-grid">
              {selectedNotif.photos.map((p) => (
                <div key={p} className="photo-placeholder"></div>
              ))}
            </div>
          </div>
          {/* ===== RIGHT: Shop Info Card ===== */}
          <div className="shop-info-card">
            <div className="shop-img-placeholder"></div>
            <h3>{selectedNotif.storeName}</h3>
            <small>{selectedNotif.shopName}</small>
            <p><FaEnvelope /> {selectedNotif.email}</p>
            <p><FaPhone /> {selectedNotif.phone}</p>
            <p><FaMapMarkerAlt /> {selectedNotif.address}</p>
            <span className={`status-badge ${selectedNotif.status.toLowerCase()}`}>
              {selectedNotif.status}
            </span>
            <div className="action-buttons">
              <button className="decline-btn">Decline</button>
              <button className="approve-btn">Approve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminNotification;
