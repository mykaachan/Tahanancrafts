import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminCust() {
  const navigate = useNavigate();
  //const BASE_API = "http://127.0.0.1:8000";
  const BASE_API = "https://tahanancrafts.onrender.com";


  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("user_role");
        
        if (!token || role !== "admin") {
          alert("Admins only.");
          navigate("/login", { replace: true });
          return;
        }
        const res = await fetch(
          `${BASE_API}/api/products/admin/customers/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        // ✅ PAGINATED RESPONSE
        setCustomers(data.results || []);

      } catch (error) {
        console.error("Fetch error:", error);
        navigate("/login");
      }
    }

    fetchCustomers();
  }, [navigate]);


  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input className="admindash-search" placeholder="🔍 Search customers..." />

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

        <div className="admindash-welcome">
          <h2>Customers</h2>
        </div>

        <div className="admincust-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <input type="radio" />
                  </td>

                  <td
                    className="cust-info"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admincustdetails/${cust.id}`)}
                  >
                    <div>
                      <p className="cust-name">{cust.name}</p>
                      <p className="cust-email">{cust.email}</p>
                    </div>
                  </td>

                  <td>{cust.phone || "N/A"}</td>

                  <td>{cust.total_orders ?? "—"}</td>

                  <td>
                    <span className="status-badge active">Active</span>
                  </td>

                  <td>
                    <button className="action-delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            <p>Showing {customers.length} customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
