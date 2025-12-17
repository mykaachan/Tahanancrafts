import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
} from "react-icons/fa";

export default function AdminCustDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_API = "http://127.0.0.1:8000";
  const MEDIA_URL = BASE_API;

  // ---------------- STATES ----------------
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  // ---------------- HELPERS ----------------
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getStatusClass = (status) => {
    const green = ["completed", "delivered", "to_review"];
    const red = ["refund", "cancelled"];
    if (green.includes(status)) return "badge-green";
    if (red.includes(status)) return "badge-red";
    return "badge-yellow";
  };

  // ---------------- FETCH DATA ----------------
  async function load() {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("user_role");

      if (!token || role !== "admin") {
        alert("Admins only.");
        navigate("/login", { replace: true });
        return;
      }

      const headers = { Authorization: `Token ${token}` };

      const [
        customersRes,
        ordersRes,
        productsRes,
        artisansRes,
      ] = await Promise.all([
        fetch(`${BASE_API}/api/users/admin/customers/`, { headers }),
        fetch(`${BASE_API}/api/products/admin/orders/?user=${id}`, { headers }),
        fetch(`${BASE_API}/api/products/admin/products/`, { headers }),
        fetch(`${BASE_API}/api/products/admin/artisans/`, { headers }),
      ]);

      if (!customersRes.ok) throw new Error("Customers fetch failed");

      const customersData = await customersRes.json();
      const foundCustomer = customersData.results.find(
        (c) => c.id === Number(id)
      );

      if (!foundCustomer) throw new Error("Customer not found");

      setCustomer(foundCustomer);
      setOrders((await ordersRes.json()).results || []);
      setProducts((await productsRes.json()).results || []);
      setArtisans((await artisansRes.json()).results || []);

    } catch (err) {
      console.error("AdminCustDetails error:", err);
      navigate("/login", { replace: true });
    }
  }
  
  if (!customer) {
    return <div className="admindash-loading">Loading customer...</div>;
  }

  // ---------------- COMPUTED VALUES ----------------
  const initials = getInitials(customer.name);

  const avatarSrc = customer.avatar
    ? customer.avatar.startsWith("http")
      ? customer.avatar
      : `${BASE_API}${customer.avatar}`
    : null;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalSpent = orders.reduce(
    (sum, o) => sum + Number(o.total_items_amount || 0),
    0
  );

  const totalRefunds = orders.filter((o) => o.status === "refund").length;

  // ---------------- RENDER ----------------
  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input className="admindash-search" placeholder="🔍 Search..." />

          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {notifications.length > 0 && <span className="notif-dot"></span>}

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

        {/* BREADCRUMB */}
        <div className="admindash-welcome breadcrumb-header">
          <h2>
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/admincust")}
            >
              Customers
            </span>{" "}
            &gt; {customer.id}
          </h2>
        </div>

        {/* MAIN CONTENT */}
        <div className="customer-details">
          {/* LEFT PROFILE */}
          <div className="cust-profile-card">
            <div className="cust-avatar-wrapper">
              {avatarSrc ? (
                <img src={avatarSrc} alt={initials} className="cust-avatar" />
              ) : (
                <div className="cust-avatar-bubble">{initials}</div>
              )}
            </div>

            <h3>{customer.name}</h3>
            <p className="cust-username">@{customer.username || initials}</p>

            <hr />

            <div className="cust-info-list">
              <p><FaUser /> <strong>ID:</strong> {customer.id}</p>
              <p><FaEnvelope /> <strong>Email:</strong> {customer.email}</p>
              <p><FaPhone /> <strong>Phone:</strong> {customer.phone || "N/A"}</p>
              <p><FaCalendarAlt /> <strong>Total Orders:</strong> {orders.length}</p>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="cust-summary">
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Spent</h4>
                <p className="amount">₱{totalSpent.toFixed(2)}</p>
              </div>

              <div className="cust-card orders">
                <h4>Total Orders</h4>
                <p className="amount">{orders.length}</p>
              </div>

              <div className="cust-card refunds">
                <h4>Total Refunds</h4>
                <p className="amount">{totalRefunds}</p>
              </div>
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="cust-history">
              <h4>Transaction History</h4>

              <table className="cust-history-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((o) => {
                    const item = o.items?.[0];
                    const product = products.find((p) => p.id === item?.product);
                    const artisan = artisans.find((a) => a.id === product?.artisan);

                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>

                        <td>
                          <div className="cust-prod">
                            <img
                              src={
                                product?.main_image
                                  ? MEDIA_URL + product.main_image
                                  : "https://via.placeholder.com/40"
                              }
                              width={40}
                              alt={product?.name || "Product"}
                            />
                            <div>
                              <p>{product?.name || "Unknown Product"}</p>
                              <small>{artisan?.name || "Unknown Artisan"}</small>
                            </div>
                          </div>
                        </td>

                        <td>₱{o.total_items_amount}</td>

                        <td>
                          <span className={`status-badge ${getStatusClass(o.status)}`}>
                            {o.status}
                          </span>
                        </td>

                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? "active" : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  &gt;
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
