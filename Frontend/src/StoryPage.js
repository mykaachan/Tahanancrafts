import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StoryPage.css";
import Footer from "./Footer";
import { ReactComponent as Logo } from "./Logo.svg";
import { fetchArtisanStories } from "./api";

function StoryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL || "https://tahanancrafts.onrender.com";

  // CACHE KEY + EXPIRATION (24 hours)
  const CACHE_KEY = "tahanan_stories";
  const CACHE_TIME_KEY = "tahanan_stories_time";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    async function loadStories() {
      const cached = localStorage.getItem(CACHE_KEY);

      // STEP 1 — Show cache immediately
      if (cached) {
        setStories(JSON.parse(cached));
        setLoading(false);
      }

      // STEP 2 — Fetch fresh data in background
      try {
        const fresh = await fetchArtisanStories();

        setStories(fresh); // update UI
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        localStorage.setItem(CACHE_TIME_KEY, Date.now());
      } catch (err) {
        console.error("Failed to refresh stories:", err);
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
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/story">Story</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>
          <Link to="/cart"><button className="cart-btn">CART 🛒</button></Link>
        </div>
      </header>

      {/* ===== STORY CONTENT ===== */}
      <section className="story-content">
        <h1 className="story-title">Stories</h1>

        {loading ? (
          <p className="loading-text">Loading artisan stories...</p>
        ) : stories.length === 0 ? (
          <p>No artisan stories found.</p>
        ) : (
          stories.map((story, index) => (
            <div
              className="story-row"
              key={story.id}
              style={{
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/heritage/${story.id}`)}
            >
              <img
                src={`${BASE_URL}${story.main_photo}`}
                alt={story.name}
                className="story-image"
                loading="lazy"        // FAST lazy loading
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

      <Footer />
    </div>
  );
}

export default StoryPage;
