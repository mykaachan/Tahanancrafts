import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
export default function AdminArtisan() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);
  const artisans = [
    {
      name: "SM Sunrise Weavers",
      email: "HabingIbaan@email.com",
      phone: "09888888888",
      orders: 3,
      status: "Active",
      created: "15 February 2025",
      logo: "https://via.placeholder.com/40",
    },
    {
      name: "Iraya Baskets Lipa",
      email: "IrayaBask_Lipa@email.com",
      phone: "09777777777",
      orders: 1,
      status: "Active",
      created: "10 February 2025",
      logo: "https://via.placeholder.com/40",
    },
    {
      name: "Banig ni Lola",
      email: "baniglola@email.com",
      phone: "09993999997",
      orders: 0,
      status: "Inactive",
      created: "3 January 2025",
      logo: "https://via.placeholder.com/40",
    },
    {
      name: "Weave & Co.",
      email: "weaveco@email.com",
      phone: "09999599996",
      orders: 0,
      status: "Inactive",
      created: "29 December 2024",
      logo: "https://via.placeholder.com/40",
    },
    {
      name: "Artisan Hub",
      email: "artisanhub@email.com",
      phone: "09996999995",
      orders: 0,
      status: "Inactive",
      created: "3 August 2024",
      logo: "https://via.placeholder.com/40",
    },
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
        <div className="admindash-welcome">
          <h2>Artisans</h2>
        </div>
        {/* ===== ARTISAN TABLE (styled like AdminCustDetails) ===== */}
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
              {artisans.map((a, index) => (
                <tr key={index}>
                  <td>
                    <input type="radio" name="artisanSelect" />
                  </td>
                  <td>
                    <div className="cust-info">
                      <img src={a.logo} alt={a.name} />
                      <div>
                        <p className="cust-name">{a.name}</p>
                        <p className="cust-email">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{a.phone}</td>
                  <td>{a.orders}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        a.status === "Active" ? "active" : "inactive"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>{a.created}</td>
                  <td>
                    <button className="action-delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* ===== FOOTER ===== */}
          <div className="table-footer">
            <p>Showing 1 - 5 from 100</p>
            <div className="pagination">
              <button disabled>{"<"}</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button disabled>{">"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
