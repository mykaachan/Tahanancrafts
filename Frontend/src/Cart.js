import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";
import { ReactComponent as Logo } from "./Logo.svg";
import { getCartItems, updateCartItem, removeCartItem } from "./api";
function Cart() {
  const [groups, setGroups] = useState([]); // 🟡 groups by artisan
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

        const formatted = data.map((group) => ({
          artisan_id: group.artisan_id,
          artisan_name: group.artisan_name,
          artisan_qr: group.artisan_qr,
          artisan_pickup_lat: group.artisan_pickup_lat,
          artisan_pickup_lng: group.artisan_pickup_lng,
          artisan_pickup_address: group.artisan_pickup_address,
          selected_all: false,
          items: group.items.map((item) => ({
            id: item.id,
            product_id: item.product.id,
            name: item.product.name,
            desc: item.product.description || "No description",
            unit_price: Number(item.product.price),
            qty: Number(item.quantity),
            total: Number(item.total_price),
            img:
              item.product.main_image ||
              "https://via.placeholder.com/150?text=No+Image",
            selected: false,
          })),
        }));

        setGroups(formatted);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        alert("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  // ---------------------------------------------------------
  // UPDATE QUANTITY
  // ---------------------------------------------------------
  const updateQty = async (itemId, delta) => {
    const userId = localStorage.getItem("user_id");

    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (item.id !== itemId) return item;

          const newQty = Math.max(1, item.qty + delta);

          updateCartItem(itemId, newQty, userId).catch(() =>
            alert("Failed to update quantity.")
          );

          return { ...item, qty: newQty, total: newQty * item.unit_price };
        }),
      }))
    );
  };

  // ---------------------------------------------------------
  // REMOVE ITEM
  // ---------------------------------------------------------
  const removeItem = async (id) => {
    const userId = localStorage.getItem("user_id");
    try {
      await removeCartItem(id, userId);
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            items: g.items.filter((item) => item.id !== id),
          }))
          .filter((g) => g.items.length > 0)
      );
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item.");
    }
  };

  // ---------------------------------------------------------
  // SELECT ALL ITEMS OF AN ARTISAN
  // ---------------------------------------------------------
  const toggleSelectGroup = (artisan_id) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.artisan_id === artisan_id) {
          const newVal = !group.selected_all;
          return {
            ...group,
            selected_all: newVal,
            items: group.items.map((item) => ({
              ...item,
              selected: newVal,
            })),
          };
        }
        return group;
      })
    );
  };

  // ---------------------------------------------------------
  // SELECT INDIVIDUAL ITEM
  // ---------------------------------------------------------
  const toggleSelectItem = (artisan_id, item_id) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.artisan_id !== artisan_id) return group;

        const updatedItems = group.items.map((item) =>
          item.id === item_id ? { ...item, selected: !item.selected } : item
        );

        const allSelected = updatedItems.every((i) => i.selected);

        return {
          ...group,
          items: updatedItems,
          selected_all: allSelected,
        };
      })
    );
  };

  // ---------------------------------------------------------
  // COMPUTE SELECTED ITEMS
  // ---------------------------------------------------------
  const selectedGroups = groups.filter((g) =>
    g.items.some((item) => item.selected)
  );

  const selectedArtisanCount = selectedGroups.length;

  const grandSubtotal = selectedGroups.reduce((sum, group) => {
    return (
      sum +
      group.items
        .filter((i) => i.selected)
        .reduce((s, i) => s + i.total, 0)
    );
  }, 0);

  if (loading) return <p>Loading cart...</p>;
  return (
    <>
      {/* CART CONTENT */}
      <main className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">My Shopping Cart</h1>
          <div className="cart-layout">
            {/* CART ITEMS */}
            <div className="cart-items">
              {groups.length === 0 && <p>Your cart is empty.</p>}

              {groups.map((group) => (
                <div key={group.artisan_id} className="cart-group">

                  {/* ⭐ ARTISAN HEADER ⭐ */}
                  <div className="item-header">
                    <input
                      type="checkbox"
                      checked={group.selected_all}
                      onChange={() => toggleSelectGroup(group.artisan_id)}
                      style={{ marginRight: "10px" }}
                    />
                    {group.artisan_name}
                  </div>

                  {/* ITEMS */}
                  {group.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-box">

                        <div className="item-body">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() =>
                              toggleSelectItem(group.artisan_id, item.id)
                            }
                          />

                          <img
                            src={item.img}
                            alt={item.desc}
                            className="item-img"
                          />

                          <div className="item-info">
                            <h3>{item.name}</h3>
                            <p>{item.desc}</p>
                            <p className="unit-price">
                              Unit Price: ₱{item.unit_price}
                            </p>
                            <p className="total-price">
                              Subtotal: ₱{item.total}
                            </p>
                          </div>

                          <div className="item-actions">
                            <p>Quantity: {item.qty}</p>
                            <div className="qty-buttons">
                              <button onClick={() => updateQty(item.id, -1)}>
                                -
                              </button>
                              <button onClick={() => updateQty(item.id, 1)}>
                                +
                              </button>
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
                  ))}
                </div>
              ))}

              <Link to="/products">
                <button className="back-btn">Back to Shop</button>
              </Link>
            </div>
            {/* SUMMARY */}
            <div className="cart-summary">
              <hr />
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Selected items</span>
                <span>₱{grandSubtotal}</span>
              </div>

              {selectedArtisanCount > 1 && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  Please select items from only one artisan.
                </p>
              )}

              <hr />

              <h3 className="total">Total: ₱{grandSubtotal}</h3>

              <button
                className="checkout-btn"
                disabled={selectedArtisanCount !== 1}
                onClick={() => {
                  const selectedGroup = selectedGroups[0];
                  const cart_item_ids = selectedGroup.items
                    .filter((i) => i.selected)
                    .map((i) => i.id);

                  const selectedItems = selectedGroup.items
                    .filter((i) => i.selected)
                    .map((i) => ({
                      id: i.id,
                      product_id: i.product_id,
                      product_name: i.name,
                      product_desc: i.desc,
                      quantity: i.qty,
                      unit_price: i.unit_price,
                      total_price: i.total,
                      main_image: i.img,
                      artisan_id: selectedGroup.artisan_id,
                      artisan_name: selectedGroup.artisan_name,
                      artisan_qr: selectedGroup.artisan_qr,
                    }));

                  navigate("/checkout", {
                    state: {
                      cart_item_ids,
                      items_frontend: selectedItems,
                      artisan_id: selectedGroup.artisan_id,

                      artisan_pickup_lat: selectedGroup.artisan_pickup_lat,
                      artisan_pickup_lng: selectedGroup.artisan_pickup_lng,
                      artisan_pickup_address: selectedGroup.artisan_pickup_address,
                    },
                  });

                }}
              >
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
