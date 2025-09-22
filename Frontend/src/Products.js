// src/Products.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";
import { ReactComponent as Logo } from "./Logo.svg";
import {
  fetchProducts,
  fetchCategories,
  fetchMaterials,
  getImageUrl,
} from "./api";


// --- Filter Group ---
function FilterGroup({ title, items, selected, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`filter-group ${expanded ? "expanded" : ""}`}>
      <h4>{title}</h4>
      {items.map((item, index) => (
        <label
          key={item.id}
          style={{ display: !expanded && index >= 4 ? "none" : "block" }}
        >
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={() => onChange(item.id)}
          />{" "}
          {item.name}
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

  // --- Load initial data ---
  useEffect(() => {
    async function loadData() {
      const [prodData, catData, matData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchMaterials(),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setMaterials(matData);
    }
    loadData();
  }, []);

  // --- Handle filter changes ---
  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleMaterial = (id) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // --- Apply filters locally (optional, could also refetch via API query) ---
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategories.length === 0 ||
      p.categories.some((catId) => selectedCategories.includes(catId));

    const matchMaterial =
      selectedMaterials.length === 0 ||
      p.materials.some((matId) => selectedMaterials.includes(matId));

    return matchCategory && matchMaterial;
  });

  return (
    <div className="products-page">
      {/* ===== HEADER ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>
              <Link
                to="/homepage"
                style={{ textDecoration: "none", color: "inherit" }}
              >
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
            <li>Profile</li>
          </ul>
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>
          <button className="cart-btn">CART 🛒</button>
        </div>
      </header>

      {/* ===== PRODUCTS LAYOUT ===== */}
      <div className="products-layout">
        {/* LEFT FILTERS */}
        <aside className="products-filters">
          <h3>Filter</h3>

          <FilterGroup
            title="Category"
            items={categories}
            selected={selectedCategories}
            onChange={toggleCategory}
          />

          <FilterGroup
            title="Material"
            items={materials}
            selected={selectedMaterials}
            onChange={toggleMaterial}
          />
        </aside>

        {/* RIGHT PRODUCTS GRID */}
        <section className="products-content">
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              filteredProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <img src={getImageUrl(product.main_image)} alt={product.name} />
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <span className="price">₱{product.regular_price}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>
            This is a sample description and does not hold any valuable meaning.
            This is a description that describes nothing. It can either be
            nothing or nothing at all.
          </p>
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
