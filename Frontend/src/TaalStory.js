import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TaalStory.css";
import HeaderFooter from "./HeaderFooter";

function TaalStory() {
  const { artisan_id } = useParams();
  const BASE_URL = "http://127.0.0.1:8000";


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
              <p>{artisan.short_description}</p>
            </div>
          </div>
        </section>

        {/* STORY SECTIONS */}
        {[
          artisan.about_shop,
          artisan.vision,
          artisan.mission,
        ].map((text, i) => (
          <section key={i} className={`taal-story-section ${i === 1 ? "reverse" : ""}`}>
            <div className="story-left">
              <img
                src={photos[i]?.photo ? BASE_URL + photos[i].photo : "https://via.placeholder.com/500"}
              />
            </div>
            <div className="story-right">
              <p>
                {i === 0 && artisan.about_shop}
                {i === 1 && <><strong>Vision:</strong> {artisan.vision}</>}
                {i === 2 && <><strong>Mission:</strong> {artisan.mission}</>}
              </p>
            </div>
          </section>
        ))}

      </div>
    </HeaderFooter>
  );
}

export default TaalStory;
