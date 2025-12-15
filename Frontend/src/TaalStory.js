import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TaalStory.css";

function TaalStory() {
  const { artisan_id } = useParams();
  const navigate = useNavigate();
  //const BASE_URL = "http://127.0.0.1:8000";
  const BASE_URL = process.env.REACT_APP_API_URL || "https://tahanancrafts.onrender.com";

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH STORY ===================== */
  async function fetchStory(id) {
    const urls = [
      `${BASE_URL}/api/users/artisan/story/${id}/`,
      `${BASE_URL}/api/artisan/story/${id}/`,
      `${BASE_URL}/api/users/story/${id}/`,
    ];

    for (let url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch {}
    }
    throw new Error("No valid story endpoint found.");
  }

  /* ===================== FETCH LATEST PRODUCTS ===================== */
  async function fetchLatestProducts(id) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/products/product/shop/${id}/`
      );

      if (!res.ok) return [];

      const data = await res.json();

      console.log("SHOP RESPONSE:", data); // keep for debugging

      // ✅ YOUR API SHAPE
      if (Array.isArray(data.products)) {
        return data.products.slice(0, 3);
      }

      return [];
    } catch (err) {
      console.error("Failed to load products:", err);
      return [];
    }
  }

  /* ===================== LOAD ALL DATA ===================== */
  useEffect(() => {
    async function loadData() {
      try {
        const storyData = await fetchStory(artisan_id);
        setArtisan(storyData);

        const productData = await fetchLatestProducts(artisan_id);
        setProducts(productData);
      } catch (err) {
        console.error("Failed to load story:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [artisan_id]);

  /* ===================== STATES ===================== */
  if (loading) {
    return <p className="loading-text">Loading story...</p>;
  }

  if (!artisan) {
    return <p>Story not found.</p>;
  }

  const photos = Array.isArray(artisan.photos) ? artisan.photos : [];

  return (
    <div className="taal-story-page">
      {/* ===================== HERO ===================== */}
      <section className="taal-hero">
        <div className="taal-hero-content">
          <img
            src={
              artisan.main_photo
                ? BASE_URL + artisan.main_photo
                : "https://via.placeholder.com/400"
            }
            className="taal-hero-logo"
            alt={artisan.name}
          />

          <div className="taal-hero-text">
            <h1>{artisan.name}</h1>
            <p>{artisan.short_description}</p>
          </div>
        </div>
      </section>

      {/* ===================== STORY SECTIONS ===================== */}
      {[artisan.about_shop, artisan.vision, artisan.mission].map((_, i) => (
        <section
          key={i}
          className={`taal-story-section ${i === 1 ? "reverse" : ""}`}
        >
          <div className="story-left">
            <img
              src={
                photos[i]?.photo
                  ? BASE_URL + photos[i].photo
                  : "https://via.placeholder.com/500"
              }
              alt={`Story section ${i}`}
            />
          </div>

          <div className="story-right">
            <p>
              {i === 0 && artisan.about_shop}
              {i === 1 && (
                <>
                  <strong>Vision:</strong> {artisan.vision}
                </>
              )}
              {i === 2 && (
                <>
                  <strong>Mission:</strong> {artisan.mission}
                </>
              )}
            </p>
          </div>
        </section>
      ))}

      {/* ===================== LATEST PRODUCTS ===================== */}
      {products.length > 0 && (
        <section className="latest-products">
          <h2>Latest Products</h2>

          <div className="product-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    product.main_image
                      ? BASE_URL + product.main_image
                      : "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                />
                <p>{product.name}</p>
              </div>
            ))}
          </div>

          <button
            className="see-more-btn"
            onClick={() =>
              navigate(`/shop/${artisan_id}`)
            }
            style={{
              marginTop: "30px",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#3b2f2f",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            See more
          </button>
        </section>
      )}
    </div>
  );
}

export default TaalStory;
