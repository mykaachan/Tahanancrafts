import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import "./ProductDetails.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { addToCart, getProduct, getImageUrl } from "./api";
import RecommendedProducts from "./YouMayLike";
// fallback image if no product image
import defaultImg from "./images/basket1.png";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(defaultImg);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("Latest");
  let productId = id;

  /* =========================
     CACHE CONFIG
  ========================== */
  const PRODUCT_CACHE_KEY = `product_details_${id}`;
  const PRODUCT_CACHE_TIME = `product_details_time_${id}`;

  const REVIEW_CACHE_KEY = `product_reviews_${id}`;
  const REVIEW_CACHE_TIME = `product_reviews_time_${id}`;

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /* =========================
     IMAGE HELPER (UNCHANGED)
  ========================== */
  const urlFor = (img) => {
    if (!img) return null;
    try {
      if (typeof img === "object") {
        if (img.image) return getImageUrl(img.image);
        if (img.url) return getImageUrl(img.url);
      }
      if (typeof img === "string") return getImageUrl(img);
    } catch {}
    return null;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  /* =========================
     FETCH REVIEWS (WITH CACHE)
  ========================== */
  useEffect(() => {
    const cached = localStorage.getItem(REVIEW_CACHE_KEY);
    const cachedTime = localStorage.getItem(REVIEW_CACHE_TIME);

    if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
      setReviews(JSON.parse(cached));
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/products/review/ratings/?product=${id}`
        );
        const data = await res.json();
        setReviews(data);
        localStorage.setItem(REVIEW_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(REVIEW_CACHE_TIME, Date.now());
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
    return dateB - dateA;
  });

  const handleViewShop = () => {
    if (product?.artisan?.id) {
      navigate(`/shop/${product.artisan.id}/products`);
    }
  };

  /* =========================
     FETCH PRODUCT (WITH CACHE)
  ========================== */
  useEffect(() => {
    const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
    const cachedTime = localStorage.getItem(PRODUCT_CACHE_TIME);

    if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
      const cachedProduct = JSON.parse(cached);
      setProduct(cachedProduct);

      let firstImg = null;
        if (Array.isArray(cachedProduct.images) && cachedProduct.images.length > 0) {
          firstImg = urlFor(cachedProduct.images[0]);
        }
        if (!firstImg && cachedProduct.main_image)
          firstImg = urlFor(cachedProduct.main_image);

        setSelectedImg(firstImg || defaultImg);
        setLoading(false);
      }

    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);

        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(PRODUCT_CACHE_TIME, Date.now());

        let firstImg = null;
        if (Array.isArray(data.images) && data.images.length > 0) {
          firstImg = urlFor(data.images[0]);
        }
        if (!firstImg && data.main_image) firstImg = urlFor(data.main_image);
        setSelectedImg(firstImg || defaultImg);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="iraya-page">
        <div className="iraya-container skeleton">
          <div className="skeleton-box image"></div>
          <div className="skeleton-box text"></div>
        </div>
      </div>
    );
  }

  if (!product) return <p className="error">Product not found</p>;

  const longDesc =
    product.long_description &&
    String(product.long_description).trim().toLowerCase() !== "null"
      ? product.long_description
      : product.description || "No description available.";
  
  const mainImageUrl = selectedImg || defaultImg;

  const formatPHP = (value) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const unitPrice = Number(product?.sales_price ?? product?.regular_price ?? 0);
  const totalPrice = unitPrice * quantity;

  return (
    <>
     {/* ===== MAIN CONTENT ===== */}
     <div className="iraya-page">
       <div className="iraya-container">
         {/* LEFT: Images */}
         <div className="iraya-images">
           <img src={mainImageUrl} alt={product.name} className="main-image" />
           <div className="thumbnails">
             {/* thumbnails: main_image first, then images array */}
             {product.main_image && (
               <img
                 src={urlFor(product.main_image) || defaultImg}
                 alt={`${product.name} main`}
                 onClick={() => setSelectedImg(urlFor(product.main_image) || defaultImg)}
                 className={mainImageUrl === (urlFor(product.main_image) || defaultImg) ? "active" : ""}
               />
             )}
             {Array.isArray(product.images) && product.images.map((img, i) => {
               const thumb = urlFor(img);
               return (
                 <img
                   key={i}
                   src={thumb || defaultImg}
                   alt={`${product.name} ${i + 1}`}
                   onClick={() => setSelectedImg(thumb || defaultImg)}
                   className={mainImageUrl === (thumb || defaultImg) ? "active" : ""}
                 />
               );
             })}
           </div>
         </div>

         {/* RIGHT: Details */}
         <div className="iraya-details">
           <h1>{product.name}</h1>
           <h2>{product.brandName || "—"}</h2>

           <div className="product-rating-box">
             <span className="rating-stars">⭐ {product.avg_rating ?? "—"}</span>
             <span className="rating-count">({reviews.length} reviews)</span>
           </div>

           <p className="product-stock">
             Stock: <strong>{product.stock_quantity ?? 0}</strong> available
           </p>

           {/* use long_description preferred, fallback to description */}
           <div className="description">
             <h3>Description</h3>
             <p>{longDesc}</p>
           </div>

           <div className="price-block">
             <div className="unit-price">
               {product.sales_price ? (
                 <>
                   <span className="price-sale">{formatPHP(product.sales_price)}</span>
                   <span className="price-regular">{formatPHP(product.regular_price)}</span>
                 </>
               ) : (
                 <span className="price-sale">{formatPHP(product.regular_price)}</span>
               )}
             </div>

             <div className="total-price">
               <label>Total</label>
               <div className="total-amount">{formatPHP(totalPrice)}</div>
             </div>
           </div>

           {/* Quantity controls */}
           <div className="quantity">
             <label>Quantity</label>
             <div className="quantity-controls">
               <button
                 onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                 className="qty-btn"
               >
                 -
               </button>
               <input
                 type="number"
                 className="qty-input"
                 value={quantity}
                 onChange={(e) => {
                   let val = Number(e.target.value);
                   if (val < 1) val = 1;
                   if (val > (product.stock_quantity || 0)) {
                     alert(`Only ${product.stock_quantity} stocks available.`);
                     val = product.stock_quantity || 1;
                   }
                   setQuantity(val);
                 }}
                 onBlur={(e) => {
                   let val = Number(e.target.value);
                   if (!val || val < 1) val = 1;
                   if (val > (product.stock_quantity || 0)) val = product.stock_quantity || val;
                   setQuantity(val);
                 }}
                 min="1"
                 max={product.stock_quantity || 1}
               />
               <button
                 onClick={() => {
                   if ((quantity + 1) > (product.stock_quantity || 0)) {
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
               disabled={!product.stock_quantity || product.stock_quantity <= 0}
               onClick={async () => {
                 try {
                   const userId = localStorage.getItem("user_id");
                   if (!userId) {
                     alert("⚠️ Please log in to add items to your cart.");
                     navigate("/login");
                     return;
                   }

                   if (quantity > product.stock_quantity) {
                     alert(`Only ${product.stock_quantity} stocks available.`);
                     return;
                   }

                   // include quantity only — backend calculates totals server-side.
                   await addToCart(userId, product.id, quantity);
                   alert(`✅ ${quantity} × ${product.name} added to cart — Total: ${formatPHP(totalPrice)}`);
                 } catch (err) {
                   console.error("Add to cart failed:", err);
                   alert(
                     err.response?.data?.error ||
                     `❌ Failed to add to cart: ${err.message}`
                   );
                 }
               }}
               className="add-cart-btn"
             >
               {(!product.stock_quantity || product.stock_quantity <= 0) ? "Out of stock" : "Add to Cart"}
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
                     : review.name
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

     {/* ===== SHOP SECTION ===== */}
     <section className="shop-section">
       <hr className="shop-divider" />
       <div
         className="shop-card-horizontal"
         onClick={handleViewShop}
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
             e.stopPropagation();
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
    </>
  );
}
export default ProductDetail;
