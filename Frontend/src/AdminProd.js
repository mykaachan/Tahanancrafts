import React, { useEffect, useState, useMemo } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function AdminProd() {
  const BASE_URL = "http://127.0.0.1:8000";
  const PRODUCTS_URL = `${BASE_URL}/api/products/admin/products/`;
  const DELETE_URL = `${BASE_URL}/api/products/product/delete_product/`;

  const navigate = useNavigate();

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "admin") {
      alert("Admins only.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ---------------- UI STATES ----------------
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // ---------------- DATA STATES ----------------
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // ---------------- SEARCH ----------------
  const [search, setSearch] = useState("");

  // ---------------- DELETE MODAL ----------------
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------- FETCH PRODUCTS ----------------
  async function fetchProducts(url) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const json = await res.json();

      setProducts(json.results || []);
      setNextPage(json.next);
      setPrevPage(json.previous);
      setCount(json.count || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      localStorage.clear();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchProducts(PRODUCTS_URL);
  }, []);

  // ---------------- FRONTEND SEARCH ----------------
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  // ---------------- DELETE HANDLERS ----------------
  function openDeleteModal(product, e) {
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setProductToDelete(null);
    setDeleteModalOpen(false);
    setDeleting(false);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${DELETE_URL}?id=${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      // remove locally
      setProducts((prev) =>
        prev.filter((p) => p.id !== productToDelete.id)
      );

      closeDeleteModal();
    } catch (err) {
      alert("Failed to delete product.");
      setDeleting(false);
    }
  }

  // ---------------- LOADING ----------------
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

  // ---------------- RENDER ----------------
  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* HEADER */}
        <header className="admindash-header">
          <input
            className="admindash-search"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((item) => {
                const stock = item.stock_quantity ?? 0;
                const price = item.sales_price || item.regular_price || "0.00";

                return (
                  <tr key={item.id}>
                    <td><input type="radio" /></td>

                    <td>
                      <Link
                        to={`/admindet/${item.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="cust-info">
                          <img
                            src={
                              item.main_image ||
                              "https://via.placeholder.com/45"
                            }
                            alt={item.name}
                          />
                          <div>
                            <p className="cust-name">{item.name}</p>
                            <p className="cust-email">
                              Added: {item.created_at?.split("T")[0]}
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
                        className={`status-badge ${
                          stock <= 5 ? "inactive" : "active"
                        }`}
                      >
                        {stock <= 5 ? "Low Stock" : "On Stock"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="action-delete"
                        onClick={(e) => openDeleteModal(item, e)}
                      >
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
              Showing {products.length} of {count} products
            </p>

            <div className="pagination">
              <button
                disabled={!prevPage}
                onClick={() => fetchProducts(prevPage)}
              >
                &lt;
              </button>

              <button
                disabled={!nextPage}
                onClick={() => fetchProducts(nextPage)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* DELETE MODAL */}
        {deleteModalOpen && productToDelete && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
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
