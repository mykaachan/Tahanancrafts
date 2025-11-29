import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto1 from "./images/featuredphoto1.png";
import featuredphoto2 from "./images/featuredphoto2.png";
import featuredphoto3 from "./images/featuredphoto3.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
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
  return (
    <HeaderFooter>
      <div className="homepage-container">
        {/* Featured Section */}
        <section className="featured-section">
          {/* LEFT SIDE IMAGE */}
          <div className="featured-left">
            <img
              src={
                featured?.main_image
                  ? `${process.env.REACT_APP_API_URL}${featured.main_image}`
                  : featuredphoto1
              }
              alt="Featured Product"
              className="featured-photo"
            />
          </div>
          {/* RIGHT SIDE INFO */}
          <div className="featured-box">
            <h1>{featured?.name || "Iraya Basket Lipa"}</h1>
            <h3>
              {featured?.artisan?.name ||
                featured?.brandName ||
                "Colored Wooden Tray Basket"}
            </h3>
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
                    <span className="rating-value">
                      ({rating.toFixed(1)})
                    </span>
                  </>
                );
              })()}
            </p>
            <p>
              {featured?.description ||
                "Handwoven by Filipino artisans using sustainable abaca."}
            </p>
            <button
              className="shop-btn"
              onClick={() => navigate(`/product/${featured?.id}`)}
            >
              SHOP NOW!
            </button>
          </div>
        </section>
        {/* SHOP CARDS (static images) */}
        <section className="shop-cards">
          <div className="shop-cards-grid">
            <img src={featuredphoto2} alt="Shop Card 1" className="shop-card" />
            <img src={featuredphoto3} alt="Shop Card 2" className="shop-card" />
          </div>
        </section>
        {/* REAL LATEST PRODUCTS */}
        <section className="latest-products">
          <h2 className="latest-products-title">Latest Products</h2>
          <div className="latest-products-grid">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div className="product-item" key={product.id}>
                  <img
                    src={product.main_image}
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
                Taal, Batangas is where heritage breathes. <br />
                Through blades forged with pride and threads woven with grace, <br />
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
