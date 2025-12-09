import React, { useState, useEffect } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function AdminArtisanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;

  const [artisan, setArtisan] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  // Pagination
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 5;

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  // ---- LOAD DATA ----
  useEffect(() => {
    async function load() {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      const art = data.lists.artisans.find((a) => a.id === parseInt(id));
      setArtisan(art);

      const artisanOrders = data.lists.orders.filter(
        (o) => o.artisan === parseInt(id)
      );
      setOrders(artisanOrders);

      const artisanProducts = data.lists.products.filter(
        (p) => p.artisan === parseInt(id)
      );
      setProducts(artisanProducts);
    }
    load();
  }, [id]);

  if (!artisan) return <div>Loading artisan details...</div>;

  // Avatar
  const avatarSrc = artisan.main_photo
    ? `${MEDIA_URL}${artisan.main_photo}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        artisan.name
      )}&background=random&color=fff`;

  // Totals
  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.total_items_amount),
    0
  );
  const totalRefunds = orders.filter((o) => o.status === "refund").length;

  // Pagination Logic
  const totalOrderPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage
  );

  const totalProductPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (productPage - 1) * itemsPerPage,
    productPage * itemsPerPage
  );

  // Status classes
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
          <input
            className="admindash-search"
            placeholder="🔍 Search artisan details..."
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

        {/* BREADCRUMB */}
        <div className="admindash-welcome breadcrumb-header">
          <h2>
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/adminartisan")}
            >
              Artisans
            </span>{" "}
            &gt; {artisan.name}
          </h2>
        </div>

        {/* MAIN CONTENT */}
        <div className="customer-details">
          {/* SUMMARY CARDS */}
          <div className="cust-summary">
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Revenue</h4>
                <p className="amount">₱{totalRevenue.toLocaleString()}</p>
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
                    const item = o.items[0];
                    const product = products.find((p) => p.id === item.product);

                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>

                        <td>
                          <div className="cust-prod">
                            <img
                              src={MEDIA_URL + product.main_image}
                              width={45}
                              alt=""
                            />
                            <div>
                              <p className="prod-name">{product.name}</p>
                              <small>{product.categories[0]}</small>
                            </div>
                          </div>
                        </td>

                        <td>₱{o.total_items_amount}</td>

                        <td>
                          <span className={`status-badge ${getStatusClass(o.status)}`}>
                            {o.status.replace("_", " ")}
                          </span>
                        </td>

                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ORDER PAGINATION */}
              <div className="pagination">
                <button disabled={orderPage === 1} onClick={() => setOrderPage(orderPage - 1)}>
                  &lt;
                </button>

                {[...Array(totalOrderPages)].map((_, i) => (
                  <button
                    key={i}
                    className={orderPage === i + 1 ? "active" : ""}
                    onClick={() => setOrderPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={orderPage === totalOrderPages}
                  onClick={() => setOrderPage(orderPage + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="cust-history">
              <h4>Products ({products.length})</h4>

              <table className="cust-history-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="cust-prod">
                          <img
                            src={MEDIA_URL + p.main_image}
                            width={50}
                            alt={p.name}
                          />
                          <div>
                            <p className="prod-name">{p.name}</p>
                            <small>{p.categories[0]}</small>
                          </div>
                        </div>
                      </td>

                      <td>{p.stock_quantity}</td>
                      <td>₱{p.sales_price}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            p.stock_quantity <= 5 ? "badge-red" : "badge-green"
                          }`}
                        >
                          {p.stock_quantity <= 5 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>

                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PRODUCT PAGINATION */}
              <div className="pagination">
                <button
                  disabled={productPage === 1}
                  onClick={() => setProductPage(productPage - 1)}
                >
                  &lt;
                </button>

                {[...Array(totalProductPages)].map((_, i) => (
                  <button
                    key={i}
                    className={productPage === i + 1 ? "active" : ""}
                    onClick={() => setProductPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={productPage === totalProductPages}
                  onClick={() => setProductPage(productPage + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PROFILE CARD */}
          <div className="cust-profile-card">
            <img src={avatarSrc} alt="artisan-logo" className="cust-avatar" />

            <h3>{artisan.name}</h3>
            <p className="cust-username">{artisan.short_description}</p>
            <hr />

            <div className="cust-info-list">
              <p>
                <FaUser className="cust-icon" /> <strong>ID:</strong> {artisan.id}
              </p>
              <p>
                <FaEnvelope className="cust-icon" />{" "}
                <strong>Email:</strong> {artisan.user_email || "N/A"}
              </p>
              <p>
                <FaPhone className="cust-icon" />{" "}
                <strong>Phone:</strong> {artisan.user_phone || "N/A"}
              </p>
              <p>
                <FaMapMarkerAlt className="cust-icon" />{" "}
                <strong>Location:</strong> {artisan.location}
              </p>
              <p>
                <FaCalendarAlt className="cust-icon" />{" "}
                <strong>Created:</strong>{" "}
                {new Date(artisan.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
