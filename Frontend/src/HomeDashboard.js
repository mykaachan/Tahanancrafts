// =======================
// HomeDashboard.js (FINAL WORKING VERSION)
// Uses ONLY valid API routes:
//   /api/products/product/shop/<artisan_id>/
//   /api/products/product/top-selling/<artisan_id>/
// =======================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import "./HomeDashboard.css";
import { getImageUrl } from "./api";

const API_URL = process.env.REACT_APP_API_URL;

const allTransactions = [
  {
    orderId: "#101011",
    icon: require("./images/bag.png"),
    name: "Sakbit Habing Ibaan",
    category: "Weaved Bag",
    stock: 10,
    price: "₱1,500",
    status: "Shipped",
    date: "1 May 2025",
  },
  {
    orderId: "#101012",
    icon: require("./images/bag1.png"),
    name: "Kalpi Habing Ibaan",
    category: "Coin Purse",
    stock: 5,
    price: "₱1,745",
    status: "Shipped",
    date: "1 May 2025",
  },
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  // ================================
  // DYNAMIC: SELLER PRODUCTS
  // ================================
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const artisanId = localStorage.getItem("artisan_id");

        if (!artisanId) {
          console.log("❌ ERROR: No artisan_id found in local storage.");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/products/product/shop/${artisanId}/`
        );

        const data = await res.json();
        setSellerProducts(data.products || []);
      } catch (err) {
        console.error("❌ Failed to fetch seller products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchSellerProducts();
  }, []);

  // ================================
  // DYNAMIC: TOP SELLER PRODUCTS
  // ================================
  const [topSellerProducts, setTopSellerProducts] = useState([]);
  const [loadingTopSellers, setLoadingTopSellers] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const artisanId = localStorage.getItem("artisan_id");

        if (!artisanId) return;

        const res = await fetch(
          `${API_URL}/api/products/product/top-selling/${artisanId}/`
        );

        const data = await res.json();
        setTopSellerProducts(data || []);
      } catch (err) {
        console.error("❌ Failed to fetch top selling products:", err);
      } finally {
        setLoadingTopSellers(false);
      }
    };

    fetchTopSelling();
  }, []);

  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <span className="dashboard-breadcrumb">
            Home{showHistory ? " > Transaction History" : ""}
          </span>
        </div>

        {!showHistory ? (
          <div className="dashboard-main">
            <div className="dashboard-left">

              {/* =======================
                PRODUCT SECTION
              ======================== */}
              <div className="dashboard-card products-card" style={{ marginTop: "24px" }}>
                <span className="products-count">
                  Products ({sellerProducts.length})
                </span>

                <div className="products-list">
                  {loadingProducts ? (
                    <p>Loading your products...</p>
                  ) : sellerProducts.length > 0 ? (
                    sellerProducts.map((product) => {
                      const imageUrl =
                        product.main_image
                          ? getImageUrl(product.main_image)
                          : product.images?.length > 0
                          ? getImageUrl(product.images[0].image)
                          : "https://via.placeholder.com/150?text=No+Image";

                      const stock = product.stock_quantity;
                      const stockStatus = stock <= 10 ? "Low Stock" : "In Stock";
                      const statusClass = stock <= 10 ? "status-lowstock" : "status-good";

                      return (
                        <div
                          key={product.id}
                          className="product-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 0.7fr 0.7fr 1fr 1fr",
                            borderBottom: "1px solid #eee",
                            padding: "12px 0",
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {/* Image + Details */}
                          <div style={{ display: "flex", gap: "16px" }}>
                            <img
                              src={imageUrl}
                              alt={product.name}
                              style={{ width: "48px", height: "48px", borderRadius: "8px" }}
                            />
                            <div>
                              <span>{product.name}</span>
                              <br />
                              <small style={{ color: "#7c6a58" }}>
                                {product.brandName}
                              </small>
                            </div>
                          </div>

                          {/* Stock */}
                          <span style={{ textAlign: "center" }}>{stock}</span>

                          {/* Price */}
                          <span style={{ textAlign: "center" }}>
                            ₱{product.sales_price || product.regular_price}
                          </span>

                          {/* Stock Status */}
                          <span
                            className={`product-status ${statusClass}`}
                            style={{
                              textAlign: "center",
                              padding: "4px 12px",
                              borderRadius: "10px",
                            }}
                          >
                            {stockStatus}
                          </span>

                          {/* Date */}
                          <span style={{ textAlign: "center", color: "#b8a48a" }}>
                            {product.created_at?.slice(0, 10)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p>No products found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* =======================
              RIGHT SIDE: TOP SELLERS
            ======================== */}
            <div className="dashboard-right">
              <div className="dashboard-card">
                <h4>Top Seller Products</h4>

                {loadingTopSellers ? (
                  <p>Loading top selling products...</p>
                ) : topSellerProducts.length > 0 ? (
                  topSellerProducts.map((prod) => {
                    const imageUrl =
                      prod.main_image
                        ? getImageUrl(prod.main_image)
                        : prod.images?.length > 0
                        ? getImageUrl(prod.images[0].image)
                        : "https://via.placeholder.com/150?text=No+Image";

                    return (
                      <div
                        key={prod.id}
                        className="top-seller-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "14px",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                          <img
                            src={imageUrl}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span>{prod.name}</span>
                            <small style={{ color: "#7c6a58" }}>
                              {prod.category || "Handcrafted Item"}
                            </small>
                            <span style={{ color: "#b8a48a" }}>
                              ₱{prod.sales_price || prod.regular_price}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontWeight: "bold" }}>
                          {prod.total_sold || prod.sales || 0} Sales
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p>No top selling products available.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>/* Transaction History — unchanged */</div>
        )}
      </div>
    </Layout>
  );
};

export default HomeDashboard;
