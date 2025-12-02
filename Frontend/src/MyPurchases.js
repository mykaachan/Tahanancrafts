import React, { useEffect, useState } from "react";
import HeaderFooter from "./HeaderFooter";
import SidebarProfile from "./components/SidebarProfile";
import "./Profile.css";
import { useLocation } from "react-router-dom";

function MyPurchases() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get("tab") || "all";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showReview, setShowReview] = useState(false);
  const [showToPayModal, setShowToPayModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for details modal
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPaymentType, setProofPaymentType] = useState("downpayment"); // default
  const [error, setError] = useState(null);

  const API_URL = "https://tahanancrafts.onrender.com"// "http://localhost:8000";

  useEffect(() => {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    setOrders([]);
    setLoading(false);
    return;
  }

  async function loadOrders() {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products/orders/my-orders/?user_id=${userId}`
      );
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  loadOrders();
}, []);


  // Helper: get auth headers if token present
  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // Fetch orders for user
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        // if no user provided, fallback to API without user_id? backend probably needs it.
        throw new Error("No user_id in localStorage. Please log in.");
      }

      const url = `${API_URL}/api/products/orders/my-orders/?user_id=${userId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (res.status === 400) {
        const txt = await res.text();
        throw new Error(`Bad Request: ${txt}`);
      }

      if (res.status === 404) {
        throw new Error("Orders not found");
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch orders");
      }

      const data = await res.json();

      // Expecting list of orders; adapt mapping if API has different shape.
      // We'll keep the same minimal fields used by the UI.
    const mapped = (data || []).map((o) => {
      const firstItem = o.items?.[0];
      const product = firstItem?.product;
      const artisan = product?.artisan;

      return {
        id: o.id,
        title: product?.name || `Order #${o.id}`,
        subtitle: product?.description || "",
        price: firstItem ? Number(firstItem.price) : 0,
        img: product?.main_image || "https://via.placeholder.com/120",

        // 🔥 NEW — Include artisan details
        artisan: artisan
          ? {
              id: artisan.id,
              name: artisan.name,
              gcash_qr: artisan.gcash_qr,
            }
          : null,

        status: mapBackendStatusToTab(o.status),
        quantity: firstItem?.quantity || 1,
        order_number: o.order_number || `TC-${o.id}`,
        date_ordered: o.created_at,
        payment_method: o.payment_method,
        payment_status: o.payment_verified ? "Paid" : "Pending",
        shipping_fee: o.shipping_fee || 0,
        discount: o.discount || 0,
        subtotal: o.total_items_amount || 0,
        total: o.grand_total || 0,
        delivery: o.delivery || null,
        raw: o,
      };
    });


      setOrders(mapped);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper to map backend status to the simplified tab names we use
  const mapBackendStatusToTab = (status) => {
    if (!status) return "all";
    const s = status.toLowerCase();
    if (["pending", "awaiting_downpayment"].includes(s)) return "to-pay";
    if (["processing", "ready_to_ship"].includes(s)) return "to-ship";
    if (["shipped"].includes(s)) return "to-receive";
    if (["delivered"].includes(s)) return "to-review";
    if (["cancelled"].includes(s)) return "completed"; // show canceled in completed for now
    if (["delivered", "completed"].includes(s)) return "completed";
    return "all";
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rerender filtered orders
  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  // Cancel Order API call
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order? This action may not be reversible.")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/orders/cancel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to cancel order");
      }
      alert("Order cancelled.");
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("cancelOrder error:", err);
      alert("Cancel failed: " + (err.message || err));
    }
  };

  // Confirm Received API call
  const confirmReceived = async (orderId) => {
    if (!window.confirm("Mark order as received?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/orders/confirm-received/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to confirm received");
      }
      alert("Order confirmed as received. Thank you!");
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("confirmReceived error:", err);
      alert("Confirm received failed: " + (err.message || err));
    }
  };

  // Upload payment proof
  const uploadPaymentProof = async (order) => {
    if (!proofFile) {
      alert("Please select an image to upload.");
      return;
    }
    setUploadingProof(true);
    try {
      const form = new FormData();
      form.append("order_id", order.id);
      form.append("payment_type", proofPaymentType);
      form.append("proof_image", proofFile);

      const res = await fetch(`${API_URL}/api/products/orders/payment/upload-proof/`, {
        method: "POST",
        headers: {
          // DO NOT set Content-Type with FormData
          ...getAuthHeaders(),
        },
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload proof failed");
      }

      const data = await res.json();
      alert("Payment proof uploaded. Seller will verify shortly.");
      setProofFile(null);
      setShowToPayModal(false);
      fetchOrders();
    } catch (err) {
      console.error("uploadPaymentProof error:", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploadingProof(false);
    }
  };

  // Render status text (kept from your original file style)
  const renderStatusText = (status) => {
    switch (status) {
      case "to-pay":
        return (
          <>
            Awaiting Payment | <strong>TO PAY</strong>
          </>
        );
      case "to-ship":
        return (
          <>
            Seller will ship soon | <strong>TO SHIP</strong>
          </>
        );
      case "to-receive":
        return (
          <>
            Your parcel is on the way | <strong>TO RECEIVE</strong>
          </>
        );
      case "to-review":
        return (
          <>
            Delivered | <strong>TO REVIEW</strong>
          </>
        );
      case "completed":
      default:
        return (
          <>
            Parcel has been delivered | <strong>COMPLETED</strong>
          </>
        );
    }
  };

  // Buttons based on status (keeps original look & actions)
  const renderButtonsForStatus = (status, order) => {
    switch (status) {
      case "to-pay":
        return (
          <>
            <button
              className="btn-buy"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(order);
                setShowToPayModal(true);
              }}
            >
              Upload Payment Proof
            </button>
            <button
              className="btn-cancel"
              onClick={async (e) => {
                e.stopPropagation();
                await cancelOrder(order.id);
              }}
            >
              Cancel
            </button>
          </>
        );

      case "to-ship":
        return (
          <>
            <button className="btn-contact" onClick={(e) => e.stopPropagation()}>
              Message
            </button>
          </>
        );

      case "to-receive":
        return (
          <>
            <button
              className="btn-buy"
              onClick={async (e) => {
                e.stopPropagation();
                // call confirm received
                await confirmReceived(order.id);
              }}
            >
              Confirm Received
            </button>
            <button className="btn-contact" onClick={(e) => e.stopPropagation()}>
              Message
            </button>
          </>
        );

      case "to-review":
        return (
          <>
            <button
              className="btn-buy"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(order);
                setShowReview(true);
              }}
            >
              Write a Review
            </button>
            <button className="btn-contact" onClick={(e) => e.stopPropagation()}>
              Message
            </button>
          </>
        );

      default:
        return (
          <>
            <button
              className="btn-buy"
              onClick={(e) => {
                e.stopPropagation();
                // buy again functionality can redirect to shop or product page
                if (order.raw?.items && order.raw.items.length > 0) {
                  const pid = order.raw.items[0].product?.id;
                  if (pid) window.location.href = `/product/${pid}`;
                }
              }}
            >
              Buy Again
            </button>
            <button className="btn-contact" onClick={(e) => e.stopPropagation()}>
              Message
            </button>
          </>
        );
    }
  };

  return (
    <HeaderFooter>
      <div className="profile-page">
        <SidebarProfile />

        <main className="profile-content">
          <h2>My Purchases</h2>
          <p className="subtitle">Track your order status here</p>

          {/* TABS */}
          <div className="purchases-tabs">
            {[
              "all",
              "to-pay",
              "to-ship",
              "to-receive",
              "to-review",
              "completed",
            ].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab);
                  window.history.replaceState(null, "", `/my-purchases?tab=${tab}`);
                }}
              >
                {tab === "all"
                  ? "All"
                  : tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* MAIN AREA */}
          <div className="purchase-box">
            <div style={{ marginBottom: 12 }}>
              {loading && <div>Loading orders...</div>}
              {error && <div style={{ color: "crimson" }}>{error}</div>}
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 && !loading ? (
                <p>No orders yet.</p>
              ) : (
                filteredOrders.map((order) => (
                  <div className="order-card" key={order.id}>
                    {/* HEADER */}
                    <div className="order-header">
                      <h3>{order.title}</h3>
                      <p style={{ fontSize: "13px", opacity: 0.7 }}>
                        By {order.artisan?.name}
                      </p>
                      <div className="order-actions">
                        <button className="btn-small">View Shop</button>
                      </div>

                      <span className="order-status">{renderStatusText(order.status)}</span>
                    </div>

                    {/* BODY */}
                    <div
                      className="order-body"
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={order.img} alt="Product" className="order-img" />
                      <div className="order-info">
                        <h4 className="order-link">{order.title}</h4>
                        <p>{order.subtitle}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Price: ₱{order.price}</p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="order-footer">
                      <p className="order-total">
                        Order Total: <strong>₱{order.total}</strong>
                      </p>

                      <div className="order-buttons">
                        {renderButtonsForStatus(order.status, order)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
              <div className="review-modal-overlay">
                <div
                  className="review-modal"
                  style={{
                    width: "900px",
                    maxWidth: "95%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    padding: "25px",
                    borderRadius: "12px",
                    background: "#FAF6F0",
                    color: "#3C2F2F",
                  }}
                >
                  <h2 style={{ marginBottom: "20px" }}>Order Details</h2>

                  {/* SELLER HEADER */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5DED3",
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "17px" }}>
                      {selectedOrder.title} — {selectedOrder.artisan?.name || "Artisan Shop"}
                    </div>


                    <button
                      style={{
                        background: "#8B5E3C",
                        color: "#fff",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // Chat: navigate to chat / message UI (placeholder)
                        alert("Open chat with artisan (not implemented).");
                      }}
                    >
                      Chat with Artisan
                    </button>
                  </div>

                  {/* DELIVERY BAR (Only for certain statuses) */}
                  {["to-receive", "to-review", "completed"].includes(
                    selectedOrder.status
                  ) && selectedOrder.delivery && (
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5DED3",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ fontSize: "16px" }}>
                          <strong>{selectedOrder.delivery?.courier || "Courier"}</strong> —{" "}
                          {selectedOrder.delivery?.tracking_number || "No tracking"}
                        </div>

                        <button
                          style={{
                            background: "#C9A27A",
                            padding: "8px 15px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const link = selectedOrder.delivery?.tracking_link;
                            if (link) window.open(link, "_blank");
                            else alert("No tracking link available.");
                          }}
                        >
                          Track Package
                        </button>
                      </div>

                      <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>
                        {selectedOrder.status === "completed"
                          ? "Order has been received. Thank you!"
                          : "Your package is currently in transit."}
                      </p>
                    </div>
                  )}

                  {/* PAYMENT QR (TO PAY ONLY) */}
                  {selectedOrder.status === "to-pay" && (
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5DED3",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <h3 style={{ marginBottom: "10px" }}>Scan to Pay</h3>

                      <img
                        src={
                          selectedOrder.artisan?.gcash_qr
                            ? `${process.env.REACT_APP_API_URL}${selectedOrder.artisan.gcash_qr}`
                            : "https://via.placeholder.com/150?text=QR+Code"
                        }
                        alt="GCash QR"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                        }}
                      />


                      {/* Upload Screenshot for payment proof */}
                      <div style={{ marginTop: 12 }}>
                        <label
                          className="image-upload-label"
                          style={{
                            display: "block",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #8B5E3C",
                            textAlign: "center",
                            cursor: "pointer",
                            color: "#8B5E3C",
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setProofFile(e.target.files[0]);
                              }
                            }}
                            style={{ display: "block", marginTop: 8 }}
                          />
                          <div style={{ marginTop: 8 }}>
                            <label>
                              Payment Type:{" "}
                              <select
                                value={proofPaymentType}
                                onChange={(e) => setProofPaymentType(e.target.value)}
                              >
                                <option value="Shipping fee">Shipping Fee</option>
                                <option value="partial payment">Partial Payment</option>
                                <option value="fullpayment">Full Payment</option>
                              </select>
                            </label>
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <button
                              onClick={() => uploadPaymentProof(selectedOrder)}
                              disabled={uploadingProof}
                              style={{
                                padding: "8px 14px",
                                borderRadius: 8,
                                background: "#8B5E3C",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {uploadingProof ? "Uploading..." : "Submit Proof"}
                            </button>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ITEMS LIST */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5DED3",
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "25px",
                    }}
                  >
                    {/* Items from raw payload for accuracy */}
                    {(selectedOrder.raw?.items || []).map((it) => (
                      <div
                        key={it.id || `${it.product?.id}-${Math.random()}`}
                        style={{
                          display: "flex",
                          gap: "15px",
                          paddingBottom: "15px",
                          borderBottom: "1px solid #EFE7DD",
                          marginBottom: "15px",
                        }}
                      >
                        <img
                          src={
                            getFriendlyImage(it.product) || selectedOrder.img || "https://via.placeholder.com/95"
                          }
                          alt=""
                          style={{ width: 95, height: 95, borderRadius: "8px", objectFit: "cover" }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: "600", marginBottom: "5px" }}>
                            {it.product?.name || selectedOrder.title}
                          </p>
                          <p style={{ fontSize: "13px", opacity: 0.8 }}>
                            {it.product?.description || selectedOrder.subtitle}
                          </p>
                          <p style={{ marginTop: "8px" }}>Qty: {it.quantity}</p>
                        </div>

                        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <p style={{ fontWeight: "600" }}>₱{it.price}</p>
                          <p style={{ fontSize: 12, opacity: 0.8 }}>
                            Subtotal: ₱{(Number(it.price) * Number(it.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* ORDER TOTAL */}
                    <div style={{ textAlign: "right" }}>
                      <p>Subtotal: ₱{selectedOrder.subtotal}</p>
                      <p>Shipping Fee: ₱{selectedOrder.shipping_fee}</p>
                      <p>Discount: -₱{selectedOrder.discount}</p>

                      <p
                        style={{
                          marginTop: "8px",
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#8B5E3C",
                        }}
                      >
                        Total: ₱{selectedOrder.total}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM GRID */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr",
                      gap: "20px",
                    }}
                  >
                    {/* TIMELINE */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5DED3",
                        padding: "15px",
                        borderRadius: "10px",
                      }}
                    >
                      <h3 style={{ marginBottom: "10px" }}>Order Timeline</h3>

                      {(selectedOrder.raw?.timeline || []).length === 0 ? (
                        <>
                          <p>Placed on {formatDate(selectedOrder.date_ordered)}</p>
                          <p>Paid on —</p>
                          <p>Shipped —</p>
                          <p>Delivered —</p>
                          <p>Completed —</p>
                        </>
                      ) : (
                        (selectedOrder.raw.timeline || []).map((t) => (
                          <div key={t.id || t.created_at} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 600 }}>{t.status}</div>
                            {t.description && <div style={{ fontSize: 13 }}>{t.description}</div>}
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(t.created_at)}</div>
                          </div>
                        ))
                      )}

                      <p style={{ marginTop: "10px" }}>
                        Payment Method: <strong>{selectedOrder.payment_method}</strong>
                      </p>
                    </div>

                    {/* TOTAL SUMMARY */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5DED3",
                        padding: "15px",
                        borderRadius: "10px",
                      }}
                    >
                      <h3>Total Summary</h3>

                      <p>
                        <span>Subtotal</span>
                        <span style={{ float: "right" }}>₱{selectedOrder.subtotal}</span>
                      </p>
                      <p>
                        <span>Shipping Fee</span>
                        <span style={{ float: "right" }}>₱{selectedOrder.shipping_fee}</span>
                      </p>
                      <p>
                        <span>Discount</span>
                        <span style={{ float: "right" }}>-₱{selectedOrder.discount}</span>
                      </p>

                      <hr style={{ borderColor: "#E5DED3", margin: "12px 0" }} />

                      <p
                        style={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          color: "#8B5E3C",
                        }}
                      >
                        Total
                        <span style={{ float: "right" }}>₱{selectedOrder.total}</span>
                      </p>
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "25px",
                      gap: "15px",
                    }}
                  >
                    <button
                      className="btn-cancel"
                      onClick={() => setSelectedOrder(null)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "#E5DED3",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>

                    {/* TO PAY – Upload Payment Proof */}
                    {selectedOrder.status === "to-pay" && (
                      <button
                        className="btn-buy"
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#8B5E3C",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setShowToPayModal(true);
                        }}
                      >
                        Upload Payment Proof
                      </button>
                    )}

                    {/* MESSAGE */}
                    {["to-ship", "to-review", "completed", "to-receive"].includes(
                      selectedOrder.status
                    ) && (
                      <button
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#8B5E3C",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => alert("Open message to artisan (not implemented)")}
                      >
                        Message Artisan
                      </button>
                    )}

                    {/* WRITE REVIEW */}
                    {selectedOrder.status === "to-review" && (
                      <button
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#C9A27A",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowReview(true)}
                      >
                        Write a Review
                      </button>
                    )}

                    {/* BUY AGAIN */}
                    {selectedOrder.status === "completed" && (
                      <button
                        className="btn-buy"
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#8B5E3C",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          // redirect to product page if raw item exists
                          const pid =
                            selectedOrder.raw?.items &&
                            selectedOrder.raw.items.length > 0 &&
                            selectedOrder.raw.items[0].product?.id;
                          if (pid) window.location.href = `/product/${pid}`;
                        }}
                      >
                        Buy Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REVIEW MODAL */}
            {showReview && (
              <div className="review-modal-overlay">
                <div
                  className="review-modal"
                  style={{ width: "500px", maxWidth: "95%" }}
                >
                  <h2>Write a Review</h2>

                  <div className="stars" style={{ fontSize: 22, margin: "8px 0" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="star" style={{ marginRight: 6 }}>
                        ★
                      </span>
                    ))}
                  </div>

                  <textarea
                    className="review-textarea"
                    placeholder="Share your thoughts about the product..."
                    style={{ width: "100%", minHeight: 100 }}
                  ></textarea>

                  <div style={{ marginTop: 10, marginBottom: 12 }}>
                    <label className="checkbox-label">
                      <input type="checkbox" /> Post review anonymously
                    </label>
                  </div>

                  <div className="modal-buttons">
                    <button className="btn-cancel" onClick={() => setShowReview(false)}>
                      Cancel
                    </button>
                    <button className="btn-submit" onClick={() => {
                      alert("Submit review (not implemented)");
                      setShowReview(false);
                    }}>Submit Review</button>
                  </div>
                </div>
              </div>
            )}

            {/* TO PAY MODAL (standalone upload as alternate path) */}
            {showToPayModal && selectedOrder && (
              <div className="review-modal-overlay">
                <div className="review-modal" style={{ width: "500px", maxWidth: "95%" }}>
                  <h2>Payment Details</h2>

                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
                      <p><strong>Product:</strong> {selectedOrder.title}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                      <p><strong>Price:</strong> ₱{selectedOrder.price}</p>
                      <p><strong>Shipping Fee:</strong> ₱{selectedOrder.shipping_fee}</p>
                      <p><strong>Preorder:</strong> {selectedOrder.raw?.downpayment_required ? "Yes" : "No"}</p>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p><strong>Downpayment:</strong> ₱{selectedOrder.raw?.downpayment_amount || 0}</p>
                      <p><strong>Total to Pay Now:</strong> ₱{selectedOrder.raw?.downpayment_amount || selectedOrder.total}</p>
                      <p><strong>COD Balance:</strong> ₱{selectedOrder.raw?.cod_payment || 0}</p>
                      <p><strong>Created At:</strong> {formatDate(selectedOrder.date_ordered)}</p>

                      <p><strong>Scan to Pay:</strong></p>
                      <img
                        src="https://via.placeholder.com/150?text=QR+Code"
                        alt="QR Code"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                        }}
                      />

                      <div style={{ marginTop: 10 }}>
                        <label className="image-upload-label">
                          Upload Screenshot
                          <input type="file" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setProofFile(e.target.files[0]);
                            }
                          }} />
                        </label>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <label>
                          Payment Type:
                          <select value={proofPaymentType} onChange={(e) => setProofPaymentType(e.target.value)} style={{ marginLeft: 8 }}>
                            <option value="downpayment">Downpayment</option>
                            <option value="fullpayment">Full Payment</option>
                            <option value="cod_balance">COD Balance</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="modal-buttons" style={{ marginTop: 14 }}>
                    <button
                      className="btn-cancel"
                      onClick={() => setShowToPayModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn-submit" onClick={() => uploadPaymentProof(selectedOrder)}>
                      {uploadingProof ? "Uploading..." : "Submit Proof"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </HeaderFooter>
  );
}

/* ---------- small helpers ---------- */
function formatDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}
function getFriendlyImage(product) {
  if (!product) return null;
  if (product.main_image) return product.main_image;
  if (product.images && product.images.length > 0) return product.images[0].image;
  return null;
}

export default MyPurchases;
