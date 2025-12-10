// src/AdminOrders.js
import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);

  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      setOrders(data.lists.orders);
      setProducts(data.lists.products);
      setArtisans(data.lists.artisans);
    }
    load();
  }, []);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getStatusClass = (status) => {
    const green = ["completed", "delivered", "to_review"];
    const red = ["refund", "cancelled"];
    if (green.includes(status)) return "badge-green";
    if (red.includes(status)) return "badge-red";
    return "badge-yellow";
  };

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input className="admindash-search" placeholder="🔍 Search orders..." />

          <div className="admindash-header-right">
            <div className="admindash-bell" onClick={() => setShowNotifications(!showNotifications)}>
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
          <h2>Orders &gt; History</h2>
        </div>

        <div className="cust-history">
          <table className="cust-history-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => {
                const item = order.items[0];
                const product = products.find((p) => p.id === item.product);
                if (!product) return null;

                const artisan = artisans.find((a) => a.id === product.artisan);

                return (
                  <tr
                    key={order.id}
                    className="clickable-row"
                    onClick={() => navigate(`/adminorders/${order.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div className="cust-prod">
                        <img src={MEDIA_URL + product.main_image} width={40} alt="" />
                        <div>
                          <p className="prod-name">{product.name}</p>
                          <small>{artisan ? artisan.name : "Unknown Artisan"}</small>
                        </div>
                      </div>
                    </td>

                    <td>#{order.id}</td>
                    <td>₱{order.total_items_amount}</td>

                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>

                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <span>
              Showing {(page - 1) * itemsPerPage + 1} -{" "}
              {Math.min(page * itemsPerPage, orders.length)} of {orders.length}
            </span>

            <div className="pagination-buttons">
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
  );
}
