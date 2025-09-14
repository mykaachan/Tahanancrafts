import React from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-top"></div>
        <div className="header-main">
          <div className="logo">
            <img src="/images/TahananCraftsLogo.png" alt="TahananCrafts" className="logo-image" />
          </div>
          <div className="header-actions">
            <img src="/images/notifications.png" alt="Notifications" className="notification-icon" />
            <img src="/images/inbox.png" alt="Messages" className="message-icon" />
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <span className="username">habingibaan</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-item">
              <img src="/images/Home.png" alt="Home" className="nav-icon" />
              <span className="nav-text">HOME</span>
            </div>
            <div className="nav-item">
              <img src="/images/ALLPRODUCTS.png" alt="All Products" className="nav-icon" />
              <span className="nav-text">ALL PRODUCTS</span>
            </div>
            <div className="nav-item">
              <img src="/images/ORDERLIST.png" alt="Order List" className="nav-icon" />
              <span className="nav-text">ORDER LIST</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;