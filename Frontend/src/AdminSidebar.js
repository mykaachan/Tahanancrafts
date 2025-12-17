import React from "react";
import { Link } from "react-router-dom";
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
            <Link to="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/adminprod" style={{ textDecoration: "none", color: "inherit" }}>
              Products
            </Link>
          </li>
          <li>
            <Link to="/admincust" style={{ textDecoration: "none", color: "inherit" }}>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/adminartisan" style={{ textDecoration: "none", color: "inherit" }}>
              Artisans
            </Link>
          </li>
          <li>
            <Link to="/adminorders" style={{ textDecoration: "none", color: "inherit" }}>
              Orders
            </Link>
          </li>
        </ul>
      </div>
      <div className="admin-sidebar-footer">
        <p>⚙ SETTINGS</p>
      </div>
    </div>
  );
}
export default AdminSidebar;
