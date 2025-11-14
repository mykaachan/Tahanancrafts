import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto1 from "./images/featuredphoto1.png"; // make sure extension is correct
import featuredphoto2 from "./images/featuredphoto2.png";
import featuredphoto3 from "./images/featuredphoto3.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
import { Link } from "react-router-dom"; 
import HeaderFooter from "./HeaderFooter";
import { fetchLatestProducts,fetchFeaturedProducts, getUserByContact } from "./api"; // Import the API function
import { useNavigate } from "react-router-dom";

// ✅ HomePage Component  with dynamic latest products

function HomePage() {
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const navigate = useNavigate();
    const buildUrl = (path) => {
    if (!path) return featuredphoto1; // fallback to existing image
    const cleaned = path.replace("/media/media", "/media");

    if (cleaned.startsWith("http")) return cleaned;

    return `${process.env.REACT_APP_API_URL}${cleaned}`;
  };

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

         {/* Featured Section */}
        <section className="featured-section">
          <img
            src={
              featured?.main_image
                ? buildUrl(featured.main_image) // same logic as latest products, with URL fix
                : featuredphoto1
            }
            alt="Featured Product"
            className="featured-photo"
          />

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
                    <span className="rating-value">({rating.toFixed(1)})</span>
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