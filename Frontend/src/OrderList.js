import React, { useState } from 'react';
import Layout from './components/Layout';
import './OrderList.css';
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'requests', label: 'Order Requests' },
  { key: 'to-ship', label: 'To Ship' },
  { key: 'to-receive', label: 'To Receive' },     // 🔹 was "Shipping"
  { key: 'completed', label: 'Completed' },       // 🔹 was "Delivered"
  { key: 'refund', label: 'Refund/Cancel' }
];
const placeholderOrders = [
  {
    id: '123445',
    productImage: '/images/blankimage.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Woven Bag',
    status: 'To Ship',
    orders: 1,
    date: '1 May 2025',
  },
  {
    id: '128445',
    productImage: '/images/blankimage.png',
    productName: 'Preorder Example Item',
    productCategory: 'Coin Purse',
    status: 'Pending',
    orders: 2,
    date: '1 May 2025',
    isPreorder: true,
    price: 1000,
  },
  {
    id: '129445',
    productImage: '/images/blankimage.png',
    productName: 'Shipping Fee Paid Item',
    productCategory: 'Woven Bag',
    status: 'Pending',
    orders: 1,
    date: '1 May 2025',
    shippingFeePaid: 150,
  },
];
const statusFilterMap = {
  all: () => true,
  requests: order => order.status === 'Pending',
  'to-ship': order => order.status === 'To Ship',
  'to-receive': order => order.status === 'To Receive', // 🔹 NEW
  completed: order => order.status === 'Completed',       // 🔹 NEW
  refund: order => order.status === 'Refunded' || order.status === 'Cancelled',
};

