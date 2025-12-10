import React, { useEffect, useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { useParams, useNavigate } from "react-router-dom";
import { FaBell, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

export default function AdminOrderDet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [artisans, setArtisans] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      const o = data.lists.orders.find((ord) => ord.id === parseInt(id));
      setOrder(o);

      setProducts(data.lists.products);
      setCustomers(data.lists.customers);
      setArtisans(data.lists.artisans);
    }
    load();
  }, [id]);

  if (!order) return <div>Loading order...</div>;

  const customer = customers.find((c) => c.id === order.user);

  const itemsDetailed = order.items.map((i) => {
    const product = products.find((p) => p.id === i.product);
    const artisan = artisans.find((a) => a.id === product.artisan);
    return { item: i, product, artisan };
  });

  const avatarSrc = customer?.avatar
    ? customer.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        customer?.name || "User"
      )}&background=random&color=fff`;

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
          <input className="admindash-search" placeholder="Search order..." />

          <div className="admindash-header-right">
            <div className="admindash-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell size={20} />

              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    <li>Order update received</li>
                    <li>New customer inquiry</li>
                  </ul>
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
            <span className="breadcrumb-link" onClick={() => navigate("/adminorders")}>
              Orders
            </span>{" "}
            &gt; #{order.id}
          </h2>
        </div>

        <div className="customer-details">
          {/* LEFT SECTION: ORDER SUMMARY */}
          <div className="cust-summary">
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Items Amount</h4>
                <p className="amount">₱{order.total_items_amount}</p>
              </div>

              <div className="cust-card orders">
                <h4>Shipping Fee</h4>
                <p className="amount">₱{order.shipping_fee}</p>
              </div>

              <div className="cust-card refunds">
                <h4>Grand Total</h4>
                <p className="amount">₱{order.grand_total}</p>
              </div>
            </div>

            {/* ORDER ITEMS TABLE */}
            <div className="cust-history">
              <h4>Items Purchased</h4>

              <table className="cust-history-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Artisan</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>
                  {itemsDetailed.map(({ item, product, artisan }) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cust-prod">
                          <img
                            src={MEDIA_URL + product.main_image}
                            alt=""
                            width={40}
                          />
                          <div>
                            <p>{product.name}</p>
                            <small>{product.categories[0]}</small>
                          </div>
                        </div>
                      </td>

                      <td>{artisan?.name || "Unknown Artisan"}</td>

                      <td>{item.quantity}</td>

                      <td>₱{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* STATUS */}
            <div className="cust-history">
              <h4>Order Status</h4>
              <p>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status.replace("_", " ")}
                </span>
              </p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> {order.payment_method.toUpperCase()}</p>
            </div>
          </div>

          {/* RIGHT SECTION: CUSTOMER INFO */}
          <div className="cust-profile-card">
            <img src={avatarSrc} alt="customer" className="cust-avatar" />

            <h3>{customer.name}</h3>
            <p className="cust-username">@{customer.username || "Customer"}</p>

            <hr />

            <div className="cust-info-list">
              <p><FaUser /> <strong>ID:</strong> {customer.id}</p>
              <p><FaEnvelope /> <strong>Email:</strong> {customer.email}</p>
              <p><FaPhone /> <strong>Phone:</strong> {customer.phone || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
