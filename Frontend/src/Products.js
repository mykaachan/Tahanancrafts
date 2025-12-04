import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Products.css";
import Footer from "./Footer";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchCategories, fetchMaterials, getImageUrl } from "./api";

function FilterGroup({ title, items, selectedItems, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`filter-group ${expanded ? "expanded" : ""}`}>
      <h4>{title}</h4>
      {items.map((item, index) => (
        <label
          key={item.id}
          style={{
            display: expanded || index < 4 ? "block" : "none",
          }}
        >
          <div className="filter-item">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => onChange(item.id)}
            />
            <span>{item.name}</span>
          </div>
        </label>
      ))}

      {items.length > 4 && (
        <button className="show-more-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    async function loadFilters() {
      try {
        const [catData, matData] = await Promise.all([
          fetchCategories(),
          fetchMaterials(),
        ]);

        setCategories(catData);
        setMaterials(matData);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    }

    loadFilters();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/products/product/products/`;

        const response = await fetch(url);
        let data = await response.json();

        if (selectedCategories.length > 0) {
          data = data.filter((p) =>
            p.categories.some((c) => selectedCategories.includes(c.id))
          );
        }

        if (selectedMaterials.length > 0) {
          data = data.filter((p) =>
            p.materials.some((m) => selectedMaterials.includes(m.id))
          );
        }

        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    }

    loadProducts();
  }, [selectedCategories, selectedMaterials]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedMaterials]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const indexOfLast = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirst = indexOfLast - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  function handleProductClick(productId) {
    const userId = localStorage.getItem("user_id");

    fetch(`${process.env.REACT_APP_API_URL}/api/products/product/log-view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, user_id: userId }),
    });

    navigate(`/product/${productId}`);
  }

  return (
    <div className="products-page">
      {/* HEADER */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />

        <nav className="nav-links">
          <ul>
            <li>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                Home
              </Link>
            </li>
            <li>Products</li>
            <li>
              <Link
                to="/story"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Story
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>

          <Link to="/cart" style={{ textDecoration: "none" }}>
            <button className="cart-btn">CART 🛒</button>
          </Link>
        </div>
      </header>

      {/* PAGE LAYOUT */}
      <div className="products-layout">
        {/* FILTERS */}
        <aside className="products-filters">
          <h3>Filter</h3>

          <button
            className="clear-filters-btn"
            onClick={() => {
              setSelectedCategories([]);
              setSelectedMaterials([]);
            }}
          >
            Clear All Filters ✕
          </button>

          <FilterGroup
            title="Category"
            items={categories}
            selectedItems={selectedCategories}
            onChange={(id) =>
              setSelectedCategories((prev) =>
                prev.includes(id)
                  ? prev.filter((c) => c !== id)
                  : [...prev, id]
              )
            }
          />

          <FilterGroup
            title="Material"
            items={materials}
            selectedItems={selectedMaterials}
            onChange={(id) =>
              setSelectedMaterials((prev) =>
                prev.includes(id)
                  ? prev.filter((m) => m !== id)
                  : [...prev, id]
              )
            }
          />
        </aside>

        {/* PRODUCTS */}
        <section className="products-content">
          <div className="products-grid">
            {currentProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              currentProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="product-card"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={getImageUrl(product.main_image)}
                      alt={product.name}
                    />
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>

                    <div className="price-row">
                      {product.sales_price ? (
                        <>
                          <span className="price-sale">
                            ₱{product.sales_price}
                          </span>

                          <span className="price-regular">
                            ₱{product.regular_price}
                          </span>

                          <span className="price-discount">
                            -
                            {Math.round(
                              ((product.regular_price -
                                product.sales_price) /
                                product.regular_price) *
                                100
                            )}
                            %
                          </span>
                        </>
                      ) : (
                        <span className="price-sale">
                          ₱{product.regular_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
export default Products;
