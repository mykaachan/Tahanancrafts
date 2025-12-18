import React from "react";
import { ReactComponent as Logo } from "./Logo.svg";
import featuredphoto1 from "./images/featuredphoto1.png";
import Taal from "./images/Taal.png";
import "./HomePage.css";
import HeaderFooter from "./HeaderFooter";
import { fetchLatestProducts, fetchFeaturedProducts, getUserByContact } from "./api";
import { useNavigate } from "react-router-dom";

// ---------------- CACHE SYSTEM ---------------- //
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCache(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  if (Date.now() - parsed.timestamp > CACHE_DURATION) return null;

  return parsed.data;
}

function setCache(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({ timestamp: Date.now(), data })
  );
}
// ------------------------------------------------ //

function HomePage() {
  const previewRole = localStorage.getItem("view_as");
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const [recentArtisans, setRecentArtisans] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const navigate = useNavigate();

  // Track if all data sources are finished loading
  const loadingRef = React.useRef({
    artisans: false,
    latest: false,
    featured: false,
  });

  function markLoaded(key) {
    loadingRef.current[key] = true;

    if (
      loadingRef.current.artisans &&
      loadingRef.current.latest &&
      loadingRef.current.featured
    ) {
      setIsLoading(false);
    }
  }

  // ---------------- FETCH ARTISANS (CACHED) ---------------- //
  React.useEffect(() => {
    async function fetchArtisans() {
      const cached = getCache("recent_artisans");
      if (cached) {
        setRecentArtisans(cached);
        markLoaded("artisans");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/products/admin/dashboard/`
        );
        const data = await response.json();

        if (data?.lists?.artisans) {
          const sorted = [...data.lists.artisans].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          const latestTwo = sorted.slice(0, 2);
          setRecentArtisans(latestTwo);
          setCache("recent_artisans", latestTwo);
        }
      } catch (error) {
        console.error("Error fetching artisans:", error);
      }

      markLoaded("artisans");
    }

    fetchArtisans();
  }, []);

  // ---------------- FETCH LATEST PRODUCTS (CACHED) ---------------- //
  React.useEffect(() => {
    async function loadLatestProducts() {
      const cached = getCache("latest_products");
      if (cached) {
        setLatestProducts(cached);
        markLoaded("latest");
        return;
      }

      try {
        const products = await fetchLatestProducts();
        setLatestProducts(products);
        setCache("latest_products", products);
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }

      markLoaded("latest");
    }

    loadLatestProducts();
  }, []);

  // ---------------- FETCH FEATURED PRODUCTS (CACHED) ---------------- //
  React.useEffect(() => {
    async function loadFeaturedProducts() {
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
          } catch (error) {
            console.warn("⚠️ Could not fetch user by contact:", error);
          }
        }
      }

      if (!userId) {
        markLoaded("featured");
        return;
      }

      const cached = getCache(`featured_products_${userId}`);
      if (cached) {
        setFeaturedProducts(cached);
        markLoaded("featured");
        return;
      }

      try {
        const products = await fetchFeaturedProducts(userId);
        setFeaturedProducts(products);
        setCache(`featured_products_${userId}`, products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }

      markLoaded("featured");
    }

    loadFeaturedProducts();
  }, []);

  const featured = featuredProducts[0];

  // ---------------- LAZY LOADING SCREEN ---------------- //
  if (isLoading) {
    return (
      <div className="lazy-screen">
        <div className="loader"></div>
        <p>Loading TahananCrafts...</p>
      </div>
    );
  }

  return (
    <HeaderFooter>
      <div className="homepage-container">
       {previewRole && (
        <div className="preview-banner">
          👁️ You are viewing the site as{" "}
          <strong>{previewRole.toUpperCase()}</strong> (ADMIN PREVIEW)
          <button
            onClick={() => {
              localStorage.removeItem("view_as");
              window.location.href = "/admin-dashboard";
            }}
          >
            Exit Preview
          </button>
        </div>
      )}

        {/* ---------------- FEATURED SECTION ---------------- */}
        <section className="featured-section">
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

        {/* ---------------- SHOP CARDS ---------------- */}
        <section className="shop-cards">
          <h2 className="shop-cards-title">Newest Artisan Shops</h2>
          <div className="shop-cards-grid">
            {recentArtisans.map((artisan) => (
              <div
                className="shop-card-wrapper"
                key={artisan.id}
                onClick={() => navigate(`/heritage/${artisan.id}`)}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${artisan.main_photo}`}
                  alt={artisan.name}
                  className="shop-card"
                />
                <p className="artisan-name">{artisan.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- LATEST PRODUCTS ---------------- */}
        <section className="latest-products">
          <h2 className="latest-products-title">Latest Products</h2>
          <div className="latest-products-grid">
            {latestProducts.map((product) => (
              <div className="product-item" key={product.id}>
                <img
                  src={product.main_image}
                  alt={product.name}
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <p className="product-name">{product.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- HERITAGE SECTION ---------------- */}
        <section className="heritage-section">
          <div className="heritage-container">
            <div className="heritage-image">
              <img src={Taal} alt="Taal Heritage" />
            </div>

            <div className="heritage-content">
              <h2>The Heritage Heart of Batangas</h2>
              <p>
                Taal, Batangas is where heritage breathes. Where every street, corner, and workshop carries the quiet pulse of Filipino tradition. Through blades forged with unwavering pride and threads woven with patient grace, each craft becomes a living poem of the Filipino soul. The artisans of Taal do more than create—they safeguard stories that have endured for generations. Their hands, shaped by years of practice and passion, transform raw materials into cultural treasures that speak of identity, resilience, and timeless artistry. In every weave, carve, and stroke, the spirit of Taal’s people comes alive, honoring the past while guiding the future of Batangueño craftsmanship.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- TAHANANCRAFTS SECTION ---------------- */}
        <section className="tahanancrafts-section">
          <Logo className="tahanancrafts-logo" />
          <div className="description-box">
            <p>
              TahananCrafts is an online marketplace dedicated to showcasing the beauty, skill, and heritage of Filipino handmade artistry. 
              We provide a digital home where local artisans, especially those from Batangas, can share their handcrafted creations with a wider audience.
               Every product reflects the rich traditions, creativity, and cultural identity of the makers behind them. 
               Through TahananCrafts, customers can discover meaningful pieces, support local livelihoods, and take part in preserving the 
               diverse craftsmanship of the Philippines.            
            </p>
          </div>
        </section>

      </div>
    </HeaderFooter>   
  );
}

export default HomePage;