const STATUS_TRANSITIONS = {
  Pending: ['To Ship', 'Cancelled'],
  'To Ship': ['Shipping', 'Cancelled'],
  Shipping: ['Delivered'],
  Delivered: ['Refunded'],
};
const OrderList = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [orders, setOrders] = useState(placeholderOrders);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [preorderFields, setPreorderFields] = useState({});
  const [shippingFields, setShippingFields] = useState({});
  const filteredOrders = orders.filter(order => {
    const statusFilter = statusFilterMap[activeTab];
    return statusFilter(order) && (orderIdFilter === '' || order.id.includes(orderIdFilter));
  });
  const handleStatusClick = (orderId) => setEditingStatusId(orderId);
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    setEditingStatusId(null);
  };
  const handlePreorderFieldChange = (orderId, field, value) => {
    setPreorderFields(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }));
  };
  const confirmPreorder = (order) => alert(`Preorder ${order.id} confirmed!`);
  const rejectPreorder = (order) => alert(`Preorder ${order.id} rejected!`);
  const handleShippingFieldChange = (orderId, field, value) => {
    setShippingFields(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }));
  };
  const acceptShippingOrder = (order) => alert(`Order ${order.id} accepted!`);
  const refundBuyer = (order) => {
    const reason = shippingFields[order.id]?.refundReason;
    if (!reason) {
      alert('Please select a refund reason.');
      return;
    }
    alert(`Order ${order.id} refunded. Reason: ${reason}`);
  };
  return (
    <Layout>
      <div className="order-list-page-container">
        <h1 className="page-title">Product Details</h1>
        <div className="orders-section">
          <h2>Orders List</h2>
          {/* Tabs */}
          <div className="orders-tabs">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                className={`orders-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Controls */}
          <div className="orders-controls">
            <input
              type="text"
              placeholder="Input Order ID"
              value={orderIdFilter}
              onChange={e => setOrderIdFilter(e.target.value)}
              className="order-id-input"
            />
            <button className="export-btn">Export</button>
            <button className="export-btn">Export History</button>
          </div>
          {/* Orders List */}
          <div className="orders-list-container">
            {/* NORMAL TABS (ALSO ADD "TO SHIP" HERE) */}
           {activeTab !== 'requests' &&
            activeTab !== 'to-ship' &&
            activeTab !== 'to-receive' &&
            activeTab !== 'completed' &&
            activeTab !== 'refund' && (

              <>
                <div className="orders-list-header">
                  <span>Products(s)</span>
                  <span>Order ID</span>
                  <span>Status</span>
                  <span>Orders</span>
                  <span>Date</span>
                </div>
                <div className="orders-list">
                  {filteredOrders.length === 0 ? (
                    <div className="no-orders">No orders found.</div>
                  ) : filteredOrders.map(order => (
                    <div className="order-row" key={order.id}>
                      <div className="order-product">
                        <img src={order.productImage} alt={order.productName} className="order-product-image" />
                        <div className="order-product-details">
                          <div className="order-product-name">{order.productName}</div>
                          <div className="order-product-category">{order.productCategory}</div>
                        </div>
                      </div>
                      <div className="order-id">#{order.id}</div>
                      <div
                        className={`order-status status-${order.status.replace(/\s+/g, '').toLowerCase()}`}
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => handleStatusClick(order.id)}
                      >
                        {order.status}
                        {editingStatusId === order.id && STATUS_TRANSITIONS[order.status] && (
                          <div className="status-dropdown">
                            {STATUS_TRANSITIONS[order.status].map(nextStatus => (
                              <div
                                key={nextStatus}
                                className={`status-option status-${nextStatus.replace(/\s+/g, '').toLowerCase()}`}
                                onClick={e => { e.stopPropagation(); handleStatusChange(order.id, nextStatus); }}
                              >
                                {nextStatus}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="order-orders">{order.orders}</div>
                      <div className="order-date">{order.date}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* ✅ TO SHIP TAB (FULL UI) */}
            {activeTab === 'to-ship' && (
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders">No orders to ship.</div>
                ) : filteredOrders.map(order => {
                  const fields = shippingFields[order.id] || {};
                  return (
                    <div className="order-toship-card" key={order.id}>
                      <div className="order-summary">
                        <img src={order.productImage} alt={order.productName} className="order-product-image" />
                        <div className="order-details">
                          <div><strong>Product Name:</strong> {order.productName}</div>
                          <div><strong>Quantity:</strong> {order.orders}</div>
                          <div><strong>Buyer:</strong> John Doe</div>
                          <div><strong>Address:</strong> 123 Main St, City</div>
                          <div><strong>Date:</strong> {order.date}</div>
                        </div>
                      </div>
                      <div className="order-actions">
                        <button className="approve-btn">Book Lalamove / Enter Tracking #</button>
                        <button className="approve-btn">Mark as Shipped</button>
                        <button className="decline-btn">Cancel Order & Refund Buyer</button>
                      </div>
                      <div className="shipment-fields">
                        <div className="field-row">
                          <label>Tracking Number:</label>
                          <input
                            type="text"
                            value={fields.trackingNumber || ''}
                            onChange={e => handleShippingFieldChange(order.id, 'trackingNumber', e.target.value)}
                          />
                        </div>
                        <div className="field-row">
                          <label>Courier:</label>
                          <input
                            type="text"
                            value={fields.courier || ''}
                            onChange={e => handleShippingFieldChange(order.id, 'courier', e.target.value)}
                          />
                        </div>
                        <div className="field-row">
                          <label>Upload Proof of Shipment:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleShippingFieldChange(order.id, 'shipmentProof', e.target.files[0])}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* ✅ DELIVERED TAB */}
            {activeTab === 'completed' && (
              <div className="orders-list">
                {(filteredOrders.length === 0 ? [{
                  id: 'placeholder',
                  productImage: '/images/blankimage.png',
                  productName: 'Sample Product',
                  orders: 1,
                  date: 'TBD',
                  isPlaceholder: true,
                }] : filteredOrders).map(order => (
                  <div className="order-delivered-card" key={order.id}>
                    <div className="order-summary">
                      <img src={order.productImage} alt={order.productName} className="order-product-image" />
                      <div className="order-details">
                        <div><strong>Product Name:</strong> {order.productName}</div>
                        <div><strong>Quantity:</strong> {order.orders}</div>
                        <div><strong>Buyer Name:</strong> John Doe</div>
                        <div><strong>Address:</strong> 123 Main St, City</div>
                        <div><strong>Delivery Date:</strong> {order.date}</div>
                      </div>
                    </div>
                    <div className="order-actions">
                      <button className="approve-btn">Mark as Delivered</button>
                      <button className="decline-btn">Report Buyer Issue</button>
                    </div>
                    {shippingFields[order.id]?.shipmentProof && (
                      <div className="field-row">
                        <label>Shipment Proof:</label>
                        <a
                          href={URL.createObjectURL(shippingFields[order.id].shipmentProof)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Refund/Cancel Tab */}
            {activeTab === 'refund' && (
              <div className="orders-list">
                {(filteredOrders.length === 0 ? [
                  {
                    id: 'BC-0001',
                    buyer: 'John Doe',
                    refundAmount: 500,
                    reason: 'Buyer Cancellation',
                    status: 'Pending',
                  },
                  {
                    id: 'SC-0002',
                    buyer: 'Jane Smith',
                    refundAmount: 1200,
                    reason: 'Seller Cancellation',
                    status: 'Processed',
                  },
                  {
                    id: 'AC-0003',
                    buyer: 'Mark Lee',
                    refundAmount: 800,
                    reason: 'Auto-cancel Unpaid Shipping/Downpayment',
                    status: 'Pending',
                  }
                ] : filteredOrders).map(order => {
                  const fields = shippingFields[order.id] || {};
                  return (
                    <div className="order-refund-card" key={order.id}>
                      <div className="order-summary">
                        <div><strong>Order ID:</strong> #{order.id}</div>
                        <div><strong>Buyer:</strong> {order.buyer || 'John Doe'}</div>
                        <div><strong>Refund Amount:</strong> ₱{order.refundAmount || 0}</div>

                        <div className="field-row">
                          <label>Reason:</label>
                          <select
                            value={fields.refundReason || order.reason || ''}
                            onChange={e => handleShippingFieldChange(order.id, 'refundReason', e.target.value)}
                          >
                            <option value="">Select Reason</option>
                            <option value="Buyer Cancellation">Buyer Cancellation</option>
                            <option value="Seller Cancellation">Seller Cancellation</option>
                            <option value="Auto-cancel Unpaid Shipping/Downpayment">Auto-cancel Unpaid Shipping/Downpayment</option>
                          </select>
                        </div>
                        <div className="field-row">
                          <label>Status:</label>
                          <select
                            value={fields.refundStatus || order.status || ''}
                            onChange={e => handleShippingFieldChange(order.id, 'refundStatus', e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processed">Processed</option>
                          </select>
                        </div>
                        <div className="field-row">
                          <label>Proof of Refund:</label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => handleShippingFieldChange(order.id, 'refundProof', e.target.files[0])}
                          />
                          {fields.refundProof && (
                            <a
                              href={URL.createObjectURL(fields.refundProof)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ marginLeft: '8px' }}
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="order-actions">
                        <button className="approve-btn" onClick={() => alert(`Refund processed for order ${order.id}`)}>
                          Process Refund
                        </button>
                        <button className="decline-btn" onClick={() => alert(`Refund canceled for order ${order.id}`)}>
                          Cancel Refund
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Order Requests */}
            {activeTab === 'requests' && (
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders">No orders found.</div>
                ) : filteredOrders.map(order => (
                  <div className="order-request-card" key={order.id}>
                    <div className="order-summary">
                      <img src={order.productImage} alt={order.productName} className="order-product-image" />
                      <div className="order-details">
                        <div><strong>Product Name:</strong> {order.productName}</div>
                        <div><strong>Quantity:</strong> {order.orders}</div>
                        <div><strong>Buyer Name:</strong> John Doe</div>
                        <div><strong>Shipping Address:</strong> 123 Main St, City, Country</div>
                        <div><strong>Payment Method:</strong> COD / Prepaid</div>
                        <div><strong>Shipping Fee Status:</strong> Paid / Unpaid</div>
                      </div>
                    </div>
                    <div className="order-actions">
                      <button className="approve-btn">Approve Order</button>
                      <button className="decline-btn">Decline / Cancel</button>
                      <button className="preorder-btn">Mark as Preorder Confirmed</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="orders-pagination">
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">...</button>
          </div>

        </div>
      </div>
    </Layout>
  );
};
export default OrderList;
