import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StoryPage.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchArtisanStories } from "./api";

function StoryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = `fetch(${process.env.REACT_APP_API_URL}127.0.0.1:8000`; // Django backend URL

  useEffect(() => {
    async function loadStories() {
      try {
        // Fetch all artisans (no artisan_id filter)
        const data = await fetchArtisanStories();
        setStories(data);
      } catch (error) {
        console.error("Failed to load artisan stories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

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
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>

          <Link to="/cart" style={{ textDecoration: "none" }}>
            <button className="cart-btn">CART 🛒</button>
          </Link>
        </div>
      </header>

      {/* ===== STORY CONTENT ===== */}
      <section className="story-content">
        <h1 className="story-title">Stories</h1>

        {loading ? (
          <p className="loading-text">Loading artisan stories...</p>
        ) : stories.length === 0 ? (
          <p className="loading-text">No artisan stories found.</p>
        ) : (
          stories.map((story, index) => (
            <div
              className="story-row"
              key={story.id}
              style={{
                flexDirection: index % 2 === 0 ? "row" : "row-aligned",
              }}
            >
              <img
                src={`${BASE_URL}${story.main_photo}`}
                alt={story.name}
                className="story-image"
              />

              <div className="story-text">
                <h2 className="story-heading">{story.name}</h2>
                <p className="story-paragraph">{story.location}</p>
                <p className="story-paragraph">{story.about_shop}</p>
              </div>
            </div>
          ))
        )}
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
