import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchProducts, fetchCategories, fetchMaterials, getImageUrl } from "./api";

function FilterGroup({ title, items }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`filter-group ${expanded ? "expanded" : ""}`}>
      <h4>{title}</h4>
      {items.map((item, index) => (
        <label
          key={index}
          style={{ display: !expanded && index >= 4 ? "none" : "block" }}
        >
          <input type="checkbox" /> {item}
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

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData, matData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchMaterials()
        ]);

        // Randomize products on each refresh
        setProducts(prodData.sort(() => Math.random() - 0.5));
        setCategories(catData);
        setMaterials(matData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="products-page">
      {/* ===== HEADER ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li><Link to="/homepage" style={{ textDecoration: "none", color: "inherit" }}>Home</Link></li>
            <li>Products</li>
            <li><Link to="/story" style={{ textDecoration: "none", color: "inherit" }}>Story</Link></li>
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
          <FilterGroup title="Category" items={categories.map(c => c.name)} />
          <FilterGroup title="Material" items={materials.map(m => m.name)} />
        </aside>

        {/* RIGHT PRODUCTS GRID */}
        <section className="products-content">
          <div className="products-grid">
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => (
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
          <h2>Join us, <br /> artisans!</h2>
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
