import React, { useEffect, useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { useParams, useNavigate } from "react-router-dom";
import { FaBell, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

export default function AdminOrderDet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_API = "http://127.0.0.1:8000";
  //const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;

  const ORDERS_URL = `${BASE_API}/api/products/admin/orders/?search=${id}`;
  const PRODUCTS_URL = `${BASE_API}/api/products/admin/products/`;
  const CUSTOMERS_URL = `${BASE_API}/api/products/admin/customers/`;
  const ARTISANS_URL = `${BASE_API}/api/products/admin/artisans/`;

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);

  // ---------------- AUTH ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "admin") {
      alert("Admins only.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        // Fetch order
        const orderRes = await fetch(ORDERS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const orderJson = await orderRes.json();
        const foundOrder = orderJson.results?.find(
          (o) => o.id === parseInt(id)
        );
        if (!foundOrder) throw new Error("Order not found");
        setOrder(foundOrder);

        // Fetch products
        const prodRes = await fetch(PRODUCTS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const prodJson = await prodRes.json();
        setProducts(prodJson.results || []);

        // Fetch customers
        const custRes = await fetch(CUSTOMERS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const custJson = await custRes.json();
        setCustomers(custJson.results || []);

        // Fetch artisans
        const artRes = await fetch(ARTISANS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const artJson = await artRes.json();
        setArtisans(artJson.results || []);
      } catch (err) {
        console.error("AdminOrderDet error:", err);
        navigate("/adminorders");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  if (loading || !order) {
    return (
      <div className="admindash-container">
        <AdminSidebar />
        <div className="admindash-main">
          <h3>Loading order...</h3>
        </div>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === order.user);

  const itemsDetailed = order.items.map((i) => {
    const product = products.find((p) => p.id === i.product);
    const artisan = product
      ? artisans.find((a) => a.id === product.artisan)
      : null;
    return { item: i, product, artisan };
  });

  const avatarSrc = customer?.avatar
    ? customer.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        customer?.name || "User"
      )}&background=random&color=fff`;

  const getStatusClass = (status) => {
    if (["completed", "delivered", "to_review"].includes(status)) return "badge-green";
    if (["refund", "cancelled"].includes(status)) return "badge-red";
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
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
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

            <div className="admindash-profile-circle" />
          </div>
        </header>

        {/* BREADCRUMB */}
        <div className="admindash-welcome breadcrumb-header">
          <h2>
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/adminorders")}
            >
              Orders
            </span>{" "}
            &gt; #{order.id}
          </h2>
        </div>

        <div className="customer-details">
          {/* LEFT */}
          <div className="cust-summary">
            <div className="cust-cards">
              <div className="cust-card spent">
                <h4>Total Items</h4>
                <p className="amount">₱{order.total_items_amount}</p>
              </div>

              <div className="cust-card orders">
                <h4>Shipping</h4>
                <p className="amount">₱{order.shipping_fee}</p>
              </div>

              <div className="cust-card refunds">
                <h4>Grand Total</h4>
                <p className="amount">₱{order.grand_total}</p>
              </div>
            </div>

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
                            src={product.main_image}
                            width={40}
                            alt={product.name}
                          />
                          <div>
                            <p>{product.name}</p>
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

            <div className="cust-history">
              <h4>Order Status</h4>
              <span className={`status-badge ${getStatusClass(order.status)}`}>
                {order.status.replace("_", " ")}
              </span>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Payment:</strong> {order.payment_method.toUpperCase()}</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="cust-profile-card">
            <img src={avatarSrc} className="cust-avatar" alt="customer" />
            <h3>{customer?.name}</h3>
            <p className="cust-username">@{customer?.username || "Customer"}</p>

            <hr />

            <div className="cust-info-list">
              <p><FaUser /> <strong>ID:</strong> {customer?.id}</p>
              <p><FaEnvelope /> <strong>Email:</strong> {customer?.email}</p>
              <p><FaPhone /> <strong>Phone:</strong> {customer?.phone || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
