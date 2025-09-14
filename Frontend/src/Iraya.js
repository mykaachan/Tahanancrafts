import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Iraya.css";
import { ReactComponent as Logo } from "./Logo.svg";

// Images
import mainImg from "./images/basket1.png";  // default product image
import thumb1 from "./images/basketg.png";   // green basket
import thumb2 from "./images/basketr.png";   // red basket
import thumb3 from "./images/baskety.png";   // yellow basket
import balisong1 from "./images/balisong1.png";
import bag from "./images/bag.png";
import basket from "./images/basket1.png";
import mat from "./images/mat.png";
import barong from "./images/barong1.png";
import bag1 from "./images/bag1.png";
import apron from "./images/apron.png";
import hat from "./images/hat.png";

function Iraya() {
  const [selectedImg, setSelectedImg] = useState(mainImg);
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>
              <Link to="/homepage" style={{ textDecoration: "none", color: "inherit" }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" style={{ textDecoration: "none", color: "inherit" }}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/story" style={{ textDecoration: "none", color: "inherit" }}>
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="iraya-page">
        <div className="iraya-container">
          {/* LEFT: Images */}
          <div className="iraya-images">
            <img src={selectedImg} alt="Iraya Basket" className="main-image" />
            <div className="thumbnails">
              <img src={thumb1} alt="Green Basket" onClick={() => setSelectedImg(thumb1)} />
              <img src={thumb2} alt="Red Basket" onClick={() => setSelectedImg(thumb2)} />
              <img src={thumb3} alt="Yellow Basket" onClick={() => setSelectedImg(thumb3)} />
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="iraya-details">
            <h1>Iraya Basket Lipa</h1>
            <h2>Colored Wooven Tray Basket</h2>
            <p className="category">Hand-woven basket</p>
            <p className="rating">⭐⭐⭐⭐⭐ <span>45 reviews</span></p>
            <h3 className="price">₱500</h3>
            <p className="description">
              This handwoven abaca storage basket is a beautiful blend of craftsmanship
              and function, meticulously made by skilled Filipino artisans using sustainably
              harvested natural fibers.
            </p>

            <div className="options">
              <div className="option">
                <label>Size</label>
                <div className="buttons">
                  <button>S</button>
                  <button>M</button>
                  <button>L</button>
                </div>
              </div>
              <div className="option">
                <label>Color</label>
                <div className="buttons">
                  <button onClick={() => setSelectedImg(thumb1)}>Green</button>
                  <button onClick={() => setSelectedImg(thumb2)}>Red</button>
                  <button onClick={() => setSelectedImg(thumb3)}>Yellow</button>
                </div>
              </div>
            </div>

            <div className="quantity">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="add-to-cart">
  <Link to="/cart">
    <button>Add to Cart</button>
  </Link>
  <p className="total">₱{500 * quantity}</p>
</div>
          </div>
        </div>
      </div>
      {/* ===== RATINGS & REVIEWS ===== */}
<div className="reviews-section">
  <h2>RATINGS & REVIEWS</h2>

  <div className="reviews-header">
    <p>All Reviews (6)</p>
    <div className="reviews-actions">
      <select>
        <option>Latest</option>
        <option>Oldest</option>
        <option>Highest Rated</option>
        <option>Lowest Rated</option>
      </select>
      <button className="review-btn">Write a Review</button>
    </div>
  </div>

  <div className="reviews-grid">
    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐⭐</p>
      <h4>Juan D.</h4>
      <p>salamat po mabilis delivery at maganda nman Ang bilao thank you po ng marami.....😊😊😊😊😊😊😊</p>
      <small>Posted on May 14, 2025</small>
    </div>

    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐⭐</p>
      <h4>Mikaela M.</h4>
      <p>SUPER LEGIT GUYS, WALANG LABIS, WALANG KULANG, SOBRANG LAKI NITO. WORTH IT NAMAN SIYA GUYSS!!💞💞</p>
      <small>Posted on May 15, 2025</small>
    </div>

    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐½</p>
      <h4>Missy R.</h4>
      <p>satisfied buyer here, well packed and maganda yung bilao, sakto para sa mga paorder kong kakanin...</p>
      <small>Posted on May 16, 2025</small>
    </div>

    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐</p>
      <h4>Angela P.</h4>
      <p>Double-stitched for extra strength, Support local small businesses, eco-friendly bamboo material...</p>
      <small>Posted on May 17, 2025</small>
    </div>

    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐⭐</p>
      <h4>Gabrielo K.</h4>
      <p>salamat po ng marami dumating on time sakto sakto, salamat din Kay kuya rider na mabait...</p>
      <small>Posted on May 18, 2025</small>
    </div>

    <div className="review-card">
      <p className="stars">⭐⭐⭐⭐½</p>
      <h4>Inday H.</h4>
      <p>nice product 👍👍👍...will order again soon. thanks much po sa nag deliver... keepsafe always</p>
      <small>Posted on May 19, 2025</small>
    </div>
  </div>
</div>

{/* ===== SHOP SECTION ===== */}
<section className="shop-section">
  <hr className="shop-divider" />
  <div className="shop-card-horizontal">
    <div className="shop-image-horizontal">
      {/* Use an image or just a colored circle */}
    </div>
    <div className="shop-info">
      <h3 className="shop-name">Iraya Lipa</h3>
      <button className="view-shop-btn">View Shop</button>
    </div>
  </div>
  <hr className="shop-divider" />
</section>




 {/* ===== YOU MAY ALSO LIKE ===== */}
      <section className="related-section">
        <h2 className="related-title">You may also like</h2>
        <div className="related-grid">
          <div className="related-card">
            <img src={balisong1} alt="Balisong" />
            <h4>Kalis Taal</h4>
            <p>Butterfly knife (Balisong)</p>
            <span className="price">₱349</span>
          </div>

          <div className="related-card">
            <img src={bag} alt="Weaved Bag" />
            <h4>Habing Ibaan</h4>
            <p>Weaved Bag</p>
            <span className="price">₱1,200</span>
          </div>

          <div className="related-card">
            <img src={basket} alt="Basket" />
            <h4>Iraya Basket Lipa</h4>
            <p>Colored Wooven Tray Basket</p>
            <span className="price">₱500</span>
          </div>

          <div className="related-card">
            <img src={mat} alt="Mat" />
            <h4>Burdang Taal Lace Medallions</h4>
            <p>Table Runner</p>
            <span className="price">₱149</span>
          </div>

          <div className="related-card">
            <img src={barong} alt="Barong Tagalog" />
            <h4>Piña Ginoo</h4>
            <p>Barong Tagalog</p>
            <span className="price">₱1,199</span>
          </div>

          <div className="related-card">
            <img src={bag1} alt="Sling Bag" />
            <h4>Habing Ibaan</h4>
            <p>Weaved Sling Bag</p>
            <span className="price">₱250</span>
          </div>

          <div className="related-card">
            <img src={apron} alt="Apron" />
            <h4>Habing Ibaan</h4>
            <p>Weaved Apron</p>
            <span className="price">₱350</span>
          </div>

          <div className="related-card">
            <img src={hat} alt="Hat" />
            <h4>Habing Ibaan</h4>
            <p>Bucket Hat</p>
            <span className="price">₱500</span>
          </div>
        </div>
      </section>
      
      


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
    </>
  );
}

export default Iraya;
