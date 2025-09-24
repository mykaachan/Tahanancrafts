import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getImageUrl } from "./api";
import "./Iraya.css"; // your Iraya styles

function ProductDetail() {
  const { id } = useParams(); // get product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/products/product/products/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-detail-page">
      <h1>{product.name}</h1>
      <img src={getImageUrl(product.main_image)} alt={product.name} />
      <p>{product.description}</p>
      <span className="price">₱{product.regular_price}</span>
      <Link to="/products">Back to Products</Link>
    </div>
  );
}

export default ProductDetail;
