import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import "./Shop.css";
import { getImageUrl } from "./api";

function Shop() {
  const { artisan_id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [topSelling, setTopSelling] = useState([]);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/product/top-selling/${artisan_id}/`);
        const data = await res.json();
        setTopSelling(data);
      } catch (err) {
        console.error("Failed to fetch top selling products:", err);
      }
    };

    fetchTopSelling();
  }, [artisan_id]);


  useEffect(() => {
    const fetchShopData = async () => {
      try {
        // 1️⃣ Fetch artisan info and all their products (to display shop details)
        const artisanRes = await fetch(`${API_URL}/api/products/product/shop/${artisan_id}/`);
        const artisanData = await artisanRes.json();
        setArtisan(artisanData.artisan || null);

        // 2️⃣ Fetch personalized recommendations for the logged-in user
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const recRes = await fetch(`${API_URL}/api/products/personalized/${userId}/`);
          const recData = await recRes.json();

          // 3️⃣ Filter personalized results for this artisan only
          const filtered = recData
            .filter((p) => p.shop?.id === parseInt(artisan_id))
            .slice(0, 4);
          setRecommended(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [artisan_id, API_URL]);

  const handleProductClick = (productId) => {
    const userId = localStorage.getItem("user_id");
    fetch(`${API_URL}/api/products/product/log-view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, user_id: userId }),
    }).catch((err) => console.error("Failed to log product view:", err));

    navigate(`/product/${productId}`);
  };

  if (loading) return <p>Loading shop...</p>;

  return (
    <HeaderFooter>
      <div className="shop-page">
        {/* ===== Header Banner ===== */}
        <div className="shop-banner">
          <div className="shop-info">
           <div className="shop-logo placeholder-img">
              {artisan?.main_photo && (
                  <img
                    src={getImageUrl(artisan.main_photo)}
                    alt={artisan.name}
                    className="shop-main-photo"
                  />
              )}
            </div>
            <div>
              <h2>{artisan?.name || "Artisan Shop"}</h2>
                <p>{artisan?.location || "Local Handcrafted Goods"}</p>
                <button className="btn">Follow</button>
                <button className="btn">Message</button>
            </div>
          </div>
        </div>

        {/* ===== Nav Tabs ===== */}
        <div className="shop-tabs">
          <button className="active">Home</button>
          <Link to={`/shop/${artisan_id}/products`}>
            <button>All Products</button>
          </Link>
        </div>

        {/* ===== Recommended Section ===== */}
        <div className="recommended">
          <h3>RECOMMENDED FOR YOU</h3>

          {recommended.length > 0 ? (
            <div className="product-grid">
              {recommended.map((product) => {
                const imageUrl =
                  product.main_image
                    ? getImageUrl(product.main_image)
                    : product.images?.length
                    ? getImageUrl(product.images[0].image)
                    : "https://via.placeholder.com/150?text=No+Image";

                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="product-img"
                    />
                    <p>{product.name}</p>
                    <span>₱{product.sales_price || product.regular_price}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No personalized recommendations available for this shop.</p>
          )}
        </div>

        {/* ===== About Section ===== */}
        <div className="about-shop">
          <div className="placeholder-img banner"></div>
          <div className="about-text">
            <h3>About Shop</h3>
            <p>{artisan?.description || "No description available."}</p>
          </div>
        </div>

        {/* ===== Top Selling (Placeholder for Now) ===== */}
        <div className="recommended">
          <h3>Top Selling Products</h3>
          <div className="product-grid">
            {topSelling.length > 0 ? (
              topSelling.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={
                      product.main_image
                        ? getImageUrl(product.main_image)
                        : product.images && product.images.length > 0
                        ? getImageUrl(product.images[0].image)
                        : "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={product.name}
                    className="product-img"
                  />
                  <p>{product.name}</p>
                  <span>₱{product.sales_price || product.regular_price}</span>
                </div>
              ))
            ) : (
              <p>No top products yet.</p>
            )}
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default Shop;
