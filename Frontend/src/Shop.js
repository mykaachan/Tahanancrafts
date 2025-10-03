import React from "react";
import HeaderFooter from "./HeaderFooter"; // ✅ import header/footer wrapper
import "./Shop.css";

function Shop() {
  return (
    <HeaderFooter>
      <div className="shop-page">
        {/* Header Banner */}
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

        {/* Nav Tabs */}
        <div className="shop-tabs">
          <button className="active">Home</button>
          <button>All Products</button>
        </div>

        {/* Recommended Section */}
        <div className="recommended">
          <h3>RECOMMENDED FOR YOU</h3>
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="product-card" key={i}>
                <div className="placeholder-img"></div>
                <p>Sample Product</p>
                <span>₱000</span>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="about-shop">
          <div className="placeholder-img banner"></div>
          <div className="about-text">
            <h3>About Shop</h3>
            <p>
              SM Sunrise Weaving Association is a local weaving group known for
              creating handcrafted products using traditional methods. Each
              piece reflects the artistry and heritage of Filipino craftsmanship.
            </p>
          </div>
        </div>

        {/* More Recommended */}
        <div className="recommended">
          <h3>RECOMMENDED FOR YOU</h3>
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="product-card" key={i}>
                <div className="placeholder-img"></div>
                <p>Sample Product</p>
                <span>₱000</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default Shop; // ✅ correct export
