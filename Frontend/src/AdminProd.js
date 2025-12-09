import React, { useEffect, useState, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AdminProd() {
  const BASE_URL = "https://tahanancrafts.onrender.com";
  const DASHBOARD_URL = "https://tahanancrafts.onrender.com/api/products/admin/dashboard/";
  const DELETE_URL = "https://tahanancrafts.onrender.com/api/products/product/delete_product/";

  // UI states
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [artisans, setArtisans] = useState([]);

  // Search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch backend dashboard data
  useEffect(() => {
    fetch(DASHBOARD_URL)
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.lists.products || []);
        setOrders(json.lists.orders || []);
        setArtisans(json.lists.artisans || []);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // compute number of orders each product has
  function getOrdersCountForProduct(productId) {
    let count = 0;
    for (const o of orders) {
      if (!o.items) continue;
      for (const it of o.items) {
        if (it.product === productId) {
          count += Number(it.quantity || 0);
        }
      }
    }
    return count;
  }

  // enrich product data with stock, orders, artisan name, image
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const ordersCount = getOrdersCountForProduct(p.id);
      const artisan = artisans.find((a) => a.id === p.artisan);

      let img = p.main_image;
      if (img && img.startsWith("/media")) img = BASE_URL + img;

      return {
        ...p,
        ordersCount,
        artisanName: artisan ? artisan.name : "Unknown Artisan",
        imageUrl: img,
      };
    });
  }, [products, orders, artisans]);

  // Searching
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrichedProducts;

    return enrichedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.artisanName.toLowerCase().includes(q)
    );
  }, [enrichedProducts, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Open delete modal
  function openDeleteModal(product, e) {
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }

  // Close delete modal
  function closeDeleteModal() {
    setProductToDelete(null);
    setDeleteModalOpen(false);
    setDeleting(false);
  }

  // Confirm delete
  async function confirmDelete() {
    if (!productToDelete) return;
    setDeleting(true);

    try {
      const url = `${DELETE_URL}?id=${productToDelete.id}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        alert("Delete failed.");
        setDeleting(false);
        return;
      }

      // Remove product locally
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      alert("Network error.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="admindash-container">
        <AdminSidebar />
        <div className="admindash-main">
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input
            className="admindash-search"
            placeholder="🔍 Search product or artisan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="admindash-header-right">
            <div className="admindash-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell size={20} color="#fffdf9" />
              {notifications.length > 0 && <span className="notif-dot" />}
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

        {/* TITLE */}
        <div className="admindash-welcome">
          <h2>Products</h2>
        </div>

        {/* PRODUCT TABLE */}
        <div className="admincust-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pageProducts.map((item) => {
                const stock = item.stock_quantity ?? 0;
                const price = item.sales_price || item.regular_price || "0.00";

                return (
                  <tr key={item.id}>
                    <td>
                      <input type="radio" />
                    </td>
                    <td>
                      <Link
                        to={`/admindet/${item.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="cust-info" style={{ cursor: "pointer" }}>
                          <img
                            src={item.imageUrl || "https://via.placeholder.com/45"}
                            alt={item.name}
                          />
                          <div>
                            <p className="cust-name">{item.name}</p>
                            <p className="cust-email">
                              {item.artisanName}
                              <br />
                              Added: {item.created_at?.split("T")[0] || "—"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td>{stock}</td>

                    <td>
                      ₱{Number(price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${stock <= 5 ? "inactive" : "active"}`}
                      >
                        {stock <= 5 ? "Low Stock" : "On Stock"}
                      </span>
                    </td>

                    <td>{item.ordersCount}</td>

                    <td>
                      <button className="action-delete" onClick={(e) => openDeleteModal(item, e)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="table-footer">
            <p>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? "active" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRM MODAL */}
        {deleteModalOpen && productToDelete && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Product</h3>
              <p>Are you sure you want to delete:</p>
              <strong>{productToDelete.name}</strong>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="admindash-logout" onClick={closeDeleteModal}>
                  Cancel
                </button>

                <button className="delete-btn" onClick={confirmDelete}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
