import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import "./Shop.css";
import {getImageUrl } from "./api";

function ShopAllProducts() {
  const { artisan_id } = useParams();
  const [products, setProducts] = useState([]);
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/product/shop/${artisan_id}/`);
        const data = await res.json();
        setProducts(data.products || data);
        setArtisan(data.artisan || null);
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopProducts();
  }, [artisan_id]);

  const handleProductClick = (productId) => {
    const userId = localStorage.getItem("user_id");

    // Log product view
    fetch(`${API_URL}/products/product/log-view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, user_id: userId }),
    }).catch((err) => console.error("Failed to log product view:", err));

    navigate(`/product/${productId}`);
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <HeaderFooter>
      <div className="shop-page">
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

        <div className="shop-tabs">
          <Link to={`/shop/${artisan_id}`}>
            <button>Home</button>
          </Link>
          <button className="active">All Products</button>
        </div>

        <div className="recommended">
          <h3>ALL PRODUCTS</h3>
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => {
                const imageUrl =
                  product.main_image
                    ? getImageUrl(product.main_image)
                    : product.images && product.images.length > 0
                    ? getImageUrl(product.images[0].image)
                    : "https://via.placeholder.com/150?text=No+Image";

                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={imageUrl} alt={product.name} className="product-img" />
                    <p>{product.name}</p>
                    <span>₱{product.sales_price || product.regular_price}</span>
                  </div>
                );
              })
            ) : (
              <p>No products found for this artisan.</p>
            )}
          </div>
        </div>
      </div>
    </HeaderFooter>
  );
}

export default ShopAllProducts;
