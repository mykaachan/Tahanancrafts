import React from "react";
import "./TaalStory.css";
import HeaderFooter from "./HeaderFooter"; // unchanged
function TaalStory() {
  return (
    <HeaderFooter>
      <div className="taal-story-page">
        {/* ===== HERO SECTION ===== */}
        <section className="taal-hero">
          <div className="taal-hero-content">
            <img
              src="https://via.placeholder.com/400x400?text=SM+Sunrise+Logo"
              alt="SM Sunrise Weaving Association"
              className="taal-hero-logo"
            />
            <div className="taal-hero-text">
              <h1>SM Sunrise Weaving Association</h1>
              <p>
                Taal, Batangas is a historic town renowned for its well-preserved
                Spanish colonial architecture and rich cultural heritage. Known as
                the “Heritage Town,” it showcases traditional crafts like the
                balisong and handwoven textiles. With landmarks such as the Basilica
                of St. Martin de Tours and vibrant festivals, Taal offers a unique
                glimpse into Filipino history, artistry, and tradition.
              </p>
            </div>
          </div>
        </section>
        {/* ===== STORY SECTION 1 ===== */}
        <section className="taal-story-section">
          <div className="story-left">
            <img
              src="https://via.placeholder.com/500x350?text=Weaving+Process"
              alt="Weaving Process"
            />
          </div>
          <div className="story-right">
            <p>
              In a quiet corner of Ibaan, Batangas, the rhythmic clack of wooden
              looms tells a story of patience, resilience, and pride. The women of
              the SM Sunrise Weaving Association gather each day, weaving not just
              threads but the legacy of “Habing Ibaan”—a handloom craft passed down
              through generations.
            </p>
          </div>
        </section>
        {/* ===== STORY SECTION 2 ===== */}
        <section className="taal-story-section reverse">
          <div className="story-left">
            <img
              src="https://via.placeholder.com/500x350?text=Weaving+Tools"
              alt="Weaving Tools"
            />
          </div>
          <div className="story-right">
            <p>
              Once known for mosquito nets when Ibaan was the “Kulambo Capital,”
              these weavers now transform their intricate patterns into bags,
              scarves, and blankets. Each piece reflects their deep connection to
              their roots.
            </p>
          </div>
        </section>
        {/* ===== STORY SECTION 3 ===== */}
        <section className="taal-story-section">
          <div className="story-left">
            <img
              src="https://via.placeholder.com/500x350?text=Finished+Products"
              alt="Finished Products"
            />
          </div>
          <div className="story-right">
            <p>
              Through their hands, the colors and textures of local culture are
              preserved—stitched into every fold, every fiber, every finished
              work. Their crafts are more than products—they are woven stories of
              heritage and hope.
            </p>
          </div>
        </section>
        {/* ===== LATEST PRODUCTS ===== */}
        <section className="latest-products">
          <h2>Latest Products</h2>
          <div className="product-grid">
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Product 1" />
              <p>Handwoven Bag</p>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Product 2" />
              <p>Handwoven Pouch</p>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Product 3" />
              <p>Handwoven Scarf</p>
            </div>
          </div>
        </section>
        {/* ===== MORE PRODUCTS ===== */}
        <section className="more-products">
          <h2>More Products</h2>
          <div className="product-grid">
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Shawl" />
              <p>Balabal Shawl — ₱899</p>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Coin Purse" />
              <p>Kalpi Coin Purse — ₱349</p>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/300x240" alt="Blanket" />
              <p>Koomot Blanket — ₱349</p>
            </div>
          </div>
        </section>
        {/* ===== HERITAGE SECTION (ADDED) ===== */}
        <section className="heritage-wrapper">
          <div className="heritage-inner">
            <div className="heritage-left">
              <h2>Woven by Hand, Rooted in Heritage</h2>
              <p>
                Taal's artisans keep tradition alive through their handmade crafts,
                each one reflecting the town’s rich heritage and creative spirit.
                From intricate embroidery to finely crafted blades, their work
                carries stories passed down through generations—woven by hand,
                rooted in heritage.
              </p>
            </div>
            <div className="heritage-right">
              <img
                src="https://via.placeholder.com/620x420?text=TAAL+Heritage+Photo"
                alt="Taal Heritage"
              />
            </div>
          </div>
        </section>
      </div>
    </HeaderFooter>
  );
}
export default TaalStory;
