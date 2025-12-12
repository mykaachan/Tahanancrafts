import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Products.css";
import Footer from "./Footer";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchCategories, fetchMaterials, getImageUrl } from "./api";

const API_URL = process.env.REACT_APP_API_URL || "https://tahanancrafts.onrender.com";
//const API_URL = "http://127.0.0.1:8000";
const PRODUCTS_PER_PAGE = 12;

/* ---------- Simple cache helpers (localStorage) ---------- */
const setCache = (key, value, etag = null) => {
  const payload = {
    ts: Date.now(),
    etag,
    data: value,
  };
  try { localStorage.setItem(key, JSON.stringify(payload)); } catch (e) {}
};

const getCache = (key, maxAge = Infinity) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.ts || 0) > maxAge) return parsed;
    return parsed;
  } catch (e) { return null; }
};

/* TTLs (ms) */
const CATEGORIES_TTL = 24 * 60 * 60 * 1000; // 24h
const MATERIALS_TTL = 24 * 60 * 60 * 1000;  // 24h
const PRODUCTS_TTL = 2 * 60 * 1000;         // 2 minutes (stale-while-revalidate)

/* ---------- Component ---------- */
function Products() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // cache all products
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------- Debounced search (unchanged) ---------- */
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ---------- Load filters with cache + stale-while-revalidate ---------- */
  useEffect(() => {
    let cancelled = false;
    async function loadCached(name, fetchFn, setter, ttl) {
      const cached = getCache(name, ttl);
      if (cached && cached.data) {
        setter(cached.data);
      }
      // background refresh; use etag if present
      try {
        const headers = {};
        if (cached?.etag) headers["If-None-Match"] = cached.etag;
        const res = await fetch(await fetchFn(), { headers }); // fetchFn returns URL (see api helpers)
        if (cancelled) return;
        if (res.status === 304) {
          // not modified
          return;
        }
        const etag = res.headers.get("etag");
        const data = await res.json();
        setter(data);
        setCache(name, data, etag);
      } catch (err) {
        // ignore background failure
        console.debug("Background refresh failed for", name, err);
      }
    }

    loadCached("tc_categories", async () => {
      // if you have a fetchCategories URL, return that, else call API
      // fetchCategories() helper may already fetch; we wrap to keep same behaviour
      return `${API_URL}/api/products/product/categories/`;
    }, setCategories, CATEGORIES_TTL);

    loadCached("tc_materials", async () => `${API_URL}/api/products/product/materials/`, setMaterials, MATERIALS_TTL);

    return () => { cancelled = true; };
  }, []);

  /* ---------- Load products with cache + stale-while-revalidate ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // try cache first
      const cached = getCache("tc_products", PRODUCTS_TTL);
      if (cached && cached.data) {
        setAllProducts(cached.data);
        setLoading(false);
      } else {
        setLoading(true);
      }

      // Fetch fresh in background (use ETag if available)
      try {
        const headers = {};
        if (cached?.etag) headers["If-None-Match"] = cached.etag;
        const res = await fetch(`${API_URL}/api/products/product/products/`, { headers });
        if (cancelled) return;
        if (res.status === 304) {
          // not modified
          // update timestamp so TTL restarts
          setCache("tc_products", cached.data, cached.etag);
          setLoading(false);
          return;
        }
        const etag = res.headers.get("etag");
        const data = await res.json();
        setAllProducts(data);
        setCache("tc_products", data, etag);
        setLoading(false);
      } catch (err) {
        console.error("Error loading products:", err);
        // keep showing cached data if any
        if (!cached?.data) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---------- Filtering: useMemo for fast re-compute ---------- */
  const filteredProducts = useMemo(() => {
    let filtered = allProducts || [];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        p.categories && p.categories.some((c) => selectedCategories.includes(c.id))
      );
    }
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter((p) =>
        p.materials && p.materials.some((m) => selectedMaterials.includes(m.id))
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.brandName || "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allProducts, selectedCategories, selectedMaterials, debouncedSearch]);

  useEffect(() => {
    setProducts(filteredProducts);
    setCurrentPage(1);
  }, [filteredProducts]);

  // Pagination (unchanged)
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const currentProducts = products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  // handleProductClick unchanged
  function handleProductClick(productId) {
    const userId = localStorage.getItem("user_id");
    fetch(`${API_URL}/api/products/product/log-view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, user_id: userId }),
    }).catch(() => {});
    navigate(`/product/${productId}`);
  }

  return (
    <div className="products-page">
      {/* HEADER */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li>Products</li>
            <li><Link to="/story">Heritage</Link></li>
            <li><Link to="/profile">Profile</Link></li>
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

          <Link to="/cart">
            <button className="cart-btn">CART 🛒</button>
          </Link>
        </div>
      </header>

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
                prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
              )
            }
          />

          <FilterGroup
            title="Material"
            items={materials}
            selectedItems={selectedMaterials}
            onChange={(id) =>
              setSelectedMaterials((prev) =>
                prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
              )
            }
          />
        </aside>

        {/* PRODUCTS */}
        <section className="products-content">
          {loading ? (
            <p className="loading-message">Loading products...</p>
          ) : (
            <>
              <div className="products-grid">
                {currentProducts.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  currentProducts.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`} className="product-link">
                      <div className="product-card" onClick={() => handleProductClick(product.id)}>
                        <div className="image-wrap">
                          <img
                            src={getImageUrl(product.main_image)}
                            alt={product.name}
                            loading="lazy" // lazy-load images below fold
                          />
                          {product.sales_price ? (
                            <div className="discount-badge">
                              -{Math.round(
                                ((product.regular_price - product.sales_price) /
                                  product.regular_price) *
                                  100
                              )}
                              %
                            </div>
                          ) : null}
                        </div>

                        <div className="card-body">
                          <h2>{product.name}</h2>
                          <p className="muted">{product.description}</p>

                          <div className="price-row">
                            {product.sales_price ? (
                              <>
                                <span className="price-sale">₱{product.sales_price}</span>
                                <span className="price-regular">₱{product.regular_price}</span>
                              </>
                            ) : (
                              <span className="price-sale">₱{product.regular_price}</span>
                            )}
                          </div>

                          {/* Sold count (uses backend sold_count) */}
                          <div className="product-stats" style={{ marginTop: 8 }}>
                            <span className="sold-count" style={{ fontSize: "0.85rem", color: "#6b6763" }}>
                              Sold: {Number(product.sold_count ?? 0)}
                            </span>
                          </div>
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
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, items, selectedItems, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`filter-group ${expanded ? "expanded" : ""}`}>
      <h4>{title}</h4>

      {items.map((item, index) => (
        <label
          key={item.id}
          style={{ display: expanded || index < 4 ? "block" : "none" }}
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
        <button
          className="show-more-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

export default Products;
