import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import SM from "./images/SM.png";
import "./StoryPage.css"; // ✅ reuse styling

function Story1() {
  return (
    <div className="story-page">
      <Header /> {/* ✅ Reusable Header */}

      {/* Story Content */}
      <section className="story-detail">
        <div className="story-row">
          <img
            src={SM}
            alt="SM Sunrise Weaving Association"
            className="story-image"
          />
          <div className="story-text">
            <h2 className="story-heading">SM Sunrise Weaving Association</h2>
            <p className="story-paragraph">
              Taal, Batangas is a historic town renowned for its well-preserved
              Spanish colonial architecture and rich cultural heritage. Known as
              the "Heritage Town," it showcases traditional crafts like the
              balisong (butterfly knife) and handwoven textiles. With landmarks
              such as the Basilica of St. Martin de Tours and vibrant festivals,
              Taal offers a unique glimpse into Filipino history, artistry, and
              tradition.
            </p>
            <p className="story-paragraph">⏱️ 40 min</p>
          </div>
        </div>
      </section>

      <Footer /> {/* ✅ Reusable Footer */}
    </div>
  );
}

export default Story1;
