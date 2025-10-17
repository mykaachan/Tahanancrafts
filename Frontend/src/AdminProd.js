import React, { useState } from "react";
import "./AdminDash.css";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaTrash } from "react-icons/fa"; // ✅ FIX: added FaTrash import

export default function AdminProd() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order #1234 has been delivered",
    "💬 New message from a customer",
  ]);

  const products = [
    {
      id: 1,
      name: "Iraya Basket Lipa",
      category: "Basket",
      date: "1 May 2025",
      stock: 250,
      price: 500,
      status: "Low Stock",
      orders: 10,
      img: "https://i.imgur.com/9yN6M5a.png",
    },
    {
      id: 2,
      name: "Kalpi Habing Ibaan",
      category: "Coin Purse",
      date: "29 April 2025",
      stock: 250,
      price: 349,
      status: "On Stock",
      orders: 10,
      img: "https://i.imgur.com/Vv6D9Q4.png",
    },
    {
      id: 3,
      name: "Burdang Taal Lace",
      category: "Table Runner",
      date: "28 April 2025",
      stock: 250,
      price: 149,
      status: "On Stock",
      orders: 7,
      img: "https://i.imgur.com/gH8ZC3D.png",
    },
    {
      id: 4,
      name: "Kalis Taal",
      category: "Butterfly Knife",
      date: "27 April 2025",
      stock: 250,
      price: 349,
      status: "On Stock",
      orders: 8,
      img: "https://i.imgur.com/sJ3rFvA.png",
    },
    {
      id: 5,
      name: "Sakbit Habing Ibaan",
      category: "Weaved Bag",
      date: "27 April 2025",
      stock: 250,
      price: 1200,
      status: "On Stock",
      orders: 3,
      img: "https://i.imgur.com/fZlqQ7p.png",
    },
  ];

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        {/* ===== HEADER ===== */}
        <header className="admindash-header">
          <input
            type="text"
            className="admindash-search"
            placeholder="🔍 Search products..."
          />
          <div className="admindash-header-right">
            <div
              className="admindash-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} color="#fffdf9" />
              {notifications.length > 0 && <span className="notif-dot"></span>}

              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {notifications.map((notif, index) => (
                      <li key={index}>{notif}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        {/* ===== PAGE TITLE ===== */}
        <div className="admindash-welcome">
          <h2>Products</h2>
        </div>

        {/* ===== PRODUCT TABLE ===== */}
        <div className="admincust-table">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input type="radio" name="selectProduct" />
                  </td>
                  <td>
                    <div className="cust-info">
                      <img src={item.img} alt={item.name} />
                      <div>
                        <p className="cust-name">{item.name}</p>
                        <p className="cust-email">
                          {item.category}
                          <br />
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{item.stock}</td>
                  <td>₱{item.price.toLocaleString()}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        item.status === "Low Stock" ? "inactive" : "active"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.orders}</td>
                  <td>
                    {/* ✅ Standardized Delete Button */}
                    <button className="action-delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FOOTER */}
          <div className="table-footer">
            <p>Showing 1 - 5 from 100</p>
            <div className="pagination">
              <button>&lt;</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>...</button>
              <button>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
