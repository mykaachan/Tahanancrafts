import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import "./ProductDetails.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { addToCart } from "./api"; // API call to add items to cart

// fallback image if no product image
import defaultImg from "./images/basket1.png";

function ProductDetail() {
  const { id } = useParams(); // get product ID from the URL (e.g. /products/5)
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(defaultImg);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // for navigation after actions

  useEffect(() => {
    // fetch product details from Django backend
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/products/product/products/${id}/`
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);

        // Check if multiple images exist, or just main_image
        if (data.images && data.images.length > 0) {
          setSelectedImg(`http://127.0.0.1:8000${data.images[0].image}`);
        } else if (data.main_image) {
          setSelectedImg(`http://127.0.0.1:8000${data.main_image}`);
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
              {product.images && product.images.length > 0 ? (
                product.images.map((img, i) => (
                  <img
                    key={i}
                    src={`http://127.0.0.1:8000${img.image}`}
                    alt={product.name}
                    onClick={() =>
                      setSelectedImg(`http://127.0.0.1:8000${img.image}`)
                    }
                  />
                ))
              ) : product.main_image ? (
                <img
                  src={`http://127.0.0.1:8000${product.main_image}`}
                  alt={product.name}
                />
              ) : (
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
