import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto1 from "./images/featuredphoto1.png"; // make sure extension is correct
import featuredphoto2 from "./images/featuredphoto2.png";
import featuredphoto3 from "./images/featuredphoto3.png";
import balisong from "./images/balisong.png";
import basket from "./images/basket.png";
import barong from "./images/barong.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
import { Link } from "react-router-dom"; 
import HeaderFooter from "./HeaderFooter";
import { fetchLatestProducts,fetchFeaturedProducts, getUserByContact,API_URL } from "./api"; // Import the API function
import { useNavigate } from "react-router-dom";

// ✅ HomePage Component  with dynamic latest products

function HomePage() {
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const navigate = useNavigate();

    React.useEffect(() => {
    // ✅ Fetch latest products
    async function getLatestProducts() {
      try {
        const products = await fetchLatestProducts();
        setLatestProducts(products);
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    }

    getLatestProducts();

    // ✅ Fetch featured products (with fallback for contact)
    async function getFeaturedProducts() {
      try {
        let userId = localStorage.getItem("user_id");

        // 🧩 If user_id missing, fetch via contact
        if (!userId) {
          const contact = localStorage.getItem("user_contact");
          if (contact) {
            console.log("🔍 Fetching user_id using contact:", contact);
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

        // 🚫 If still no userId, skip
        if (!userId) {
          console.warn("⚠️ No user_id found. Skipping featured fetch.");
          return;
        }

        // ✅ Fetch featured products
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

     {/* ✅ Featured Section (matches your CSS layout) */}
      <section className="featured-section">
        {featured ? (
          <>
            {/* Left side image */}
            <img
              src={
                featured.main_image?.startsWith("http")
                  ? featured.main_image
                  : `${process.env.REACT_APP_API_URL}${featured.main_image}`
              }
              alt={featured.name}
              className="featured-photo"
            />

            {/* Right-side brown box */}
            <div className="featured-box">
              <h1>{featured.name}</h1>
              <h3>{featured.artisan?.name || featured.brandName}</h3>

              {/* ⭐ Dynamic rating stars */}
              <div className="stars">
                {(() => {
                  const rating = featured.average_rating || 0;
                  const fullStars = Math.floor(rating);
                  const halfStar = rating % 1 >= 0.5;
                  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

                  return (
                    <>
                      {[...Array(fullStars)].map((_, i) => (
                        <i key={`full-${i}`} className="fas fa-star"></i>
                      ))}
                      {halfStar && <i className="fas fa-star-half-alt"></i>}
                      {[...Array(emptyStars)].map((_, i) => (
                        <i key={`empty-${i}`} className="far fa-star"></i>
                      ))}
                      <span className="rating-value">
                        ({rating ? rating.toFixed(1) : "No rating"})
                      </span>
                    </>
                  );
                })()}
              </div>

              <p>{featured.description}</p>

              {/* 💰 Price Section */}
              <div className="price-box">
                <span className="price-sale">
                  ₱{parseFloat(featured.sales_price).toFixed(2)}
                </span>
                {featured.regular_price &&
                  parseFloat(featured.sales_price) <
                    parseFloat(featured.regular_price) && (
                    <span className="price-regular">
                      ₱{parseFloat(featured.regular_price).toFixed(2)}
                    </span>
                  )}
              </div>

              <button
                className="shop-btn"
                onClick={() => navigate(`/product/${featured.id}`)}
              >
                SHOP NOW!
              </button>
            </div>
          </>
        ) : (
          <p>Loading featured product...</p>
        )}
      </section>




      {/* ✅ Latest Products Section */}
      <section className="latest-products">
        <div className="latest-products-grid">
          <img src={featuredphoto2} alt="Product 2" className="product-card" />
          <img src={featuredphoto3} alt="Product 3" className="product-card" />
        </div>
        <h2 className="latest-products-title">Latest Products</h2>
      </section>

       {/* ✅ Extra Products Section (Dynamic) */}
        <section className="extra-products">
          <div className="extra-products-grid">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div className="product-item" key={product.id}>
                  <img
                    src={product.main_image || "https://via.placeholder.com/150?text=No+Image"}
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
          {/* Left: Image */}
          <div className="heritage-image">
            <img src={Taal} alt="Taal Heritage" />
          </div>

          {/* Right: Content */}
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

      {/* ✅ TahananCrafts Section */}
      <section className="tahanancrafts-section">
        <Logo className="tahanancrafts-logo" />
        <div className="description-box">
          <p>
            TahananCrafts is an online marketplace where you can discover and
            support Filipino artisans and their handmade creations. We bring
            traditional craftsmanship to the digital world, giving local makers a
            space to grow their businesses and share their culture with more
            people. With the help of smart data tools, we make it easier for
            artisans to understand what customers love and improve their products.
            At TahananCrafts, you're not just shopping—you’re helping preserve
            Filipino art, support communities, and celebrate local talent.
          </p>
        </div>
      </section>
    </div>
    </HeaderFooter>
  );
}

export default HomePage;
