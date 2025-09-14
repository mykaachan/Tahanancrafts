import React from "react";
import { Link } from "react-router-dom";
import "./StoryPage.css";
import { ReactComponent as Logo } from "./Logo.svg";

import story1 from "./images/story1.png";
import story2 from "./images/story2.png";
import story3 from "./images/story3.png";
import story4 from "./images/story4.png";

function StoryPage() {
  return (
    <div className="story-page">
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
            <li>
  <Link
    to="/products"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    Products
  </Link>
</li>
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

      {/* ===== STORY CONTENT ===== */}
      <section className="story-content">
  <h1 className="story-title">Stories</h1>

   {/* Story 1 */}
  <div className="story-row">
    <img
      src={story1}
      alt="SM Sunrise Weaving Association"
      className="story-image"
    />
    <div className="story-text">
      <h2 className="story-heading">SM Sunrise Weaving Association</h2>
      <p className="story-paragraph">
        Ibaan, Batangas
      </p>
      <p className="story-paragraph">
        The SM Sunrise Weaving Association, founded in 2017 in Ibaan, Batangas,
        is a group of women preserving Habing Ibaan, the town’s traditional
        handloom weaving. They craft bags, scarves, and blankets, keeping local
        heritage alive and supporting community livelihoods with help from
        government support.
      </p>
    </div>
  </div>

   {/* Story 2 */}
  <div className="story-row">
    <img
      src={story2}
      alt="The Iraya Basket"
      className="story-image"
    />
    <div className="story-text">
      <h2 className="story-heading">The Iraya Basket</h2>
      <p className="story-paragraph">
        Lipa, Batangas
      </p>
      <p className="story-paragraph">
        Ibaan, Batangas is a quiet town known for its traditional crafts and
        rich heritage. Called the “Kulambo Capital of the Philippines,” it’s
        famous for handwoven mosquito nets and local treats like tamales. With
        its colorful and long-standing traditions, Ibaan keeps its culture alive
        through everyday craft and community pride.
      </p>
    </div>
  </div>
 {/* Story 3 */}
  <div className="story-row">
    <img
      src={story3}
      alt="Lipa, Batangas"
      className="story-image"
    />
    <div className="story-text">
      <h2 className="story-heading">Lipa, Batangas</h2>
      <p className="story-paragraph">
        Lipa, Batangas
      </p>
      <p className="story-paragraph">
        Lipa, Batangas is a city with a rich cultural history, celebrated for
        its local crafts like intricate woodwork, woven textiles, and pottery.
        These crafts are showcased during festivals like the Lomi and Walistik
        Festivals, which highlight the city’s artistic traditions and deep
        community pride.
      </p>
    </div>
  </div>

  {/* Story 4 */}
  <div className="story-row">
    <img
      src={story4}
      alt="Tuy, Batangas"
      className="story-image"
    />
    <div className="story-text">
      <h2 className="story-heading">Tuy, Batangas</h2>
      <p className="story-paragraph">
        Tuy, Batangas
      </p>
      <p className="story-paragraph">
        Tuy, Batangas is known for eco-friendly crafts, with artisans turning
        agricultural waste into handmade paper, bags, and more. Tuy Arts and
        Designs promotes sustainability, while local painters and sculptors
        enrich the art scene. The town also offers workshops that support
        creativity and livelihood.
      </p>
    </div>
  </div>
</section>


      {/* ===== FOOTER ===== */}
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

export default StoryPage;
