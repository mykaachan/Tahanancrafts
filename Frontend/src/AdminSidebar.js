import React from "react";
import { Link } from "react-router-dom"; // ✅ Add this
import "./AdminSidebar.css";
import Logo2 from "./Logo2.png";

function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src={Logo2} alt="Logo" />
      </div>
      <div className="admin-sidebar-menu">
        <p className="admin-menu-label">GENERAL</p>
        <ul>
          <li>
            <Link to="/admindash" style={{ textDecoration: "none", color: "inherit" }}>
              Dashboard
            </Link>
          </li>
          <li><Link to="/adminprod" style={{ textDecoration: "none", color: "inherit" }}>
              Products
            </Link></li>
          <li><Link to="/admincust" style={{ textDecoration: "none", color: "inherit" }}>
              Customers
            </Link></li>
          <li><Link to="/adminartisan" style={{ textDecoration: "none", color: "inherit" }}>
              Artisans
            </Link></li>
          <li><Link to="/adminorders" style={{ textDecoration: "none", color: "inherit" }}>
              Orders
            </Link></li>
          <li><Link to="/adminforecast" style={{ textDecoration: "none", color: "inherit" }}>
              Forecast & Trends
            </Link></li>
        </ul>
        <p className="admin-menu-label">View as</p>
        <ul>
          <li>Artisan</li>
          <li>Customer</li>
        </ul>
      </div>
      <div className="admin-sidebar-footer">
        <p>⚙ SETTINGS</p>
      </div>
    </div>
  );
}

export default AdminSidebar;
