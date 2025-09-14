import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { ReactComponent as Logo } from "./Logo.svg";
import balisong1 from "./images/balisong1.png";
import bag from "./images/bag.png";
import basket from "./images/basket1.png";
import mat from "./images/mat.png";
import barong from "./images/barong1.png";
import bag1 from "./images/bag1.png";
import apron from "./images/apron.png";
import hat from "./images/hat.png";

// Images
import basketRed from "./images/basketr.png";
import basketYellow from "./images/baskety.png";

function Cart() {
  // ✅ Cart state with "selected"
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Iraya Basket Lipa",
      desc: "Red Woven Tray Basket",
      price: 500,
      qty: 1,
      img: basketRed,
      selected: false,
    },
    {
      id: 2,
      name: "Iraya Basket Lipa",
      desc: "Yellow Woven Tray Basket",
      price: 500,
      qty: 1,
      img: basketYellow,
      selected: false,
    },
  ]);

  // ✅ Update quantity
  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  // ✅ Remove item
  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Toggle selection
  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✅ Totals (only selected items count)
  const subtotal = items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 58 : 0;
  const total = subtotal + shipping;

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
            <li>Profile</li>
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
                        {/* ✅ Selection checkbox */}
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
                          <span
                            className="remove"
                            onClick={() => removeItem(item.id)}
                          >
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

              {/* Back to shop */}
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

      {/* ===== YOU MAY ALSO LIKE ===== */}
<section className="related-section">
  <h2 className="related-title">You may also like</h2>
  <div className="related-grid">
    <div className="related-card">
      <img src={balisong1} alt="Balisong" />
      <h4>Kalis Taal</h4>
      <p>Butterfly knife (Balisong)</p>
      <span className="price">₱349</span>
    </div>

    <div className="related-card">
      <img src={bag} alt="Weaved Bag" />
      <h4>Habing Ibaan</h4>
      <p>Weaved Bag</p>
      <span className="price">₱1,200</span>
    </div>

    <div className="related-card">
      <img src={basket} alt="Basket" />
      <h4>Iraya Basket Lipa</h4>
      <p>Colored Wooven Tray Basket</p>
      <span className="price">₱500</span>
    </div>

    <div className="related-card">
      <img src={mat} alt="Mat" />
      <h4>Burdang Taal Lace Medallions</h4>
      <p>Table Runner</p>
      <span className="price">₱149</span>
    </div>

    <div className="related-card">
      <img src={barong} alt="Barong Tagalog" />
      <h4>Piña Ginoo</h4>
      <p>Barong Tagalog</p>
      <span className="price">₱1,199</span>
    </div>

    <div className="related-card">
      <img src={bag1} alt="Sling Bag" />
      <h4>Habing Ibaan</h4>
      <p>Weaved Sling Bag</p>
      <span className="price">₱250</span>
    </div>

    <div className="related-card">
      <img src={apron} alt="Apron" />
      <h4>Habing Ibaan</h4>
      <p>Weaved Apron</p>
      <span className="price">₱350</span>
    </div>

    <div className="related-card">
      <img src={hat} alt="Hat" />
      <h4>Habing Ibaan</h4>
      <p>Bucket Hat</p>
      <span className="price">₱500</span>
    </div>
  </div>
</section>
    

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-left">
          <h2>
            Join us, <br /> artisans!
          </h2>
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

export default Cart;
