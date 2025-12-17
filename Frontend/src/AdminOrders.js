import React, { useState, useEffect, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  //const BASE_API = "http://127.0.0.1:8000";
  const BASE_API = "https://tahanancrafts.onrender.com";

  const ORDERS_URL = `${BASE_API}/api/products/admin/orders/`;
  const PRODUCTS_URL = `${BASE_API}/api/products/admin/products/`;
  const ARTISANS_URL = `${BASE_API}/api/products/admin/artisans/`;
  const MEDIA_URL = BASE_API;

  const navigate = useNavigate();

  // ---------------- AUTH ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "admin") {
      alert("Admins only.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ---------------- UI ----------------
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(1);

  // ---------------- DATA ----------------
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ORDERS ----------------
  async function fetchOrders(url) {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!res.ok) throw new Error("Orders fetch failed");

    const json = await res.json();
    setOrders(json.results || []);
    setNextPage(json.next);
    setPrevPage(json.previous);
    setCount(json.count);
  }

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        // Orders (paginated)
        await fetchOrders(ORDERS_URL);

        // Products
        const prodRes = await fetch(PRODUCTS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const prodJson = await prodRes.json();
        setProducts(prodJson.results || []);

        // Artisans
        const artRes = await fetch(ARTISANS_URL, {
          headers: { Authorization: `Token ${token}` },
        });
        const artJson = await artRes.json();
        setArtisans(artJson.results || []);
      } catch (err) {
        console.error(err);
        localStorage.clear();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  // ---------------- SEARCH (FRONTEND ONLY) ----------------
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      if (!o.items?.length) return false;

      const product = products.find(p => p.id === o.items[0].product);
      const artisan = product
        ? artisans.find(a => a.id === product.artisan)
        : null;

      return (
        o.id.toString().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        product?.name.toLowerCase().includes(q) ||
        artisan?.name.toLowerCase().includes(q)
      );
    });
  }, [orders, search, products, artisans]);

  const getStatusClass = (status) => {
    if (["completed", "delivered", "to_review"].includes(status)) return "badge-green";
    if (["cancelled", "refund"].includes(status)) return "badge-red";
    return "badge-yellow";
  };

  if (loading) {
    return (
      <div className="admindash-container">
        <AdminSidebar />
        <div className="admindash-main"><h3>Loading Orders...</h3></div>
      </div>
    );
  }
  const itemsPerPage = 5;

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );


  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        <header className="admindash-header">
          <input
            className="admindash-search"
            placeholder="🔍 Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="admindash-header-right">
            <div className="admindash-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell size={20} />
              <span className="notif-dot" />
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

        <div className="admindash-welcome">
          <h2>Orders</h2>
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
                const item = order.items?.[0];

                // 🛡️ Guard: orders with no items
                if (!item) {
                  return (
                    <tr key={order.id}>
                      <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                        Order #{order.id} has no items
                      </td>
                    </tr>
                  );
                }

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
                        <img
                          src={product.main_image}
                          width={40}
                          alt={product.name}
                        />
                        <div>
                          <p className="prod-name">{product.name}</p>
                          <small>{artisan?.name || "Unknown Artisan"}</small>
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

          <div className="pagination">
            <span>Showing {filteredOrders.length} of {count}</span>

            <div className="pagination-buttons">
              <button disabled={!prevPage} onClick={() => fetchOrders(prevPage)}>&lt;</button>
              <button disabled={!nextPage} onClick={() => fetchOrders(nextPage)}>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
