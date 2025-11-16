import React from "react";
import HeaderFooter from "./HeaderFooter";
import "./Checkout.css";
import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems = location.state?.items || [];

  // ----------------------------
  // Address State
  // ----------------------------
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const [showAddressModal, setShowAddressModal] = React.useState(false);

  // ----------------------------
  // Load addresses
  // ----------------------------
  React.useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return navigate("/login");

    fetch(`https://tahanancrafts.onrender.com/api/users/shipping-address/${userId}/`)
      .then(res => res.json())
      .then(data => {
        setAddresses(data);
        const def = data.find(a => a.is_default) || data[0];
        setSelectedAddress(def);
      })
      .catch(err => console.error(err));
  }, []);

  if (selectedItems.length === 0) {
    return <p>No selected items. Go back to cart.</p>;
  }

  // ----------------------------
  // PLACE ORDER
  // ----------------------------
  const placeOrder = async () => {
    const userId = localStorage.getItem("user_id");

    if (!selectedAddress) {
      alert("Select a shipping address first.");
      return;
    }

    const cart_item_ids = selectedItems.map((i) => i.id);

    const res = await fetch(
      "https://tahanancrafts.onrender.com/api/products/product/checkout/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: Number(userId),
          cart_item_ids,
          shipping_address_id: selectedAddress.id
        }),
      }
    );

    const data = await res.json();
    navigate("/order-success", { state: data });
  };

  return (
    <HeaderFooter>
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* Address */}
        <div className="address-bar">
          <div className="address-info">
            <span className="address-icon">📍</span>
            <div>
              {selectedAddress ? (
                <>
                  <p className="address-title">
                    {selectedAddress.barangay}, {selectedAddress.city},{" "}
                    {selectedAddress.province}
                  </p>
                  <p className="address-details">
                    {selectedAddress.full_name} ({selectedAddress.phone}) <br />
                    {selectedAddress.address}
                  </p>
                </>
              ) : (
                <p>No address found. Add one.</p>
              )}
            </div>
          </div>

          <button className="change-btn" onClick={() => setShowAddressModal(true)}>
            Change
          </button>
        </div>

        <div className="checkout-container">
          {/* Items */}
          <div className="checkout-details">
            <h2>Products Ordered</h2>

            <div className="product-header">
              <span>Unit Price</span>
              <span>Quantity</span>
              <span>Item Subtotal</span>
            </div>

            {selectedItems.map((item) => (
              <div className="product-item" key={item.id}>
                <img src={item.img} alt={item.name} className="product-img" />
                <div className="product-details">
                  <p className="product-name">{item.name}</p>
                </div>
                <span className="unit-price">₱{item.unit_price}</span>
                <span className="quantity">{item.qty}</span>
                <span className="subtotal">₱{item.unit_price * item.qty}</span>
              </div>
            ))}

          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <h2>Payment Method</h2>
            <p className="payment-method">Cash on Delivery</p>

            <button className="btn-place-order" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="address-modal-backdrop">
          <div className="address-modal">

            <h2>Select Shipping Address</h2>

            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`address-option ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                onClick={() => setSelectedAddress(addr)}
              >
                <input
                  type="radio"
                  checked={selectedAddress?.id === addr.id}
                  onChange={() => setSelectedAddress(addr)}
                />
                <div>
                  <strong>{addr.full_name}</strong>  
                  <br />
                  {addr.address}, {addr.barangay}, {addr.city}, {addr.province}
                  <br />
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>{addr.phone}</span>
                </div>
              </div>
            ))}

            <button className="add-address-btn" onClick={() => navigate("/add-address")}>
              + Add New Address
            </button>

            <button className="modal-save-btn" onClick={() => setShowAddressModal(false)}>
              Save
            </button>
          </div>
        </div>
      )}

    </HeaderFooter>
  );
}

export default Checkout;
