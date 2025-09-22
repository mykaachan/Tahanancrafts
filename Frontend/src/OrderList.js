import React, { useState } from 'react';
import './OrderList.css';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'to-ship', label: 'To Ship' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'refund', label: 'Refund/Cancel' },
  { key: 'requests', label: 'Order Requests' },
];

// Placeholder orders data for frontend only
const placeholderOrders = [
  {
    id: '123445',
    productImage: '/images/bag.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Woven Bag',
    status: 'Pending',
    orders: 1,
    date: '1 May 2025',
  },
  {
    id: '124445',
    productImage: '/images/bag.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Coin Purse',
    status: 'To Ship',
    orders: 1,
    date: '1 May 2025',
  },
  {
    id: '125445',
    productImage: '/images/bag.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Coin Purse',
    status: 'Shipping',
    orders: 1,
    date: '1 May 2025',
  },
  {
    id: '126445',
    productImage: '/images/bag.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Coin Purse',
    status: 'Delivered',
    orders: 1,
    date: '1 May 2025',
  },
  {
    id: '127445',
    productImage: '/images/bag.png',
    productName: 'Sabit Habiing Ibaan',
    productCategory: 'Coin Purse',
    status: 'Refunded',
    orders: 1,
    date: '1 May 2025',
  },
];

const statusFilterMap = {
  all: () => true,
  'to-ship': order => order.status === 'To Ship',
  shipping: order => order.status === 'Shipping',
  delivered: order => order.status === 'Delivered',
  refund: order => order.status === 'Refunded',
  requests: order => order.status === 'Pending',
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

  const filteredOrders = orders.filter(order => {
    const statusFilter = statusFilterMap[activeTab];
    const matchesStatus = statusFilter(order);
    const matchesOrderId = orderIdFilter === '' || order.id.includes(orderIdFilter);
    return matchesStatus && matchesOrderId;
  });

  const handleStatusClick = (orderId) => {
    setEditingStatusId(orderId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setEditingStatusId(null);
  };

  return (
    <div className="order-list-page-container">
      <h1 className="page-title">Product Details</h1>
      <div className="orders-section">
        <h2>Orders List</h2>
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
        <div className="orders-list-container">
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
            ) : (
              filteredOrders.map(order => (
                <div className="order-row" key={order.id}>
                  <div className="order-product">
                    <img src={order.productImage} alt={order.productName} className="order-product-image" />
                    <div className="order-product-details">
                      <div className="order-product-name">{order.productName}</div>
                      <div className="order-product-category">{order.productCategory}</div>
                    </div>
                  </div>
                  <div className="order-id">#{order.id}</div>
                  <div className={`order-status status-${order.status.replace(/\s+/g, '').toLowerCase()}`}
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
                            onClick={e => {
                              e.stopPropagation();
                              handleStatusChange(order.id, nextStatus);
                            }}
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
              ))
            )}
          </div>
        </div>
        {/* Pagination placeholder */}
        <div className="orders-pagination">
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">...</button>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
