import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminArtisan() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  const BASE_API = "https://tahanancrafts.onrender.com"; 
  const MEDIA_URL = BASE_API;

  const [artisans, setArtisans] = useState([]);
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

  // INITIALS FOR AVATAR
  const getInitials = (name) => {
    if (!name) return "U";
    const p = name.split(" ");
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : p[0][0].toUpperCase();
  };

  // FETCH DATA
  useEffect(() => {
    async function load() {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      setArtisans(data.lists.artisans);
      setOrders(data.lists.orders);
    }
    load();
  }, []);

  // COUNT ORDERS BY ARTISAN
  const getOrderCount = (artisanId) => {
    return orders.filter((order) => order.artisan === artisanId).length;
  };

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search artisans..."
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
                  <ul>{notifications.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </div>
              )}
            </div>
            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        {/* TITLE */}
        <div className="admindash-welcome">
          <h2>Artisans</h2>
        </div>

        {/* ARTISAN TABLE */}
        <div className="admincust-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Shop Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {artisans.map((a, index) => {
                const logo = a.main_photo
                  ? `${MEDIA_URL}${a.main_photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      a.name
                    )}&background=random&color=fff`;

                const orderCount = getOrderCount(a.id);
                const status = orderCount > 0 ? "Active" : "Inactive";

                return (
                  <tr
                    key={index}
                    className="clickable-row"
                    onClick={() => navigate(`/adminartisandetails/${a.id}`)}
                  >
                    <td>
                      <input type="radio" />
                    </td>

                    <td>
                      <div className="cust-info">
                        <img src={logo} alt={a.name} />
                        <div>
                          <p className="cust-name">{a.name}</p>
                          <p className="cust-email">{a.short_description}</p>
                        </div>
                      </div>
                    </td>

                    <td>{a.location || "N/A"}</td>
                    <td>{orderCount}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>{new Date(a.created_at).toLocaleDateString()}</td>

                    <td>
                      <button className="action-delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* FOOTER */}
          <div className="table-footer">
            <p>Showing {artisans.length} artisans</p>

            <div className="pagination">
              <button disabled>{"<"}</button>
              <button className="active">1</button>
              <button disabled>{">"}</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
