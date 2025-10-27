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

  let productId = id; // Ensure productId is defined

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

            {/* Show description instead of categories */}
            <p className="description">
              {product.description || "No description available."}
            </p>

            <h3 className="price">
              ₱{Number(product.regular_price).toLocaleString()}
            </h3>

            {/* You can remove this one if you don’t want description repeated */}
            {/* <p className="description">{product.description}</p> */}

            {/* Quantity controls */}
            <div className="quantity">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
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

                    // Ensure quantity is always at least 1
                    const qty = quantity && quantity > 0 ? quantity : 1;

                    // Call your API function
                    await addToCart(userId, product.id, qty);

                    alert("✅ Item added to cart!");
                  } catch (err) {
                    console.error("Add to cart failed:", err);
                    alert(`❌ Failed to add to cart: ${err.message}`);
                  }
                }}
              >
                Add to Cart
              </button>
            </div>

              <p className="total">
                ₱{(product.regular_price * quantity).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      
      {/* ===== RATINGS & REVIEWS ===== */}
      <div className="reviews-section">
        <h2>RATINGS & REVIEWS</h2>

        <div className="reviews-header">
          <p>All Reviews (6)</p>
          <div className="reviews-actions">
            <select>
              <option>Latest</option>
              <option>Oldest</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
            </select>
            <button className="review-btn">Write a Review</button>
          </div>
        </div>

        <div className="reviews-grid">
          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐⭐</p>
            <h4>Juan D.</h4>
            <p>salamat po mabilis delivery at maganda nman Ang bilao thank you po ng marami.....😊😊😊😊😊😊😊</p>
            <small>Posted on May 14, 2025</small>
          </div>

          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐⭐</p>
            <h4>Mikaela M.</h4>
            <p>SUPER LEGIT GUYS, WALANG LABIS, WALANG KULANG, SOBRANG LAKI NITO. WORTH IT NAMAN SIYA GUYSS!!💞💞</p>
            <small>Posted on May 15, 2025</small>
          </div>

          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐½</p>
            <h4>Missy R.</h4>
            <p>satisfied buyer here, well packed and maganda yung bilao, sakto para sa mga paorder kong kakanin...</p>
            <small>Posted on May 16, 2025</small>
          </div>

          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐</p>
            <h4>Angela P.</h4>
            <p>Double-stitched for extra strength, Support local small businesses, eco-friendly bamboo material...</p>
            <small>Posted on May 17, 2025</small>
          </div>

          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐⭐</p>
            <h4>Gabrielo K.</h4>
            <p>salamat po ng marami dumating on time sakto sakto, salamat din Kay kuya rider na mabait...</p>
            <small>Posted on May 18, 2025</small>
          </div>

          <div className="review-card">
            <p className="stars">⭐⭐⭐⭐½</p>
            <h4>Inday H.</h4>
            <p>nice product 👍👍👍...will order again soon. thanks much po sa nag deliver... keepsafe always</p>
            <small>Posted on May 19, 2025</small>
          </div>
        </div>
      </div>

     {/* ===== SHOP SECTION ===== */}
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
              style={{
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                objectFit: "cover",
              }}
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
