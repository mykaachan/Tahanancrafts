// src/OrderList.js
import React, { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout";
import "./OrderList.css";

// Toggle between local / remote API as needed
//const API_URL = "http://127.0.0.1:8000";
const API_URL = "https://tahanancrafts.onrender.com";

const getImageUrl = (path) => {
  if (!path) return "/images/blankimage.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
};

/* ====== API endpoints (adjust if your backend differs) ====== */
const API = {
  VERIFY_PAYMENT: `${API_URL}/api/products/orders/verify-payment/`,
  TO_SHIPPED: `${API_URL}/api/products/orders/to-shipped/`,
  CANCEL_ORDER: `${API_URL}/api/products/orders/cancel/`,
  CONFIRM_RECEIVED: `${API_URL}/api/products/orders/confirm-received/`,
  REFUND_PROOF: `${API_URL}/api/products/orders/refund/`,
  ARTISAN_ORDERS: (artisanId) => `${API_URL}/api/products/orders/artisan/orders-view/${artisanId}/`,
};

/* ====== Tabs & status filters ====== */
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "requests", label: "Order Requests" },
  { key: "to-ship", label: "To Ship" },
  { key: "to-receive", label: "To Receive" },
  { key: "completed", label: "Completed" },
  { key: "refund", label: "Refund/Cancel" },
];

const statusFilterMap = {
  all: () => true,
  requests: (o) => ["awaiting_verification", "awaiting_seller_verification", "awaiting_payment"].includes(o.status),
  "to-ship": (o) => ["processing", "ready_to_ship"].includes(o.status),
  "to-receive": (o) => ["shipped", "in_transit", "delivered"].includes(o.status),
  completed: (o) => ["to_review", "completed"].includes(o.status),
  refund: (o) => ["cancelled", "refund"].includes(o.status),
};

