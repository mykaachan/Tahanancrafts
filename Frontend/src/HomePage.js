import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto2 from "./images/featuredphoto2.png";
import featuredphoto3 from "./images/featuredphoto3.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
import { Link } from "react-router-dom"; 
import HeaderFooter from "./HeaderFooter";
import { fetchLatestProducts, fetchFeaturedProducts, getUserByContact } from "./api"; 
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function getLatestProducts() {
      try {
        const products = await fetchLatestProducts();
        setLatestProducts(products);
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    }

    getLatestProducts();

    async function getFeaturedProducts() {
      try {
        let userId = localStorage.getItem("user_id");

        if (!userId) {
          const contact = localStorage.getItem("user_contact");
          if (contact) {
            try {
              const user = await getUserByContact(contact);
              if (user?.id) {
                localStorage.setItem("user_id", user.id);
                userId = user.id;
              }
            } catch (fetchError) {
              console.warn("⚠️ Could not fetch user by contact:", fetchError);
            }
          }
        }

        if (!userId) {
          console.warn("⚠️ No user_id found. Skipping featured fetch.");
          return;
        }

        const products = await fetchFeaturedProducts(userId);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    }

    getFeaturedProducts();
  }, []);

  const featured = featuredProducts[0];

  // ⭐ Featured Image Dynamic State
  const [currentFeatured, setCurrentFeatured] = React.useState(null);

  React.useEffect(() => {
    if (featured?.main_image) {
      setCurrentFeatured(featured.main_image);
    }
  }, [featured]);

  return (
    <HeaderFooter>
      <div className="homepage-container">

        {/* ⭐⭐⭐ FEATURED SECTION ⭐⭐⭐ */}
        <section className="featured-section">

          {/* ⭐ DYNAMIC FEATURED PHOTO + THUMBNAILS */}
          <div className="featured-image-container">
            
            {/* Thumbnails — show only if there are images */}
            <div className="thumbnail-row">
              {(featured?.images || []).slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="thumbnail-image"
                  onClick={() => setCurrentFeatured(img)}
                />
              ))}
            </div>

            {/* Big Featured Image */}
            <img
              src={
                currentFeatured ||
                featured?.main_image ||
                "https://via.placeholder.com/500?text=No+Image"
              }
              alt="Featured Product"
              className="featured-photo"
            />
          </div>

          {/* ⭐ RIGHT SIDE INFO BOX */}
          <div className="featured-box">

            <h1>{featured?.name || "Iraya Basket Lipa"}</h1>

            <h3>
              {featured?.artisan?.name ||
                featured?.brandName ||
                "Colored Wooden Tray Basket"}
            </h3>

            {/* Stars */}
            <p className="stars">
              {(() => {
                const rating =
                  typeof featured?.avg_rating === "number"
                    ? featured.avg_rating
                    : 5;
                const full = Math.floor(rating);
                const half = rating % 1 >= 0.5;
                const empty = 5 - full - (half ? 1 : 0);

                return (
                  <>
                    {[...Array(full)].map((_, i) => (
                      <i key={`full-${i}`} className="fas fa-star"></i>
                    ))}
                    {half && <i className="fas fa-star-half-alt"></i>}
                    {[...Array(empty)].map((_, i) => (
                      <i key={`empty-${i}`} className="far fa-star"></i>
                    ))}
                    <span className="rating-value">({rating.toFixed(1)})</span>
                  </>
                );
              })()}
            </p>

            <p>
              {featured?.description ||
                "Handwoven by Filipino artisans using sustainable abaca, the Iraya Basket Lipa adds vibrant color and texture to your space."}
            </p>

            <button
              className="shop-btn"
              onClick={() => navigate(`/product/${featured?.id}`)}
            >
              SHOP NOW!
            </button>
          </div>
        </section>

        {/* Latest Products */}
        <section className="latest-products">
          <div className="latest-products-grid">
            <img src={featuredphoto2} alt="Product 2" className="product-card" />
            <img src={featuredphoto3} alt="Product 3" className="product-card" />
          </div>
          <h2 className="latest-products-title">Latest Products</h2>
        </section>

        {/* Extra Products */}
        <section className="extra-products">
          <div className="extra-products-grid">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div className="product-item" key={product.id}>
                  <img
                    src={
                      product.main_image ||
                      "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={product.name}
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <p className="product-name">{product.name}</p>
                </div>
              ))
            ) : (
              <p>Loading latest products...</p>
            )}
          </div>
        </section>

        {/* Heritage Section */}
        <section className="heritage-section">
          <div className="heritage-container">
            <div className="heritage-image">
              <img src={Taal} alt="Taal Heritage" />
            </div>

            <div className="heritage-content">
              <h2>The Heritage Heart of Batangas</h2>
              <p>
                Taal, Batangas is where heritage breathes.  
                Through blades forged with pride and threads woven with grace,  
                each craft a quiet poem of the Filipino soul.
              </p>
              <button className="heritage-btn">View More</button>
            </div>
          </div>
        </section>

        {/* TahananCrafts Section */}
        <section className="tahanancrafts-section">
          <Logo className="tahanancrafts-logo" />
          <div className="description-box">
            <p>
              TahananCrafts is an online marketplace where you can discover and
              support Filipino artisans and their handmade creations.
            </p>
          </div>
        </section>
      </div>
    </HeaderFooter>
  );
}

export default HomePage;
