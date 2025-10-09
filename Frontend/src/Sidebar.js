import React from "react";
import "./Sidebar.css";
import Logo2 from "./Logo2.png";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={Logo2} alt="Logo" />
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">GENERAL</p>
        <ul>
          <li>Dashboard</li>
          <li>Products</li>
          <li>Customers</li>
          <li>Artisans</li>
          <li>Orders</li>
          <li>Forecast & Trends</li>
        </ul>

        <p className="menu-label">View as</p>
        <ul>
          <li>Artisan</li>
          <li>Costumer</li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <p>⚙ SETTINGS</p>
      </div>
    </div>
  );
}

export default Sidebar;
