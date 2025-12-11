import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TaalStory.css";
import HeaderFooter from "./HeaderFooter";

function TaalStory() {
  const { artisan_id } = useParams(); // dynamic URL
  const BASE_URL = "https://tahanancrafts.onrender.com";
  //const BASE_URL = "http://127.0.0.1:8000";

  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {}
    }

    throw new Error("No valid story endpoint found.");
  }

  useEffect(() => {
    async function loadStory() {
      try {
        const data = await fetchStory(artisan_id);
        setArtisan(data);
      } catch (err) {
        console.error("Error loading artisan:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, [artisan_id]);

  if (loading) return <HeaderFooter><p>Loading...</p></HeaderFooter>;
  if (!artisan) return <HeaderFooter><p>No artisan found.</p></HeaderFooter>;

  const photos = artisan.photos || [];
  const latestProducts = artisan.latest_products?.slice(0, 3) || [];

  return (
    <HeaderFooter>
      <div className="taal-story-page">

        {/* HERO */}
        <section className="taal-hero">
          <div className="taal-hero-content">
            <img
              src={artisan.main_photo ? BASE_URL + artisan.main_photo : "https://via.placeholder.com/400"}
              className="taal-hero-logo"
            />

            <div className="taal-hero-text">
              <h1>{artisan.name}</h1>
              <p>{artisan.about_shop}</p>
              {artisan.vision && <p><strong>Vision:</strong> {artisan.vision}</p>}
              {artisan.mission && <p><strong>Mission:</strong> {artisan.mission}</p>}
            </div>
          </div>
        </section>

        {/* STORY SECTIONS */}
        {[0,1,2].map((i) => (
          <section key={i} className={`taal-story-section ${i === 1 ? "reverse" : ""}`}>
            <div className="story-left">
              <img
                src={photos[i]?.photo ? BASE_URL + photos[i].photo : "https://via.placeholder.com/500"}
              />
            </div>
            <div className="story-right">
              <p>
                {i === 0 && "The artisans of Taal continue a legacy of weaving..."}
                {i === 1 && "Passed down through generations, these crafts symbolize resilience..."}
                {i === 2 && "Every creation carries a story woven with dedication..."}
              </p>
            </div>
          </section>
        ))}

        {/* LATEST PRODUCTS */}
        <section className="latest-products">
          <h2>Latest Products</h2>
          <div className="product-grid">
            {latestProducts.map((p) => (
              <div key={p.id} className="product-card">
                <img src={p.main_image ? BASE_URL + p.main_image : "https://via.placeholder.com/300"} />
                <p>{p.name}</p>
              </div>
            ))}
          </div>

          {/* SEE MORE BUTTON */}
          <button
            className="see-more-btn"
            onClick={() => (window.location.href = `/shop/${artisan_id}/products`)}
          >
            See More Products →
          </button>
        </section>

      </div>
    </HeaderFooter>
  );
}

export default TaalStory;
