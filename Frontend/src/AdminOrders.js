import React, { useState, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const navigate = useNavigate();

  // ================== UI ==================
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(1);

  // ================== FAKE DATA ==================

  const products = [
    { id: 101, name: "Traditional Barong", artisan: "Iraya Basketry", main_image: "http://127.0.0.1:8000/media/products/main/barong.png" },
    { id: 102, name: "Traditional Barong", artisan: "Iraya Basketry", main_image: "http://127.0.0.1:8000/media/products/main/barong.png" },
    { id: 103, name: "Floor Mat", artisan: "Iraya Basketry", main_image: "http://127.0.0.1:8000/media/products/main/mat.png" },
    { id: 104, name: "Vase", artisan: "Iraya Basketry", main_image: "http://127.0.0.1:8000/media/media/products/main/20087121_50173208_600.webp" },
    { id: 105, name: "Ceramic Mug", artisan: "Banig Handicrafts", main_image: "http://127.0.0.1:8000/media/media/products/main/497263654_18324018016200726_7373794072908281053_n.jpg" },
  ];

  const orders = [
    { id: 115, status: "delivered", total_items_amount: 4674, created_at: "2025-12-15", product_id: 101 },
    { id: 114, status: "awaiting_payment", total_items_amount: 404.04, created_at: "2025-12-15", product_id: 102 },
    { id: 113, status: "processing", total_items_amount: 450, created_at: "2025-12-13", product_id: 103 },
    { id: 112, status: "processing", total_items_amount: 750, created_at: "2025-12-13", product_id: 104 },
    { id: 111, status: "awaiting_verification", total_items_amount: 320, created_at: "2025-12-10", product_id: 105 },
    { id: 110, status: "refund", total_items_amount: 420, created_at: "2025-12-09", product_id: 101 },
    { id: 109, status: "awaiting_payment", total_items_amount: 600, created_at: "2025-12-07", product_id: 102 },
    { id: 108, status: "delivered", total_items_amount: 280, created_at: "2025-12-07", product_id: 103 },
    { id: 107, status: "delivered", total_items_amount: 450, created_at: "2025-12-07", product_id: 104 },
    { id: 106, status: "delivered", total_items_amount: 200, created_at: "2025-12-06", product_id: 105 },
  ];

  // ================== SEARCH ==================
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o =>
      o.id.toString().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  }, [search]);

  // ================== PAGINATION ==================
  const itemsPerPage = 10;
  const totalPages = "12";

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getStatusClass = (status) => {
    if (["completed", "delivered"].includes(status)) return "badge-green";
    if (["cancelled"].includes(status)) return "badge-red";
    return "badge-yellow";
  };

  // ================== RENDER ==================
  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
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

            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle" />
          </div>
        </header>

        <div className="admindash-welcome">
          <h2>Orders</h2>
        </div>

        {/* TABLE */}
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
              {paginatedOrders.map(order => {
                const product = products.find(p => p.id === order.product_id);

                return (
                  <tr
                    key={order.id}
                    className="clickable-row"
                    onClick={() => navigate(`/adminorders/${order.id}`)}
                  >
                    <td>
                      <div className="cust-prod">
                        <img src={product.main_image} width={40} alt="" />
                        <div>
                          <p className="prod-name">{product.name}</p>
                          <small>{product.artisan}</small>
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
            <span>Page {page} of {totalPages}</span>

            <div className="pagination-buttons">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
