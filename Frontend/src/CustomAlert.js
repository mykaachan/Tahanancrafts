import React, { useEffect } from "react";
import "./CustomAlert.css";
function CustomAlert({ show, title = "Notice", message, onClose, type = "info" }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  if (!show) return null; 
  return (
    <div className="custom-alert-overlay">
      <div className={`custom-alert-box ${type}`}>
        <h2 className="custom-alert-title">{title}</h2>
        <p className="custom-alert-message">{message}</p>
        <button className="custom-alert-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
export default CustomAlert;
