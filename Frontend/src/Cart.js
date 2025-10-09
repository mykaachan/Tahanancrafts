import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { ReactComponent as Logo } from "./Logo.svg";
import {
  getCartItems,
  updateCartItem,
  removeCartItem,
} from "./api"; // ✅ make sure path is correct

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user's cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("Please log in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const data = await getCartItems(userId);
        const formatted = data.map((cartItem) => ({
          id: cartItem.id,
          name: cartItem.product.name,
          desc: cartItem.product.description || "No description available",
          price: cartItem.product.price,
          qty: cartItem.quantity,
          img: cartItem.product.main_image
            ? cartItem.product.main_image
            : "https://via.placeholder.com/150?text=No+Image",
          selected: false,
        }));
        setItems(formatted);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        alert("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // ✅ Update quantity (sync backend)
  const updateQty = async (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.qty + delta);
    try {
      await updateCartItem(id, newQty);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i))
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity.");
    }
  };

  // ✅ Remove cart item (sync backend)
  const removeItem = async (id) => {
    try {
      await removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item from cart.");
    }
  };

  // ✅ Toggle selection
  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✅ Calculate totals
  const subtotal = items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 58 : 0;
  const total = subtotal + shipping;

  if (loading) return <p>Loading cart...</p>;

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li>
              <Link to="/homepage" style={{ textDecoration: "none", color: "inherit" }}>
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
          <Link to="/cart">
            <button className="cart-btn">CART 🛒</button>
          </Link>
        </div>
      </header>

      {/* ===== CART CONTENT ===== */}
      <main className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">My Shopping Cart</h1>
          <div className="cart-layout">
            {/* LEFT SIDE - ITEMS */}
            <div className="cart-items">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-box">
                      <div className="item-header">{item.name}</div>
                      <div className="item-body">
                        {/* Selection checkbox */}
                        <input
                          type="checkbox"
                          className="select-item"
                          checked={item.selected}
                          onChange={() => toggleSelect(item.id)}
                        />

                        <img src={item.img} alt={item.desc} />
                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p>{item.desc}</p>
                          <p className="price">₱{item.price}</p>
                        </div>
                        <div className="item-actions">
                          <p>Quantity: {item.qty}</p>
                          <div className="qty-buttons">
                            <button onClick={() => updateQty(item.id, -1)}>-</button>
                            <button onClick={() => updateQty(item.id, 1)}>+</button>
                          </div>
                          <span className="remove" onClick={() => removeItem(item.id)}>
                            Remove
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Your cart is empty.</p>
              )}

              <Link to="/products">
                <button className="back-btn">Back to Shop</button>
              </Link>
            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <div className="cart-summary">
              <p className="location">📍 Laurel, Taysan, Batangas</p>
              <hr />
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({items.filter((i) => i.selected).length} items)</span>
                <span>₱{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Fee</span>
                <span>₱{shipping}</span>
              </div>
              <hr />
              <h3 className="total">Total: ₱{total}</h3>
              <button className="checkout-btn" disabled={subtotal === 0}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Cart;
