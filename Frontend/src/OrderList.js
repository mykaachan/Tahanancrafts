import React, { useState } from 'react';
import Layout from './components/Layout';
import './OrderList.css';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'to-ship', label: 'To Ship' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'refund', label: 'Refund/Cancel' },
  { key: 'requests', label: 'Order Requests' },
  { key: 'preorders', label: 'Preorder Orders' },
  { key: 'shipping-paid', label: 'Shipping Fee Paid Orders' },
];

const placeholderOrders = [
  {
    id: '123445',
    productImage: '/images/blankimage.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Woven Bag',
    status: 'Pending',
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
  'to-ship': order => order.status === 'To Ship',
  shipping: order => order.status === 'Shipping',
  delivered: order => order.status === 'Delivered',
  refund: order => order.status === 'Refunded' || order.status === 'Cancelled',
  requests: order => order.status === 'Pending',
  preorders: order => order.isPreorder === true,
  'shipping-paid': order => order.shippingFeePaid > 0,
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

            {/* Normal tabs */}
            {activeTab !== 'requests' && activeTab !== 'preorders' && activeTab !== 'shipping-paid' && (
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

            {/* Preorder Orders */}
            {activeTab === 'preorders' && (
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders">No preorder orders found.</div>
                ) : filteredOrders.map(order => {
                  const downpayment = (order.price || 0) * 0.5;
                  const fields = preorderFields[order.id] || {};
                  return (
                    <div className="order-preorder-card" key={order.id}>
                      <div className="order-summary">
                        <img src={order.productImage} alt={order.productName} className="order-product-image" />
                        <div className="order-details">
                          <div><strong>Product Name:</strong> {order.productName}</div>
                          <div><strong>Quantity:</strong> {order.orders}</div>
                          <div><strong>Buyer Name:</strong> John Doe</div>
                          <div><strong>Shipping Address:</strong> 123 Main St, City, Country</div>
                          <div><strong>Payment Method:</strong> COD / Prepaid</div>
                          <div>
                            <label>Estimated Completion Date:</label>
                            <input type="date" value={fields.estimatedDate || ''} onChange={e => handlePreorderFieldChange(order.id, 'estimatedDate', e.target.value)} />
                          </div>
                          <div>
                            <label>Notes to Buyer:</label>
                            <textarea value={fields.notes || ''} onChange={e => handlePreorderFieldChange(order.id, 'notes', e.target.value)} />
                          </div>
                          <div>
                            <label>Required Downpayment Amount (50%):</label>
                            <input type="number" value={downpayment} readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="order-actions">
                        <button onClick={() => confirmPreorder(order)} className="approve-btn">Confirm Preorder Request</button>
                        <button onClick={() => rejectPreorder(order)} className="decline-btn">Reject Preorder</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shipping Fee Paid Orders */}
            {activeTab === 'shipping-paid' && (
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders">No shipping fee paid orders found.</div>
                ) : filteredOrders.map(order => {
                  const fields = shippingFields[order.id] || {};
                  return (
                    <div className="order-shipping-paid-card" key={order.id}>
                      <div className="order-summary">
                        <img src={order.productImage} alt={order.productName} className="order-product-image" />
                        <div className="order-details">
                          <div><strong>Product Name:</strong> {order.productName}</div>
                          <div><strong>Quantity:</strong> {order.orders}</div>
                          <div><strong>Buyer Name:</strong> John Doe</div>
                          <div><strong>Shipping Fee Paid:</strong> ₱{order.shippingFeePaid}</div>
                        </div>
                      </div>
                      <div className="order-actions">
                        <button onClick={() => acceptShippingOrder(order)} className="approve-btn">Accept Order</button>
                        <select value={fields.refundReason || ''} onChange={e => handleShippingFieldChange(order.id, 'refundReason', e.target.value)}>
                          <option value="">Select Refund Reason</option>
                          <option value="Out of stock">Out of stock</option>
                          <option value="Cannot fulfill on time">Cannot fulfill on time</option>
                          <option value="Incorrect product listing">Incorrect product listing</option>
                          <option value="Other reasons">Other reasons</option>
                        </select>
                        <button onClick={() => refundBuyer(order)} className="decline-btn">Refund Buyer</button>
                      </div>
                      {/* File upload for proof of refund */}
<div>
  <label>Upload Proof of Refund:</label>
  <input
    type="file"
    accept="image/*,application/pdf"
    onChange={e => handleShippingFieldChange(order.id, 'refundProof', e.target.files[0])}
  />
</div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Pagination */}
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