/* ====== Utils ====== */
const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);
function money(value) {
  if (value === null || value === undefined || value === "") return "₱0.00";
  const n = Number(value);
  if (Number.isNaN(n)) return `₱${value}`;
  return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDateShort(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

/* ====== Main Component ====== */
const OrderList = () => {
  // read artisan id from localStorage by default (you previously set this)
  const artisanIdFromStorage = localStorage.getItem("artisan_id");

  const [artisanId, setArtisanId] = useState(artisanIdFromStorage || null);

  // UI state
  const [activeTab, setActiveTab] = useState("all");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [orders, setOrders] = useState([]); // normalized order list
  const [loading, setLoading] = useState(false);

  // pagination
  const ORDERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalRefundFields, setModalRefundFields] = useState({});


  // modal fields (shipping / refund)
  const [shippingFields, setShippingFields] = useState({});
  const [refundFields, setRefundFields] = useState({});

  // Log mount and artisan id
  useEffect(() => {
    console.log("OrderList mounted, artisanId:", artisanId);
    if (artisanId) fetchOrders(artisanId);
    else {
      // if no artisan id, still attempt to show placeholder or empty list
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisanId]);

  /* ===== fetchOrders ===== */
  async function fetchOrders(aid) {
    setLoading(true);
    try {
      const res = await fetch(API.ARTISAN_ORDERS(aid));
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Failed to fetch orders (${res.status})`);
      }
      const raw = await res.json();

      // Normalize backend payload into fields the UI expects
      const mapped = (Array.isArray(raw) ? raw : []).map((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        const first = items[0] || {};
        const product = first.product || {};
        const quantity = first.quantity || 0;

        return {
          id: o.id,
          status: o.status || "unknown",
          created_at: o.created_at,
          total_items_amount: safe(o.total_items_amount, "0"),
          shipping_fee: safe(o.shipping_fee, "0"),
          grand_total: safe(o.grand_total, "0"),
          payment_method: o.payment_method || "—",
          payment_verified: o.payment_verified || false,
          items,
          first_item: {
            ...first,
            product,
            name: product.name,
            main_image: product.main_image,
            description: product.description,
          },
          delivery: o.delivery || {},
          timeline: o.timeline || [],
          payment_proofs: o.payment_proofs || [],
          raw: o,
        };
      });

      setOrders(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error("fetchOrders error:", err);
      // fallback: leave orders empty
      setOrders([]);
      // do not throw to avoid crashing UI
    } finally {
      setLoading(false);
    }
  }

  /* ===== Filtering & Pagination derived values ===== */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilterMap[activeTab](o))
      .filter((o) => (orderIdFilter ? String(o.id).includes(orderIdFilter) : true));
  }, [orders, activeTab, orderIdFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  // Ensure currentPage within bounds
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Reset page when tab/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, orderIdFilter]);

  /* ===== Modal helpers ===== */
  const openOrderModal = (order) => {
    setModalOrder(order);
    setShippingFields({});
    setRefundFields({});
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalOrder(null);
  };

  const setField = (setter, id, key, value) =>
    setter((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }));
  const setModalField = (setter, id, key, value) => {
    setter((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }));
  };


  /* ===== Action helpers (backend calls) ===== */
  const verifyPayment = async (orderId, action) => {
    try {
      const res = await fetch(API.VERIFY_PAYMENT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, action }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || "Verify failed");
      }
      // optimistic update
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: action === "approve" ? "processing" : "refund" } : o)));
      fetchOrders(artisanId);
      if (modalOrder?.id === orderId) {
        // refresh modal content
        const found = (await findOrder(orderId)) || modalOrder;
        openOrderModal(found);
      }
    } catch (err) {
      console.error(err);
      alert("Verify payment failed: " + (err.message || err));
    }
  };

  const bookCourier = async (orderId) => {
    try {
      const res = await fetch(API.TO_SHIPPED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, action: "lalamove" }),
      });
      if (!res.ok) throw new Error("Book courier failed");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "ready_to_ship" } : o)));
      fetchOrders(artisanId);
      alert("Booking requested. Order marked ready_to_ship.");
    } catch (err) {
      console.error(err);
      alert("Book courier failed: " + (err.message || err));
    }
  };

  const cancelAndRefund = async (orderId, reason = "Seller cancellation") => {
    try {
      const res = await fetch(API.CANCEL_ORDER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, reason }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "refund" } : o)));
      fetchOrders(artisanId);
      alert("Order cancelled and refund initiated.");
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + (err.message || err));
    }
  };

  const confirmReceived = async (orderId, action = "received", reason = null) => {
    try {
      const payload = { order_id: orderId, action };
      if (reason) payload.reason = reason;
      const res = await fetch(API.CONFIRM_RECEIVED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Confirm received failed");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: action === "received" ? "to_review" : "refund" } : o)));
      fetchOrders(artisanId);
      alert("Action submitted.");
    } catch (err) {
      console.error(err);
      alert("Confirm received error: " + (err.message || err));
    }
  };

  const processRefund = async (orderId) => {
    const fields = refundFields[orderId] || {};
    if (!fields.refundAmount || !fields.refundProof) {
      alert("Please provide refund amount and proof.");
      return;
    }
    try {
      const form = new FormData();
      form.append("order_id", orderId);
      form.append("action", "refund");
      form.append("refund_amount", fields.refundAmount);
      form.append("refund_proof", fields.refundProof);

      const res = await fetch(API.REFUND_PROOF, { method: "POST", body: form });
      if (!res.ok) throw new Error("Refund processing failed");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "refund" } : o)));
      fetchOrders(artisanId);
      closeModal();
      alert("Refund processed.");
    } catch (err) {
      console.error(err);
      alert("Process refund failed: " + (err.message || err));
    }
  };

  async function findOrder(orderId) {
    const local = orders.find((o) => o.id === orderId);
    if (local) return local;
    await fetchOrders(artisanId);
    return orders.find((o) => o.id === orderId);
  }

  /* ====== Render helpers (UI) ====== */
  const OrdersTableHeader = () => (
    <div className="orders-list-header">
      <span>Product(s)</span>
      <span>Order ID</span>
      <span>Status</span>
      <span>Orders</span>
      <span>Date</span>
    </div>
  );

  const OrdersTableRow = ({ order }) => {
    const product = order.first_item?.product || {};
    const img = product.main_image ? getImageUrl(product.main_image) : "/images/blankimage.png";
    // map order.status to CSS classes (simple mapping)
    let statusClass = "status-pending";
    if (["processing", "ready_to_ship"].includes(order.status)) statusClass = "status-toship";
    if (["shipped", "in_transit"].includes(order.status)) statusClass = "status-shipping";
    if (["delivered", "to_review", "completed"].includes(order.status)) statusClass = "status-delivered";
    if (["refund", "cancelled"].includes(order.status)) statusClass = "status-refunded";

    return (
      <div
        className="order-row"
        onClick={() => openOrderModal(order)}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? openOrderModal(order) : null)}
      >
        <div className="order-product">
          <img src={img} alt={product.name || "Product"} className="order-product-image" />
          <div className="order-product-details">
            <div className="order-product-name">{product.name || "Unnamed product"}</div>
            <div className="order-product-category">{product.description || "—"}</div>
          </div>
        </div>

        <div className="order-id">#{order.id}</div>

        <div className={`order-status ${statusClass}`}>{(order.status || "").replace(/_/g, " ")}</div>

        <div className="order-orders" style={{ textAlign: "center" }}>
          {order.first_item?.quantity || (order.items?.length ? order.items.length : "—")}
        </div>

        <div className="order-date" style={{ textAlign: "center" }}>{formatDateShort(order.created_at)}</div>
      </div>
    );
  };

  /* ====== Cards/lists per tab (keeps the nice UI card layout you wanted) ====== */
  const RequestsList = () => (
    <div className="orders-list">
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No order requests.</div>
      ) : (
        filteredOrders.map((order) => {
          const product = order.first_item?.product || {};
          const img = product.main_image ? getImageUrl(product.main_image) : "/images/blankimage.png";
          return (
            <div
              className="order-request-card"
              key={order.id}
              onClick={() => openOrderModal(order)}
              style={{ cursor: "pointer", padding: 16, borderBottom: "1px solid #eee" }}
            >
              <div className="order-summary" style={{ display: "flex", gap: 16 }}>
                <img src={img} alt={product.name} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} />
                <div className="order-details" style={{ flex: 1 }}>
                  <div><strong>Product Name:</strong> {product.name}</div>
                  <div><strong>Quantity:</strong> {order.first_item?.quantity || 0}</div>
                  <div><strong>Payment Method:</strong> {order.payment_method || "—"}</div>
                  <div><strong>Shipping Info:</strong> {order.delivery?.tracking_link || "—"}</div>
                </div>

                <div style={{ minWidth: 200, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{money(order.grand_total)}</div>
                  <div style={{ color: "#777", marginTop: 8 }}>{formatDateShort(order.created_at)}</div>
                </div>
              </div>

              <div className="order-actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="approve-btn" onClick={(e) => { e.stopPropagation(); verifyPayment(order.id, "approve"); }}>Approve Order</button>
                <button className="decline-btn" onClick={(e) => { e.stopPropagation(); verifyPayment(order.id, "reject"); }}>Decline / Refund</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const ToShipList = () => (
    <div className="orders-list">
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No orders to ship.</div>
      ) : (
        filteredOrders.map((order) => {
          const product = order.first_item?.product || {};
          const img = product.main_image ? getImageUrl(product.main_image) : "/images/blankimage.png";
          const fields = shippingFields[order.id] || {};
          return (
            <div className="order-toship-card" key={order.id} onClick={() => openOrderModal(order)} style={{ cursor: "pointer", padding: 16, borderBottom: "1px solid #eee" }}>
              <div className="order-summary" style={{ display: "flex", gap: 16 }}>
                <img src={img} alt={product.name} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} />
                <div className="order-details" style={{ flex: 1 }}>
                  <div><strong>Product Name:</strong> {product.name}</div>
                  <div><strong>Quantity:</strong> {order.first_item?.quantity || 0}</div>
                  <div><strong>Date:</strong> {formatDateShort(order.created_at)}</div>
                </div>

                <div style={{ minWidth: 200, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{money(order.grand_total)}</div>
                  <div style={{ color: "#777", marginTop: 8 }}>{order.delivery?.status || "—"}</div>
                </div>
              </div>

              <div className="order-actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="approve-btn" onClick={(e) => { e.stopPropagation(); bookCourier(order.id); }}>Book Courier</button>
                <button className="decline-btn" onClick={(e) => { e.stopPropagation(); cancelAndRefund(order.id); }}>Cancel & Refund</button>
              </div>

              {/* inline shipment fields (optional quick-edit) */}
              <div className="shipment-fields" style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div className="field-row">
                  <label>Tracking Number:</label>
                  <input type="text" value={fields.trackingNumber || ""} onChange={(e) => setField(setShippingFields, order.id, "trackingNumber", e.target.value)} />
                </div>
                <div className="field-row">
                  <label>Courier:</label>
                  <input type="text" value={fields.courier || ""} onChange={(e) => setField(setShippingFields, order.id, "courier", e.target.value)} />
                </div>
                <div className="field-row">
                  <label>Upload Proof of Shipment:</label>
                  <input type="file" accept="image/*" onChange={(e) => setField(setShippingFields, order.id, "shipmentProof", e.target.files[0])} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const ToReceiveList = () => (
    <div className="orders-list">
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No orders to receive.</div>
      ) : (
        filteredOrders.map((order) => {
          const product = order.first_item?.product || {};
          const img = product.main_image ? getImageUrl(product.main_image) : "/images/blankimage.png";
          return (
            <div className="order-receive-card" key={order.id} onClick={() => openOrderModal(order)} style={{ cursor: "pointer", padding: 16, borderBottom: "1px solid #eee" }}>
              <div className="order-summary" style={{ display: "flex", gap: 16 }}>
                <img src={img} alt={product.name} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} />
                <div className="order-details" style={{ flex: 1 }}>
                  <div><strong>Product Name:</strong> {product.name}</div>
                  <div><strong>Quantity:</strong> {order.first_item?.quantity || 0}</div>
                  <div><strong>Status:</strong> {order.status}</div>
                </div>

                <div style={{ minWidth: 200, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{money(order.grand_total)}</div>
                  <div style={{ color: "#777", marginTop: 8 }}>{formatDateShort(order.created_at)}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const CompletedList = () => (
    <div className="orders-list">
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No completed orders.</div>
      ) : (
        filteredOrders.map((order) => {
          const product = order.first_item?.product || {};
          const img = product.main_image ? getImageUrl(product.main_image) : "/images/blankimage.png";
          return (
            <div className="order-delivered-card" key={order.id} onClick={() => openOrderModal(order)} style={{ cursor: "pointer", padding: 16, borderBottom: "1px solid #eee" }}>
              <div className="order-summary" style={{ display: "flex", gap: 16 }}>
                <img src={img} alt={product.name} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} />
                <div className="order-details" style={{ flex: 1 }}>
                  <div><strong>Product Name:</strong> {product.name}</div>
                  <div><strong>Quantity:</strong> {order.first_item?.quantity || 0}</div>
                  <div><strong>Delivered On:</strong> {formatDateShort(order.created_at)}</div>
                </div>

                <div style={{ minWidth: 200, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{money(order.grand_total)}</div>
                </div>
              </div>

              <div className="order-actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="decline-btn" onClick={(e) => { e.stopPropagation(); alert("Report Buyer Issue (UI only)"); }}>Report Buyer Issue</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const RefundList = () => (
    <div className="orders-list">
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No refunds / cancelled orders.</div>
      ) : (
        filteredOrders.map((order) => {
          const fields = refundFields[order.id] || {};
          return (
            <div className="order-refund-card" key={order.id} onClick={() => openOrderModal(order)} style={{ cursor: "pointer", padding: 16, borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div><strong>Order ID:</strong> #{order.id}</div>
                  <div><strong>Status:</strong> {order.status}</div>
                  <div><strong>Requested:</strong> {formatDateShort(order.created_at)}</div>
                </div>

                <div style={{ minWidth: 200, textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{money(order.grand_total)}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="field-row">
                  <label>Refund Amount (₱):</label>
                  <input type="number" value={fields.refundAmount || ""} onChange={(e) => setField(setRefundFields, order.id, "refundAmount", e.target.value)} />
                </div>

                <div className="field-row" style={{ marginTop: 8 }}>
                  <label>Upload Proof:</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => setField(setRefundFields, order.id, "refundProof", e.target.files[0])} />
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button className="approve-btn" onClick={(e) => { e.stopPropagation(); processRefund(order.id); }}>Process Refund</button>
                  <button className="decline-btn" onClick={(e) => { e.stopPropagation(); alert("Cancel refund (UI only)"); }}>Cancel Refund</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  /* ====== JSX ====== */
  return (
    <Layout>
      <div className="order-list-page-container">
        <h1 className="page-title">Product Details</h1>

        <div className="orders-section">
          <h2>Orders List</h2>

          <div className="orders-tabs">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                className={`orders-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="orders-controls">
            <input
              type="text"
              placeholder="Input Order ID"
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
              className="order-id-input"
            />
            <button className="export-btn" onClick={() => alert("Export CSV - implement server export")}>Export</button>
            <button className="export-btn" onClick={() => alert("Export history - implement server export")}>Export History</button>
            <div style={{ marginLeft: "auto", color: "#666" }}>{loading ? "Loading..." : `${filteredOrders.length} orders`}</div>
          </div>

          <div className="orders-list-container">
            {activeTab === "all" && (
              <>
                <OrdersTableHeader />
                <div className="orders-list">
                  {loading ? (
                    <div className="no-orders">Loading...</div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="no-orders">No orders found.</div>
                  ) : (
                    pagedOrders.map((order) => <OrdersTableRow order={order} key={order.id} />)
                  )}
                </div>
              </>
            )}

            {activeTab === "requests" && <RequestsList />}
            {activeTab === "to-ship" && <ToShipList />}
            {activeTab === "to-receive" && <ToReceiveList />}
            {activeTab === "completed" && <CompletedList />}
            {activeTab === "refund" && <RefundList />}
          </div>

          {/* pagination */}
          <div className="orders-pagination">
            <button className={`pagination-btn ${currentPage === 1 ? "" : ""}`} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>← Prev</button>

            {/* show abbreviated window around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
              .map((p) => (
                <button key={p} className={`pagination-btn ${p === currentPage ? "active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ))}

            {totalPages > 6 && <span style={{ padding: "0 8px", color: "#999" }}>…</span>}
            {totalPages > 6 && (
              <button className={`pagination-btn ${totalPages === currentPage ? "active" : ""}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            )}

            <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
            <div style={{ marginLeft: 12, color: "#666" }}>Page {currentPage} of {totalPages}</div>
          </div>
        </div>

        {/* ===== Modal (details) ===== */}
        {modalOpen && modalOrder && (
          <div
            className="modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
            onClick={closeModal}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(900px, 95%)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* ================= HEADER ================= */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: "#4d3c2e" }}>Order #{modalOrder.id}</h2>
                <button
                  onClick={closeModal}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                    color: "#4d3c2e",
                  }}
                >
                  ×
                </button>
              </div>

              {/* ================= CARD 1: ITEMS ================= */}
              <div className="modal-card">
                <h3 className="modal-card-title">Ordered Items</h3>

                {modalOrder.items.map((item, idx) => {
                  const p = item.product || {};
                  const img = p.main_image ? getImageUrl(p.main_image) : "/images/blankimage.png";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: 16,
                        padding: "12px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <img
                        src={img}
                        style={{
                          width: 70,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "#7c6a58" }}>{p.description}</div>
                        <div style={{ marginTop: 4 }}>Qty: {item.quantity}</div>
                      </div>

                      <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {money(item.subtotal)}
                      </div>
                    </div>
                  );
                })}

                <div style={{ textAlign: "right", marginTop: 12 }}>
                  <div>Subtotal: {money(modalOrder.total_items_amount)}</div>
                  <div>Shipping Fee: {money(modalOrder.shipping_fee)}</div>
                  <div
                    style={{
                      marginTop: 6,
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#d97a00",
                    }}
                  >
                    Total: {money(modalOrder.grand_total)}
                  </div>
                </div>
              </div>

              {/* ================= CARD 2: BUYER INFO ================= */}
              <div className="modal-card">
                <h3 className="modal-card-title">Buyer Information</h3>

                <div><strong>Name:</strong> {modalOrder.raw?.buyer?.name || "Not provided"}</div>
                <div style={{ marginTop: 4 }}>
                  <strong>Shipping Address:</strong> {modalOrder.delivery?.address || "No address available"}
                </div>
              </div>

              {/* ================= CARD 3: PAYMENT INFO ================= */}
              <div className="modal-card">
                <h3 className="modal-card-title">Payment Information</h3>

                <div><strong>Payment Method:</strong> {modalOrder.payment_method}</div>

                <div style={{ marginTop: 10, fontWeight: 600 }}>Payment Proofs</div>
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {modalOrder.payment_proofs.length === 0 && (
                    <div style={{ color: "#7c6a58" }}>No payment proofs uploaded.</div>
                  )}

                  {modalOrder.payment_proofs.map((pp) => (
                    <div
                      key={pp.id}
                      style={{
                        border: "1px solid #eee",
                        padding: 8,
                        borderRadius: 8,
                        width: 120,
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={getImageUrl(pp.proof_image)}
                        style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}
                      />
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        <div><strong>{pp.payment_type}</strong></div>
                        <div>{money(pp.amount_paid)}</div>
                        <div>{formatDateShort(pp.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= CARD 4: SHIPPING ================= */}
              <div className="modal-card">
                <h3 className="modal-card-title">Shipping Information</h3>

                {modalOrder.delivery ? (
                  <>
                    <div><strong>Courier:</strong> {modalOrder.delivery.courier || "Not assigned"}</div>
                    <div style={{ marginTop: 4 }}>
                      <strong>Tracking #:</strong> {modalOrder.delivery.tracking_number || "—"}
                    </div>
                  </>
                ) : (
                  <div>No shipping info available yet.</div>
                )}
              </div>

              {/* ================= CARD 5: ORDER TIMELINE ================= */}
              <div className="modal-card">
                <h3 className="modal-card-title">Order Timeline</h3>

                {modalOrder.timeline.length === 0 ? (
                  <div>No recorded events.</div>
                ) : (
                  modalOrder.timeline.map((t) => (
                    <div key={t.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600 }}>{t.status.replace(/_/g, " ")}</div>
                      <div style={{ fontSize: 13 }}>{t.description}</div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>
                        {formatDateShort(t.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ================= CARD 6: ACTION BUTTONS ================= */}
              <div className="modal-card">

                {["awaiting_verification", "awaiting_payment"].includes(modalOrder.status) && (
                  <div className="modal-actions-row">
                    <button className="approve-btn" onClick={() => verifyPayment(modalOrder.id, "approve")}>
                      Approve Payment
                    </button>
                    <button className="decline-btn" onClick={() => verifyPayment(modalOrder.id, "reject")}>
                      Reject & Refund
                    </button>
                  </div>
                )}

                {["processing", "ready_to_ship"].includes(modalOrder.status) && (
                  <div className="modal-actions-row">
                    <button className="approve-btn" onClick={() => bookCourier(modalOrder.id)}>
                      Book Courier
                    </button>
                    <button className="decline-btn" onClick={() => cancelAndRefund(modalOrder.id)}>
                      Cancel Order
                    </button>
                  </div>
                )}


                {["cancelled", "refund"].includes(modalOrder.status) && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <label>Refund Amount (₱)</label>
                      <input
                        type="number"
                        className="modal-input"
                        onChange={(e) => setModalField(setModalRefundFields, modalOrder.id, "refundAmount", e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label>Upload Refund Proof</label>
                      <input
                        type="file"
                        className="modal-input"
                        onChange={(e) => setModalField(setModalRefundFields, modalOrder.id, "refundProof", e.target.files[0])}
                      />
                    </div>

                    <button className="approve-btn" onClick={() => processRefund(modalOrder.id)}>
                      Process Refund
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default OrderList;
