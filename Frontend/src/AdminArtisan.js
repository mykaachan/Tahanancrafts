import React, { useEffect, useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_API = "https://tahanancrafts.onrender.com";
//const BASE_API = "http://127.0.0.1:8000";


export default function AdminArtisan() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ];

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      alert("Please log in using an admin account.");
      navigate("/login", { replace: true });
      return;
    }

    if (role !== "admin") {
      alert("Access denied. Admins only.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ---------------- FETCH ARTISANS ----------------
  useEffect(() => {
    async function loadArtisans() {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_API}/api/products/admin/artisans/?page=${page}`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 401 || res.status === 403) {
          alert("Session expired. Please log in again.");
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        setArtisans(data.results || []);
      } catch (err) {
        console.error("Failed to load artisans:", err);
      } finally {
        setLoading(false);
      }
    }

    loadArtisans();
  }, [page, navigate]);

  // ---------------- UI HELPERS ----------------
  const getAvatar = (artisan) => {
    if (artisan.main_photo) {
      return `${artisan.main_photo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      artisan.name
    )}&background=random&color=fff`;
  };

  // ---------------- RENDER ----------------
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
            disabled
          />

          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
              <span className="notif-dot"></span>

              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {notifications.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              className="admindash-logout"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>

            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        {/* TITLE */}
        <div className="admindash-welcome">
          <h2>Artisan Shops</h2>
        </div>

        {/* TABLE */}
        <div className="admincust-table">
          {loading ? (
            <p style={{ padding: 20 }}>Loading artisans...</p>
          ) : artisans.length === 0 ? (
            <p style={{ padding: 20 }}>No artisans found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Shop Name</th>
                  <th>Location</th>
                  <th>Pending Orders</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {artisans.map((a) => {
                  const orderCount = a.order_count || 0;
                  const status =  "Active";

                  return (
                    <tr
                      key={a.id}
                      className="clickable-row"
                      onClick={() =>
                        navigate(`/adminartisandetails/${a.id}`)
                      }
                    >
                      <td>
                        <input type="radio" />
                      </td>

                      <td>
                        <div className="cust-info">
                          <img src={getAvatar(a)} alt={a.name} />
                          <div>
                            <p className="cust-name">{a.name}</p>
                            <p className="cust-email">
                              {a.short_description || "—"}
                            </p>
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

                      <td>
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="action-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Delete action (future feature)");
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div className="table-footer">
            <p>Showing {artisans.length} artisans</p>

            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                {"<"}
              </button>
              <button className="active">{page}</button>
              <button onClick={() => setPage((p) => p + 1)}>{">"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
