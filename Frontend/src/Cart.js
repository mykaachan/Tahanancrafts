import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { getCartItems, updateCartItem, removeCartItem } from "./api";
import Footer from "./Footer";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ==========================================================
  // LOAD CART ITEMS
  // ==========================================================
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("Please log in to view your cart.");
        navigate("/login");
        return;
      }

      try {
        const data = await getCartItems(userId);

        // NORMALIZE CART SHAPE CORRECTLY
        const formatted = data.map((cartItem) => {
          const unitPrice = Number(cartItem.product.price);
          const qty = Number(cartItem.quantity);

          return {
            id: cartItem.id,                         // cart row ID
            product_id: cartItem.product.id,
            name: cartItem.product.name,
            desc: cartItem.product.description || "No description available",

            unit_price: unitPrice,                   // per-item price
            qty: qty,
            total: unitPrice * qty,                  // computed total

            img: cartItem.product.main_image
              ? cartItem.product.main_image
              : "https://via.placeholder.com/150?text=No+Image",

            selected: false,
          };
        });

        setItems(formatted);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        alert("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================
  const updateQty = async (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const userId = localStorage.getItem("user_id");
    const newQty = Math.max(1, item.qty + delta);

    try {
      // Send update to backend
      await updateCartItem(id, newQty, userId);

      // Compute new total (unit price stays constant)
      const newTotal = item.unit_price * newQty;

      // Update frontend immediately
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, qty: newQty, total: newTotal } : i
        )
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity.");
    }
  };

  // ==========================================================
  // REMOVE ITEM
  // ==========================================================
  const removeItem = async (id) => {
    const userId = localStorage.getItem("user_id");

    try {
      await removeCartItem(id, userId);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item.");
    }
  };

  // ==========================================================
  // SELECT ITEMS FOR CHECKOUT
  // ==========================================================
  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ==========================================================
  // TOTALS
  // ==========================================================
  const selectedItems = items.filter((item) => item.selected);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);

  if (loading) return <p>Loading cart...</p>;

  return (
    <>
      {/* HEADER */}
      <header className="homepage-header">
        <Logo className="logo-svg homepage-logo" />
        <nav className="nav-links">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/story">Story</Link></li>
            <li><Link to="/profile">Profile</Link></li>
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

      {/* CART CONTENT */}
      <main className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">My Shopping Cart</h1>

          <div className="cart-layout">
            {/* LEFT SIDE */}
            <div className="cart-items">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-box">
                      <div className="item-header">{item.name}</div>

                      <div className="item-body">
                        <input
                          type="checkbox"
                          className="select-item"
                          checked={item.selected}
                          onChange={() => toggleSelect(item.id)}
                        />

                        <img src={item.img} alt={item.desc} className="item-img" />

                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p>{item.desc}</p>
                          <p className="unit-price">Unit Price: ₱{item.unit_price}</p>
                          <p className="total-price">Subtotal: ₱{item.total}</p>
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

            {/* RIGHT SIDE SUMMARY */}
            <div className="cart-summary">
              <hr />
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>
                  Subtotal ({selectedItems.length} items)
                </span>
                <span>₱{subtotal}</span>
              </div>

              <hr />

              <h3 className="total">Total: ₱{subtotal}</h3>

              <button
                className="checkout-btn"
                disabled={subtotal === 0}
                onClick={() =>
                  navigate("/checkout", {
                    state: { items: selectedItems },
                  })
                }
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Cart;