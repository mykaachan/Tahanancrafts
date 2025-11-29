import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "./api"; 
import "./ProductDetails.css";
function RecommendedProducts({ productId }) {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch(
          `${API_URL}/api/products/product/recommendations/${productId}/`
        );
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendedProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
        setRecommendedProducts([]);
      }
    }
    fetchRecommendations();
  }, [productId]);
  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };
  if (recommendedProducts.length === 0) return null;
  return (
    <section className="related-section">
      <h2 className="related-title">You may also like</h2>
      <div className="related-grid">
        {recommendedProducts.map((product) => (
          <div
            className="related-card"
            key={product.id}
            onClick={() => handleProductClick(product.id)}
          >
            <img src={getImageUrl(product.main_image)} alt={product.name} />
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <span className="price">₱{product.sales_price || product.regular_price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
export default RecommendedProducts;
