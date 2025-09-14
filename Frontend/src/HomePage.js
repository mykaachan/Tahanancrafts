import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto1 from "./images/featuredphoto1.png"; // make sure extension is correct
import featuredphoto2 from "./images/featuredphoto2.png";
import featuredphoto3 from "./images/featuredphoto3.png";
import balisong from "./images/balisong.png";
import basket from "./images/basket.png";
import barong from "./images/barong.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
import { Link } from "react-router-dom"; 

function HomePage() {
  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>Home</li>
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

      {/* Featured Section */}
      <section className="featured-section">
        <img
          src={featuredphoto1}
          alt="Featured Product"
          className="featured-photo"
        />

        <div className="featured-box">
          <h1>Iraya Basket Lipa</h1>
          <h3>Colored Wooden Tray Basket</h3>
          <p className="stars">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
          </p>

          <p>
            Handwoven by Filipino artisans using sustainable abaca, the Iraya Basket
            Lipa adds vibrant color and natural texture to any space. Durable yet
            decorative, it’s perfect for stylish storage or display with a touch of
            cultural charm.
          </p>
          <button className="shop-btn">SHOP NOW!</button>
        </div>
      </section>

      {/* ✅ Latest Products Section */}
        <section className="latest-products">
        <div className="latest-products-grid">
        <img src={featuredphoto2} alt="Product 2" className="product-card" />
        <img src={featuredphoto3} alt="Product 3" className="product-card" />
        </div>
        <h2 className="latest-products-title">Latest Products</h2>
    </section>
    {/* ✅ Extra Products Section */}
<section className="extra-products">
  <div className="extra-products-grid">
    
    <div className="product-item">
      <img src={balisong} alt="balisong" className="product-card" />
      <p className="product-name">Kalis Taal</p>
    </div>

    <div className="product-item">
      <img src={basket} alt="basket" className="product-card" />
      <p className="product-name">Colored Wooven Tray Basket</p>
    </div>

    <div className="product-item">
      <img src={barong} alt="barong" className="product-card" />
      <p className="product-name">Piña Ginoo</p>
    </div>

  </div>
</section>
{/* Heritage Section */}
<section className="heritage-section">
  <div className="heritage-container">
    {/* Left: Image */}
    <div className="heritage-image">
      <img src={Taal} alt="Taal Heritage" />
    </div>

    {/* Right: Content */}
    <div className="heritage-content">
      <h2>The Heritage Heart of Batangas</h2>
      <p>
        Taal, Batangas is where heritage breathes. <br />
        Through blades forged with pride and threads woven with grace, <br />
        each craft a quiet poem of the Filipino soul.
      </p>
      <button className="heritage-btn">View More</button>
    </div>
  </div>
</section>
{/* ✅ TahananCrafts Section */}
<section className="tahanancrafts-section">
  <Logo className="tahanancrafts-logo" />
  <div className="description-box">
    <p>
      TahananCrafts is an online marketplace where you can discover and
      support Filipino artisans and their handmade creations. We bring
      traditional craftsmanship to the digital world, giving local makers a
      space to grow their businesses and share their culture with more
      people. With the help of smart data tools, we make it easier for
      artisans to understand what customers love and improve their products.
      At TahananCrafts, you're not just shopping—you’re helping preserve
      Filipino art, support communities, and celebrate local talent.
    </p>
  </div>
</section>
      {/* ✅ Footer Section */}
      <footer className="footer">
        {/* Left Section */}
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

        {/* Right Section */}
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

export default HomePage;

