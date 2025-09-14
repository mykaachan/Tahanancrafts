import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";
import { ReactComponent as Logo } from "./Logo.svg";

// ✅ Images
import balisong1 from "./images/balisong1.png";
import bag from "./images/bag.png";
import basket from "./images/basket1.png";
import mat from "./images/mat.png";
import barong from "./images/barong1.png";
import bag1 from "./images/bag1.png";
import apron from "./images/apron.png";
import hat from "./images/hat.png";

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
            items={[
              "Home Decor",
              "Kitchenware",
              "Clothing & Apparel",
              "Bags & Accessories",
              "Jewelry",
              "Footwear",
              "Furniture",
              "Stationery & Paper Goods",
              "Arts & Paintings",
              "Musical Instruments",
              "Toys & Games",
              "Health & Wellness Products",
              "Festive & Seasonal Items",
              "Souvenirs & Gifts",
              "Gardening & Outdoor",
            ]}
          />

          <FilterGroup
            title="Material"
            items={[
              "Abaca",
              "Bamboo",
              "Capiz Shell",
              "Coconut Husk",
              "Rattan",
              "Wood",
              "Metal",
              "Clay",
              "Cotton",
              "Woven Fabric",
              "Leather",
              "Recycled Materials",
            ]}
          />
        </aside>

        {/* RIGHT PRODUCTS GRID */}
        <section className="products-content">
          <div className="products-grid">
            <div className="product-card">
              <img src={balisong1} alt="Balisong" />
              <h2>Kalis Taal</h2>
              <p>Butterfly knife (Balisong)</p>
              <span className="price">₱349</span>
            </div>

            <div className="product-card">
              <img src={bag} alt="Handmade Bag" />
              <h2>Habing Ibaan</h2>
              <p>Weaved Bag</p>
              <span className="price">₱1,200</span>
            </div>

            <div className="product-card">
            <Link
              to="/iraya"
              style={{ textDecoration: "none", color: "inherit" }}
  >
              <img src={basket} alt="Basket" />
              <h2>Iraya Basket Lipa</h2>
              <p>Colored Wooven Tray Basket</p>
              <span className="price">₱500</span>
            </Link>
            </div>

            <div className="product-card">
              <img src={mat} alt="Banig Mat" />
              <h2>Burdang Taal Lace Medallions</h2>
              <p>Table Runner</p>
              <span className="price">₱149</span>
            </div>

            <div className="product-card">
              <img src={barong} alt="Barong Tagalog" />
              <h2>Piña Ginoo</h2>
              <p>Barong Tagalog</p>
              <span className="price">₱1,199</span>
            </div>

            <div className="product-card">
              <img src={bag1} alt="Bag" />
              <h2>Habing Ibaan</h2>
              <p>Weaved Sling Bag</p>
              <span className="price">₱250</span>
            </div>

            <div className="product-card">
              <img src={apron} alt="Apron" />
              <h2>Habing Ibaan</h2>
              <p>Weaved Apron</p>
              <span className="price">₱350</span>
            </div>

            <div className="product-card">
              <img src={hat} alt="Hat" />
              <h2>Habing Ibaan</h2>
              <p>Bucket Hat</p>
              <span className="price">₱500</span>
            </div>
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
