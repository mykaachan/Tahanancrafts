import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import "./Products.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchCategories, fetchMaterials, getImageUrl } from "./api";
import { useLocation } from "react-router-dom";



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
  const location = useLocation();
  const urlQuery = useMemo(() => {
    return new URLSearchParams(location.search).get("q") || "";
  }, [location.search]);

  useEffect(() => {
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        document.body.classList.contains("show-mobile-filters") &&
        !e.target.closest(".products-filters") &&
        !e.target.closest(".mobile-filter-btn")
      ) {
        document.body.classList.remove("show-mobile-filters");
      }
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Live filtering: no debounce, filter as user types

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.brandName || "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allProducts, selectedCategories, selectedMaterials, searchQuery]);

  useEffect(() => {
    setProducts(filteredProducts);
    setCurrentPage(1);
  }, [filteredProducts]);

  // Expose allProducts for HeaderFooter search modal
  React.useEffect(() => {
    window.__ALL_PRODUCTS__ = allProducts;
  }, [allProducts]);

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
    <>

      <div className="products-page">
        {/* Mobile search and filter button */}
        <div className="mobile-search-filter">
          <input
            className="search-box"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            className="mobile-filter-btn"
            onClick={() => {
              document.body.classList.toggle('show-mobile-filters');
            }}
          >
            Filter
          </button>
        </div>
        <div className="products-layout">
          {/* FILTERS SIDEBAR */}
          <aside className="products-filters">
            <h3>Filter</h3>
            <input
              className="search-box"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedMaterials([]);
                setSearchQuery("");
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
                                loading="lazy"
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

                              {/* Ratings and Sold count */}
                              <div className="product-stats" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <span className="rating-review" style={{ fontSize: '1.0rem', color: '#f5a623', display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {/* Show stars and average rating, fallback to N/A if not available */}
                                  {typeof product.average_rating === 'number' ? (
                                    <>
                                      <span style={{ marginRight: 2 }}>★</span>
                                      {product.average_rating.toFixed(1)}
                                    </>
                                  ) : (
                                    <span style={{ color: '#bbb' }}>No rating</span>
                                  )}
                                </span>
                                <span className="sold-count" style={{ fontSize: '0.85rem', color: '#6b6763' }}>
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
    </>
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
