import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
          key={index}
          style={{ display: !expanded && index >= 4 ? "none" : "block" }}
        >
          <input
            type="checkbox"
            checked={selectedItems.includes(item)}
            onChange={() => onChange(item)}
          />{" "}
          {item}
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
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search state
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

      if (userId) {
        // ✅ Personalized products for logged-in user
        url = new URL(
          `fetch(${process.env.REACT_APP_API_URL}/api/products/product/personalized/${userId}/)`
        );
      } else {
        // ✅ Random products for anonymous users
        url = new URL(`fetch(${process.env.REACT_APP_API_URL}/api/products/product/products/`);
        url.searchParams.append("random", true);
      }

      // Apply filters if selected
      if (selectedCategories.length > 0) {
        url.searchParams.append("category", selectedCategories.join(","));
      }
      if (selectedMaterials.length > 0) {
        url.searchParams.append("material", selectedMaterials.join(","));
      }

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

  // Handle checkbox toggle
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  // ✅ Filter products by search query
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* ===== HEADER ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>
              <Link
                to="/"
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
            <li>
  <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
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
              onChange={(e) => setSearchQuery(e.target.value)} // ✅ update search
            />
            <button className="search-btn">🔍</button>
          </div>
           {/* ✅ Cart button now links to /cart */}
  <Link to="/cart" style={{ textDecoration: "none" }}>
    <button className="cart-btn">CART 🛒</button>
  </Link>
</div>
      </header>

      {/* ===== PRODUCTS LAYOUT ===== */}
      <div className="products-layout">
        {/* LEFT FILTERS */}
        <aside className="products-filters">
          <h3>Filter</h3>
          <FilterGroup
            title="Category"
            items={categories.map((c) => c.name)}
            selectedItems={selectedCategories}
            onChange={toggleCategory}
          />
          <FilterGroup
            title="Material"
            items={materials.map((m) => m.name)}
            selectedItems={selectedMaterials}
            onChange={toggleMaterial}
          />
        </aside>

        {/* ===== RIGHT PRODUCTS GRID ===== */}
          <section className="products-content">
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
                    <div className="product-card" onClick={() => handleProductClick(product.id)}>
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

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>
            This is a sample description and does not hold any valuable meaning.
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
