import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Products.css";
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
function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  // Fetch categories + materials on load
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
  // Fetch products whenever filters change
  useEffect(() => {
    async function loadProducts() {
      try {
        const userId = localStorage.getItem("user_id");
        let url;
        const hasFilters =
          selectedCategories.length > 0 || selectedMaterials.length > 0;
        // 🔥 If filters are active → use the NORMAL products endpoint
        if (hasFilters) {
          url = new URL(
            `${process.env.REACT_APP_API_URL}/api/products/product/products/`
          );
        } 
        // 🔥 If no filters → use personalized for logged-in user
        else if (userId) {
          url = new URL(
            `${process.env.REACT_APP_API_URL}/api/products/product/personalized/${userId}/`
          );
        } 
        // 🔥 No user, no filters → random products
        else {
          url = new URL(
            `${process.env.REACT_APP_API_URL}/api/products/product/products/`
          );
          url.searchParams.append("random", true);
        }
        // Apply filters only when hasFilters = true
        if (selectedCategories.length > 0) {
          url.searchParams.append("category", selectedCategories.join(","));
        }
        if (selectedMaterials.length > 0) {
          url.searchParams.append("material", selectedMaterials.join(","));
        }
        console.log("Fetching:", url.toString());
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
    loadProducts();
  }, [selectedCategories, selectedMaterials]);
  // Toggle category by ID
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  // Toggle material by ID
  const toggleMaterial = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((m) => m !== materialId)
        : [...prev, materialId]
    );
  };
  // Search filter
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Log view + redirect
  function handleProductClick(productId) {
    const userId = localStorage.getItem("user_id");
    fetch(`${process.env.REACT_APP_API_URL}api/products/product/log-view/`, {
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
      {/* PRODUCTS LAYOUT */}
      <div className="products-layout">
        {/* FILTER SIDEBAR */}
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
            onChange={toggleCategory}
          />
          <FilterGroup
            title="Material"
            items={materials}
            selectedItems={selectedMaterials}
            onChange={toggleMaterial}
          />
        </aside>
        {/* RIGHT CONTENT */}
        <section className="products-content">
          {/* ACTIVE FILTER CHIPS */}
          {(selectedCategories.length > 0 || selectedMaterials.length > 0) && (
            <div className="active-filters">
              {/* Category chips */}
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                return (
                  <div
                    key={catId}
                    className="filter-chip"
                    onClick={() => toggleCategory(catId)}
                  >
                    {cat?.name} ✕
                  </div>
                );
              })}
              {/* Material chips */}
              {selectedMaterials.map((matId) => {
                const mat = materials.find((m) => m.id === matId);
                return (
                  <div
                    key={matId}
                    className="filter-chip"
                    onClick={() => toggleMaterial(matId)}
                  >
                    {mat?.name} ✕
                  </div>
                );
              })}
              {/* Clear all via chips */}
              <button
                className="clear-chips-btn"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedMaterials([]);
                }}
              >
                Clear All ✕
              </button>
            </div>
          )}
          {/* PRODUCTS GRID */}
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              filteredProducts.map((product) => (
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
                    <span className="price">₱{product.regular_price}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>This is a sample description and does not hold any valuable meaning.</p>
          <button className="register-btn">Register</button>
        </div>
        <div className="footer-right">
          <hr />
          <div className="footer-content">
            <h1 className="footer-logo">THC</h1>
            <div className="footer-links">
              <div>
                <h4>ABOUT US</h4>
                <p>TahananCrafts</p>
                <p>About</p>
              </div>
              <div>
                <h4>SUPPORT</h4>
                <p>Customer Support</p>
                <p>Contact</p>
              </div>
              <div>
                <h4>EMAIL</h4>
                <p>Sample@email.com</p>
              </div>
            </div>
          </div>
          <hr />
          <div className="footer-bottom">
            <p>© 2025 - TahananCrafts</p>
            <p>Privacy — Terms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Products;
