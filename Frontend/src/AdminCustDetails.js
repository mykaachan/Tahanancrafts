import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function AdminCustDetails() {
  const { id } = useParams();
  //const BASE_API = "http://127.0.0.1:8000";
  const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  // Extract initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials(customer?.name);

  // Build avatar source
  const avatarSrc =
    customer?.avatar
      ? customer.avatar.startsWith("http")
        ? customer.avatar
        : `${process.env.REACT_APP_BASE_URL}${customer.avatar}`
      : null;


  useEffect(() => {
    async function load() {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      const cust = data.lists.customers.find((c) => c.id === parseInt(id));
      const userOrders = data.lists.orders.filter((o) => o.user === parseInt(id));

      setCustomer(cust);
      setOrders(userOrders);
      setProducts(data.lists.products);
    }
    load();
  }, [id]);

  if (!customer) return <div>Loading...</div>;

  // Total spent
  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_items_amount), 0);

  // Total refunds
  const totalRefunds = orders.filter((o) => o.status === "refund").length;

  return (
    <div className="admindash-container">
      <AdminSidebar />
      <div className="admindash-main">
        
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
                  <ul>{notifications.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </div>
              )}
            </div>

            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        <div className="admindash-welcome">
         <div className="admindash-welcome breadcrumb-header">
            <h2>
              <span className="breadcrumb-link" onClick={() => navigate("/admincust")}>
                Customers
              </span>{" "}
              &gt; {customer?.id}
            </h2>
          </div>
        </div>

        <div className="customer-details">
          <div className="cust-profile-card">
            <div className="cust-avatar-wrapper">
              {avatarSrc ? (
                <img src={avatarSrc} alt={initials} className="cust-avatar" />
              ) : (
                <div className="cust-avatar-bubble">{initials}</div>
              )}
            </div>

            <h3>{customer.name}</h3>
            <p className="cust-username">@_{customer.username}</p>

            <hr />

            <div className="cust-info-list">
              <p><FaUser /> <strong>ID:</strong> {customer.id}</p>
              <p><FaEnvelope /> <strong>Email:</strong> {customer.email}</p>
              <p><FaPhone /> <strong>Phone:</strong> {customer.phone || "N/A"}</p>
              <p><FaCalendarAlt /> <strong>Total Orders:</strong> {orders.length}</p>
            </div>
          </div>

          {/* RIGHT SIDE */}
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

            {/* Transaction Table */}
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
                  {orders.map((o) => {
                    const firstItem = o.items[0];
                    const product = products.find((p) => p.id === firstItem.product);

                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>

                        <td>
                          <div className="cust-prod">
                            <img
                              src={MEDIA_URL + product.main_image}
                              alt={product.name}
                              width={40}
                            />
                            <div>
                              <p>{product.name}</p>
                              <small>{product.categories[0]}</small>
                            </div>
                          </div>
                        </td>

                        <td>₱{o.total_items_amount}</td>

                        <td>
                          <span className="status-badge active">{o.status}</span>
                        </td>

                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
