import React from "react";
import { Link } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import "./Shop.css";

function ShopAllProducts() {
  return (
    <HeaderFooter>
      <div className="shop-page">
        {/* ===== Banner Section ===== */}
        <div className="shop-banner">
          <div className="shop-info">
            <div className="shop-logo placeholder-img"></div>
            <div>
              <h2>SM Sunrise Weaving Association</h2>
              <p>Handcrafted works by local artisans</p>
              <button className="btn">Follow</button>
              <button className="btn">Message</button>
            </div>
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <div className="shop-tabs">
          <Link to="/shop">
            <button>Home</button>
          </Link>
          <button className="active">All Products</button>
        </div>

        {/* ===== Top Products Section ===== */}
        <div className="recommended">
          <h3>TOP PRODUCTS</h3>
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="product-card" key={`top-${i}`}>
                <div className="placeholder-img"></div>
                <p>Top Product {i}</p>
                <span>₱{i * 250}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== All Products Section ===== */}
        <div className="recommended">
          <h3>ALL PRODUCTS</h3>
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div className="product-card" key={`all-${i}`}>
                <div className="placeholder-img"></div>
                <p>Sample Product {i}</p>
                <span>₱{i * 150}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default ShopAllProducts;
