import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import "./ProductDetails.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { addToCart, getProduct, getImageUrl } from "./api"; // API call to add items to cart
import RecommendedProducts from "./YouMayLike";
// fallback image if no product image
import defaultImg from "./images/basket1.png";
function ProductDetail() {
  const { id } = useParams(); // get product ID from the URL (e.g. /products/5)
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(defaultImg);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // for navigation after actions
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("Latest");
  let productId = id; // Ensure productId is defined

  useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/products/review/ratings/?product=${id}`
        );
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [id]);
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    if (sort === "Oldest") return dateA - dateB;
    if (sort === "Highest Rated") return b.score - a.score;
    if (sort === "Lowest Rated") return a.score - b.score;
    return dateB - dateA; // Latest by default
  });
  const handleViewShop = () => {
    console.log("Clicked View Shop");
    console.log("Product:", product);
    if (product?.artisan?.id) {
      console.log("Navigating to:", `/shop/${product.artisan.id}/products`);
      navigate(`/shop/${product.artisan.id}/products`);
    } else {
      console.warn("No artisan associated with this product");
    }
  };
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id); // use the helper
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImg(`${process.env.REACT_APP_API_URL}${data.images[0].image}`);
        } else if (data.main_image) {
          setSelectedImg(`${process.env.REACT_APP_API_URL}${data.main_image}`);
        } else {
          setSelectedImg(defaultImg);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  if (loading) return <p className="loading">Loading product...</p>;
  if (!product) return <p className="error">Product not found</p>;
  return (
    <>
     {/* ===== HEADER ===== */}
           <header className="homepage-header">
             <Logo className="logo-svg homepage-logo" />
             <nav className="nav-links">
               <ul>
                 <li>
                   <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                     Home
                   </Link>
                 </li>
                 <li>
                   <Link to="/products" style={{ textDecoration: "none", color: "inherit" }}>
                     Products
                   </Link>
                 </li>
                 <li>
                   <Link to="/story" style={{ textDecoration: "none", color: "inherit" }}>
                     Story
                   </Link>
                 </li>
                 <li>
       <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
         Profile
       </Link>
     </li>
               </ul>
             </nav>
             <div className="header-actions">
               <div className="search-box">
                 <input type="text" placeholder="Search" />
                 <button className="search-btn">🔍</button>
               </div>
                {/* ✅ Cart button links to Cart page */}
         <Link to="/cart" style={{ textDecoration: "none" }}>
           <button className="cart-btn">CART 🛒</button>
         </Link>
       </div>
           </header>
      {/* ===== MAIN CONTENT ===== */}
      <div className="iraya-page">
        <div className="iraya-container">
          {/* LEFT: Images */}
          <div className="iraya-images">
            <img
              src={selectedImg || defaultImg}
              alt={product.name}
              className="main-image"
            />
            <div className="thumbnails">
              {/* If there are multiple images or a main image */}
              {((product.images && product.images.length > 0) || product.main_image) ? (
                <>
                  {/* ✅ Show main image first if it exists */}
                  {product.main_image && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${product.main_image}`}
                      alt={`${product.name} main`}
                      onClick={() =>
                        setSelectedImg(`${process.env.REACT_APP_API_URL}${product.main_image}`)
                      }
                      className={selectedImg === `${process.env.REACT_APP_API_URL}${product.main_image}` ? "active" : ""}
                    />
                  )}
                  {/* ✅ Show additional images */}
                  {product.images && product.images.map((img, i) => (
                    <img
                      key={i}
                      src={`${process.env.REACT_APP_API_URL}${img.image}`}
                      alt={`${product.name} ${i + 1}`}
                      onClick={() =>
                        setSelectedImg(`${process.env.REACT_APP_API_URL}${img.image}`)
                      }
                      className={selectedImg === `${process.env.REACT_APP_API_URL}${img.image}` ? "active" : ""}
                    />
                  ))}
                </>
              ) : (
                // Fallback image if no product images
                <img src={defaultImg} alt="Default" />
              )}
            </div>
          </div>
          {/* RIGHT: Details */}
          <div className="iraya-details">
            <h1>{product.name}</h1>
            <h2>{product.brandName || "—"}</h2>

            {/* ⭐ Ratings + Total Reviews */}
            <div className="product-rating-box">
              <span className="rating-stars">⭐ {product.avg_rating}</span>
              <span className="rating-count">({reviews.length} reviews)</span>
            </div>

            {/* 📦 Stock */}
            <p className="product-stock">
              Stock: <strong>{product.stock_quantity}</strong> available
            </p>

            {/* Show description instead of categories */}
            <p className="description">
              {product.description || "No description available."}
            </p>
            <h3 className="price">
              {product.sales_price ? (
                <>
                  ₱{product.sales_price}
                  <span className="regular-price">₱{product.regular_price}</span>
                </>
              ) : (
                <>₱{product.regular_price}</>
              )}
            </h3>

            <p className="total">
              ₱{(
                (product.sales_price || product.regular_price) * quantity
              ).toLocaleString()}
            </p>

            {/* Quantity controls */}
              <div className="quantity">
                <label>Quantity</label>
                <div className="quantity-controls">

                  {/* MINUS */}
                  <button
                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                    className="qty-btn"
                  >
                    -
                  </button>

                  {/* INPUT BOX */}
                  <input
                    type="number"
                    className="qty-input"
                    value={quantity}
                    onChange={(e) => {
                      let val = Number(e.target.value);

                      // prevent below 1
                      if (val < 1) val = 1;

                      // 🛑 PREVENT ABOVE STOCK
                      if (val > product.stock_quantity) {
                        alert(`Only ${product.stock_quantity} stocks available.`);
                        val = product.stock_quantity;
                      }

                      setQuantity(val);
                    }}
                    onBlur={(e) => {
                      let val = Number(e.target.value);
                      if (!val || val < 1) val = 1;

                      // 🛑 Ensure stays within stock
                      if (val > product.stock_quantity) val = product.stock_quantity;

                      setQuantity(val);
                    }}
                    min="1"
                    max={product.stock_quantity}
                  />

                  {/* PLUS */}
                  <button
                    onClick={() => {
                      if (quantity + 1 > product.stock_quantity) {
                        alert(`Only ${product.stock_quantity} stocks available.`);
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    className="qty-btn"
                  >
                    +
                  </button>

                </div>
              </div>

              {/* Add to Cart */}
              <div className="add-to-cart">
                <button
                  onClick={async () => {
                    try {
                      const userId = localStorage.getItem("user_id");
                      if (!userId) {
                        alert("⚠️ Please log in to add items to your cart.");
                        navigate("/login");
                        return;
                      }

                      // 🛑 FINAL CHECK BEFORE API CALL
                      if (quantity > product.stock_quantity) {
                        alert(`Only ${product.stock_quantity} stocks available.`);
                        return;
                      }

                      await addToCart(userId, product.id, quantity);
                      alert("✅ Item added to cart!");

                    } catch (err) {
                      console.error("Add to cart failed:", err);
                      alert(
                        err.response?.data?.error ||
                        `❌ Failed to add to cart: ${err.message}`
                      );
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      {/* ===== RATINGS & REVIEWS ===== */}
      <div className="reviews-section">
        <h2>RATINGS & REVIEWS</h2>
        <div className="reviews-header">
          <p>All Reviews ({reviews.length})</p>
          <div className="reviews-actions">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Latest</option>
              <option>Oldest</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
            </select>
          </div>
        </div>
        <div className="reviews-grid">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <div className="review-card" key={review.id}>
                <p className="stars">{"⭐".repeat(review.score)}</p>
                <h4>
                  {review.name
                    ? Number(review.anonymous) === 1
                      ? (() => {
                          // Masked name (anonymous = 1)
                          const parts = review.name.split(" ");
                          return parts
                            .map((part) => {
                              if (part.length <= 1) return part;
                              return (
                                part[0] +
                                "*".repeat(Math.max(1, Math.min(part.length - 1, 4)))
                              );
                            })
                            .join(" ");
                        })()
                      : review.name // Full name (anonymous = 0)
                    : `User #${review.user}`}
                </h4>
                <p>{review.review || "(No review text provided)"}</p>
                <small>
                  Posted on{" "}
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </small>
              </div>
            ))
          ) : (
            <p>No reviews yet for this product.</p>
          )}
        </div>
      </div>
     {/* ===== SHOP SECTIN ===== */}
      <section className="shop-section">
        <hr className="shop-divider" />
        <div
          className="shop-card-horizontal"
          onClick={handleViewShop} // ✅ now using the function
          style={{ cursor: "pointer" }}
        >
          <div className="shop-image-horizontal">
            <img
              src={getImageUrl(product.artisan?.main_photo)}
              alt={product.artisan?.name}
              className="shop-avatar"
            />
          </div>
          <div className="shop-info">
            <h3 className="shop-name">
              {product.artisan?.name || "Artisan Shop"}
            </h3>
            <button className="view-shop-btn" onClick={(e) => {
              e.stopPropagation(); // prevent triggering parent div click
              handleViewShop();
            }}>
              View Shop
            </button>
          </div>
        </div>
        <hr className="shop-divider" />
      </section>
      {/* ===== YOU MAY ALSO LIKE ===== */}
      <RecommendedProducts productId={productId} />
      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
          <p>
            This is a sample description and does not hold any valuable meaning.
          </p>
          <button className="register-btn">Register</button>
        </div>
        <div className="footer-right">
          <hr />
          <div className="footer-content">
            <h1 className="footer-logo">THC</h1>
            <div className="footer-links">
              <div>
                <h4>ABOUT US</h4>
                <p>TahananCrafts</p>
                <p>About</p>
              </div>
              <div>
                <h4>SUPPORT</h4>
                <p>Customer Support</p>
                <p>Contact</p>
              </div>
              <div>
                <h4>EMAIL</h4>
                <p>Sample@email.com</p>
              </div>
            </div>
          </div>
          <hr />
          <div className="footer-bottom">
            <p>© 2025 - TahananCrafts</p>
            <p>Privacy — Terms</p>
          </div>
        </div>
      </footer>
    </>
  );
}
export default ProductDetail;
