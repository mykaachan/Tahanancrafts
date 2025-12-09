import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./AdminDash.css";
import Select from "react-select";
import AdminSidebar from "./AdminSidebar";
import { FaBell } from "react-icons/fa6";

export default function AdminDet() {
  const { id } = useParams();
  const navigate = useNavigate();

  //const BASE_API = "http://127.0.0.1:8000";
  const BASE_API = "https://tahanancrafts.onrender.com";
  const MEDIA_URL = BASE_API;

  const UPDATE_URL = `${BASE_API}/api/products/product/update_product/?id=`;
  const DELETE_URL = `${BASE_API}/api/products/product/delete_product/?id=`;

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    "🧺 New artisan shop registered",
    "📦 Order update received",
    "💬 Customer sent a message",
  ]);

  const [product, setProduct] = useState(null);
  const [artisan, setArtisan] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    long_description: "",
    regular_price: "",
    sales_price: "",
    stock_quantity: "",
    categories: [],
    materials: [],
  });

  useEffect(() => {
    fetchInitial();
  }, [id]);

  async function fetchInitial() {
    try {
      const res = await fetch(`${BASE_API}/api/products/admin/dashboard/`);
      const data = await res.json();

      const p = data.lists.products.find((p) => p.id === parseInt(id));
      setProduct(p);

      setFormData({
        name: p.name,
        description: p.description,
        long_description: p.long_description,
        regular_price: p.regular_price,
        sales_price: p.sales_price,
        stock_quantity: p.stock_quantity,
        categories: p.categories, // names
        materials: p.materials,   // names
      });

      const art = data.lists.artisans.find((a) => a.id === p.artisan);
      setArtisan(art);

      let sold = 0;
      data.lists.orders.forEach((order) => {
        if (["delivered", "completed", "to_review"].includes(order.status)) {
          order.items.forEach((item) => {
            if (item.product === p.id) sold += item.quantity;
          });
        }
      });
      setOrdersCount(sold);

      setGalleryImages(p.images || []);

      // Fetch categories + materials list
      loadCategoryMaterialOptions();

    } catch (error) {
      console.log("Error loading product:", error);
    }
  }

  async function loadCategoryMaterialOptions() {
    try {
      const catRes = await fetch(`${BASE_API}/api/products/product/categories/`);
      const matRes = await fetch(`${BASE_API}/api/products/product/materials/`);

      const cats = await catRes.json();
      const mats = await matRes.json();

      setCategoryOptions(cats.map(c => ({ value: c.name, label: c.name })));
      setMaterialOptions(mats.map(m => ({ value: m.name, label: m.name })));

    } catch (err) {
      console.log("Error loading options:", err);
    }
  }

  function toggleEdit() {
    setEditMode(!editMode);
  }

  function updateField(key, value) {
    setFormData({ ...formData, [key]: value });
  }

  async function saveChanges() {
    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("long_description", formData.long_description);
    payload.append("regular_price", formData.regular_price);
    payload.append("sales_price", formData.sales_price);
    payload.append("stock_quantity", formData.stock_quantity);

    // categories = list of names
    formData.categories.forEach((cat) => payload.append("categories", cat));

    // materials = list of names
    formData.materials.forEach((mat) => payload.append("materials", mat));

    const res = await fetch(UPDATE_URL + id, {
      method: "PUT",
      body: payload,
    });

    if (res.ok) {
      alert("Product updated successfully!");
      window.location.reload();
    } else {
      alert("Update failed.");
    }
  }

  async function deleteProduct() {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(DELETE_URL + id, { method: "DELETE" });

    if (res.ok) {
      alert("Product deleted!");
      navigate("/adminprod");
    } else {
      alert("Delete failed.");
    }
  }

  if (!product) return <div>Loading...</div>;

  return (
    <div className="admindash-container">
      <AdminSidebar />

      <div className="admindash-main">
        <header className="admindash-header">
          <input type="text" className="admindash-search" placeholder="🔍 Search..." readOnly />

          <div className="admindash-header-right">
            <div className="admindash-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell size={20} color="#fffdf9" />
              {notifications.length > 0 && <span className="notif-dot"></span>}
              {showNotifications && (
                <div className="admindash-dropdown">
                  <h4>Notifications</h4>
                  <ul>{notifications.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </div>
              )}
            </div>

            <button className="admindash-logout">Logout</button>
            <div className="admindash-profile-circle"></div>
          </div>
        </header>

        <div className="admindash-welcome">
          <h2>
            <Link to="/adminprod" style={{ textDecoration: "none", color: "#888" }}>
              Products
            </Link>{" "}
            &gt; <span style={{ color: "#333" }}>{product.name}</span>
          </h2>
        </div>

        <div className="product-details-container">
          <div className="product-details-form">
            <div className="left-section">

              {/* NAME */}
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editMode ? formData.name : product.name}
                  readOnly={!editMode}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              {/* SHORT DESC */}
              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  value={editMode ? formData.description : product.description}
                  readOnly={!editMode}
                  onChange={(e) => updateField("description", e.target.value)}
                ></textarea>
              </div>

              {/* LONG DESC */}
              <div className="form-group">
                <label>Long Description</label>
                <textarea
                  value={editMode ? formData.long_description : product.long_description}
                  readOnly={!editMode}
                  onChange={(e) => updateField("long_description", e.target.value)}
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                ></textarea>
              </div>

              {/* CATEGORY (MULTI) */}
              <div className="form-group">
                <label>Category</label>
                {!editMode ? (
                  <input type="text" readOnly value={product.categories.join(", ")} />
                ) : (
                  <Select
                    isMulti
                    options={categoryOptions}
                    value={categoryOptions.filter(opt =>
                      formData.categories.includes(opt.value)
                    )}
                    onChange={(selected) =>
                      updateField(
                        "categories",
                        selected ? selected.map((opt) => opt.value) : []
                      )
                    }
                  />
                )}
              </div>

              {/* MATERIALS (MULTI) */}
              <div className="form-group">
                <label>Materials</label>
                {!editMode ? (
                  <input type="text" readOnly value={product.materials.join(", ")} />
                ) : (
                  <Select
                    isMulti
                    options={materialOptions}
                    value={materialOptions.filter(opt =>
                      formData.materials.includes(opt.value)
                    )}
                    onChange={(selected) =>
                      updateField(
                        "materials",
                        selected ? selected.map((opt) => opt.value) : []
                      )
                    }
                  />
                )}
              </div>

              {/* STOCK */}
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={editMode ? formData.stock_quantity : product.stock_quantity}
                  readOnly={!editMode}
                  onChange={(e) => updateField("stock_quantity", e.target.value)}
                />
              </div>

              {/* PRICE GRID */}
              <div className="product-details-grid">
                <div className="product-details-field">
                  <label>Regular Price</label>
                  <input
                    type="text"
                    value={editMode ? formData.regular_price : product.regular_price}
                    readOnly={!editMode}
                    onChange={(e) => updateField("regular_price", e.target.value)}
                  />
                </div>

                <div className="product-details-field">
                  <label>Discounted Price</label>
                  <input
                    type="text"
                    value={editMode ? formData.sales_price : product.sales_price}
                    readOnly={!editMode}
                    onChange={(e) => updateField("sales_price", e.target.value)}
                  />
                </div>

                <div className="product-details-field">
                  <label>Total Sold</label>
                  <input type="text" value={ordersCount} readOnly />
                </div>

                <div className="product-details-field">
                  <label>Status</label>
                  <input
                    type="text"
                    readOnly
                    value={product.stock_quantity > 0 ? "Available" : "Out of Stock"}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="button-group">
                {!editMode ? (
                  <button className="flag-btn" onClick={toggleEdit}>Edit</button>
                ) : (
                  <>
                    <button className="flag-btn" onClick={saveChanges}>Save</button>
                    <button className="delete-btn" onClick={toggleEdit}>Cancel</button>
                  </>
                )}
                <button className="delete-btn" onClick={deleteProduct}>Delete</button>
              </div>
            </div>

            {/* ------------------------------------------------------ */}
            {/* RIGHT SECTION */}
            {/* ------------------------------------------------------ */}

            <div className="right-section">
              <img
                src={`${MEDIA_URL}${product.main_image}`}
                alt="Product"
                className="main-product-img"
              />

              {/* GALLERY */}
              {galleryImages.length > 0 && (
                <div className="gallery">
                  <p>Product Gallery</p>
                  <div className="gallery-grid">
                    {galleryImages.map((img, i) => (
                      <img key={i} src={`${MEDIA_URL}${img}`} alt="Gallery" />
                    ))}
                  </div>
                </div>
              )}

              {/* ARTISAN */}
              {artisan && (
                <div className="artisan-seller">
                  <p>Artisan Seller</p>
                  <div className="seller-card">
                    <img
                      src={`${MEDIA_URL}${artisan.main_photo}`}
                      className="seller-img"
                      alt="Seller"
                    />
                    <div>
                      <h4>{artisan.name}</h4>
                      <small>{artisan.location}</small>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
