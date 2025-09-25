import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./Iraya.css";
import { ReactComponent as Logo } from "./Logo.svg";

// fallback image if no product image
import defaultImg from "./images/basket1.png";

function ProductDetail() {
  const { id } = useParams(); // get product ID from the URL (e.g. /products/5)
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(defaultImg);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch product details from Django backend
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/products/product/products/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);

        // set default image if product has images
        if (data.images && data.images.length > 0) {
          setSelectedImg(data.images[0].image); // assuming serializer returns images as [{image: url}, ...]
        }
      } catch (err) {
        console.error(err);
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
            <li><Link to="/homepage">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/story">Story</Link></li>
            <li>Profile</li>
          </ul>
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>
          <button className="cart-btn">CART 🛒</button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="iraya-page">
        <div className="iraya-container">
          {/* LEFT: Images */}
          <div className="iraya-images">
            <img src={selectedImg || defaultImg} alt={product.name} className="main-image" />
            <div className="thumbnails">
              {(product.images && product.images.length > 0) ? (
                product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.image}
                    alt={product.name}
                    onClick={() => setSelectedImg(img.image)}
                  />
                ))
              ) : (
                <img src={defaultImg} alt="Default" />
              )}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="iraya-details">
            <h1>{product.name}</h1>
            <h2>{product.brandName || "—"}</h2>
            <p className="category">
              {product.categories?.map(c => c.name).join(", ")}
            </p>
            <h3 className="price">₱{Number(product.regular_price).toLocaleString()}</h3>
            <p className="description">{product.description}</p>

            {/* Quantity controls */}
            <div className="quantity">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="add-to-cart">
              <Link to="/cart">
                <button>Add to Cart</button>
              </Link>
              <p className="total">
                ₱{(product.regular_price * quantity).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-left">
          <h2>Join us, <br /> artisans!</h2>
          <p>This is a sample description and does not hold any valuable meaning.</p>
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
