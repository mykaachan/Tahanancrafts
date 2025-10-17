import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa"; // ✅ use react-icons instead

const AdminCust = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  const customers = [
    {
      id: 1,
      name: "Mikaela Mindanao",
      email: "Mikaelam@email.com",
      phone: "09999999999",
      orders: 13,
      status: "Active",
      created: "5 February 2025",
      image: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      name: "Juan Dimaano",
      email: "Juand-mno@email.com",
      phone: "09999999998",
      orders: 12,
      status: "Active",
      created: "3 January 2025",
      image: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      name: "Angela Panganiban",
      email: "PanganibanA@email.com",
      phone: "09999999997",
      orders: 10,
      status: "Active",
      created: "3 January 2025",
      image: "https://via.placeholder.com/40",
    },
    {
      id: 4,
      name: "Inday Himena",
      email: "d_himena@email.com",
      phone: "09999999996",
      orders: 9,
      status: "Active",
      created: "29 December 2024",
      image: "https://via.placeholder.com/40",
    },
    {
      id: 5,
      name: "Gabriel Kuminang",
      email: "Gabkmng@email.com",
      phone: "09999999995",
      orders: 4,
      status: "Inactive",
      created: "3 August 2024",
      image: "https://via.placeholder.com/40",
    },
  ];

  return (
    <div className="admindash-container">
      {/* ===== SIDEBAR ===== */}
      <AdminSidebar />

      {/* ===== MAIN SECTION ===== */}
      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search customers..."
          />
          <div className="admindash-header-right">
            {/* Bell Icon & Notifications */}
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
          <h2>Customers</h2>
        </div>

        {/* ===== CUSTOMER TABLE ===== */}
        <div className="admincust-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <input type="radio" name="selectCustomer" />
                  </td>
                  <td>
                    <div className="cust-info">
                      <img src={cust.image} alt={cust.name} />
                      <div>
                        <p className="cust-name">{cust.name}</p>
                        <p className="cust-email">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{cust.phone}</td>
                  <td>{cust.orders}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        cust.status === "Active" ? "active" : "inactive"
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>
                  <td>{cust.created}</td>
                  <td>
                    <button className="action-delete">
  <FaTrash />
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== TABLE FOOTER ===== */}
          <div className="table-footer">
            <p>Showing 1 - 5 from 100</p>
            <div className="pagination">
              <button disabled>&lt;</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>…</button>
              <button>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCust;
