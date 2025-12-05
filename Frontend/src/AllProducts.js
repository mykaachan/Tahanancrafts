import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./AllProducts.css";
import { getImageUrl } from "./api";

const AllProducts = () => {
  const navigate = useNavigate();
  const artisanId = localStorage.getItem("artisan_id");
  //const API_URL = "http://127.0.0.1:8000";
  const API_URL = "https://tahanancrafts.onrender.com"; 

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  // ----------------------------------------
  // STOCK STATUS HELPERS
  // ----------------------------------------
  function stockStatusClass(stockQty) {
    if (stockQty === 0) return "status-out";
    if (stockQty > 0 && stockQty <= 10) return "status-low";
    return "status-on";
  }

  function stockStatusLabel(stockQty) {
    if (stockQty === 0) return "Out of Stock";
    if (stockQty > 0 && stockQty <= 10) return "Low Stock";
    return "On Stock";
  }

  // ----------------------------------------
  // DELETE PRODUCT
  // ----------------------------------------
  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(
        `${API_URL}/api/products/product/delete_product/?id=${id}`,
        { method: "DELETE" }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        alert(data.message || "Product deleted successfully.");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Network error while deleting product.");
    }
  }

  // ----------------------------------------
  // FETCH PRODUCTS
  // ----------------------------------------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products/product/shop/${artisanId}/`);
        const data = await res.json();

        const items = Array.isArray(data) ? data : data.products || [];
        setProducts(items);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [artisanId, API_URL]);

  // ----------------------------------------
  // SEARCH FILTER
  // ----------------------------------------
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------
  // PAGINATION LOGIC
  // ----------------------------------------
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Fix: Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <Layout>
      <div className="all-products-page-container">
        <h1 className="page-title">Product Details</h1>

        <div className="products-section">
          <div className="products-header">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderRadius: "20px",
                  padding: "4px 16px",
                  border: "1px solid #ccc",
                  width: "220px",
                }}
              />
            </div>
            <h2>Products</h2>
          </div>

          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <>
              {/* PRODUCT TABLE */}
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentProducts.map((product) => {
                    const status = stockStatusLabel(product.stock_quantity);
                    const price = product.sales_price || product.regular_price;

                    return (
                      <tr key={product.id}>
                        <td className="product-info">
                          <img
                            src={getImageUrl(product.main_image)}
                            alt={product.name}
                            className="product-image"
                          />
                          <div className="product-details">
                            <div className="product-name">{product.name}</div>
                            <div className="product-date">
                              {product.created_at?.slice(0, 10)}
                            </div>
                          </div>
                        </td>

                        <td>{product.stock_quantity}</td>
                        <td>₱{Number(price).toLocaleString()}</td>

                        <td>
                          <span className={`product-status ${stockStatusClass(product.stock_quantity)}`}>
                            {status}
                          </span>
                        </td>

                        <td>{product.order_count || 0}</td>

                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/edit-product`)}
                            title="Edit Product"
                          >
                            ✏️
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <img src="/images/trash.png" alt="Delete" className="delete-icon" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINATION CONTROLS */}
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}

          <div className="add-product-btn-container">
            <button
              className="btn-primary"
              onClick={() => navigate("/add-product")}
            >
              + Add a New Product
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllProducts;
