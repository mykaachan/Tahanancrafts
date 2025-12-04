import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./AddProduct.css";
import { fetchCategories, fetchMaterials } from "./api";
import { useParams } from "react-router-dom";

//const API_URL = process.env.REACT_APP_API_URL;
//const API_URL = "http://127.0.0.1:8000"; 
const API_URL = "https://tahanancrafts.onrender.com"; 


/* ---------------------------
   Fetch product details
---------------------------- */
async function fetchProductDetails(id) {
  const res = await fetch(`${API_URL}/api/products/product/products/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return await res.json();
}

/* ---------------------------
 Update product using FormData
---------------------------- */
async function updateProduct(id, data, mainImage, images, deletedImages) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  // NEW main image
  if (mainImage?.file) {
    formData.append("main_image", mainImage.file);
  }

  // NEW gallery images
  images.forEach((img) => {
    if (!img.existing && img.file) {
      formData.append("images", img.file);
    }
  });

  // Deleted images (IDs)
  formData.append("deleted_images", JSON.stringify(deletedImages));

  const res = await fetch(`${API_URL}/api/products/product/update_products/${id}/`, {
    method: "PUT",
    body: formData
  });

  const json = await res.json();
  return { ok: res.ok, json };
}

/* ---------------------------
 Main Component
---------------------------- */
const EditProduct = () => {
  const { id } = useParams();   // <-- 🔥 FIX: Get product ID here
  const API_URL = "http://127.0.0.1:8000";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    long_description: "",
    categories: [],
    stockQuantity: "",
    regularPrice: "",
    salesPrice: "",
  });

  const [materials, setMaterials] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);
  const [navigate, SetNavigate] = useState([]);

  /* ---------------------------
     Load categories + materials
  ---------------------------- */
  useEffect(() => {
    async function loadOptions() {
      const cats = await fetchCategories();
      const mats = await fetchMaterials();

      setCategoryOptions(cats.map((c) => ({ value: c.id, label: c.name })));
      setMaterialOptions(mats.map((m) => ({ value: m.id, label: m.name })));
    }
    loadOptions();
  }, []);

  /* ---------------------------
     Load existing product
  ---------------------------- */
    useEffect(() => {
    async function loadProduct() {
        try {
        const data = await fetchProductDetails(id);

        // Convert names → IDs
        const categoryIds = data.categories
            .map(catName => {
            const match = categoryOptions.find(opt => opt.label === catName);
            return match ? match.value : null;
            })
            .filter(Boolean);

        const materialIds = data.materials
            .map(matName => {
            const match = materialOptions.find(opt => opt.label === matName);
            return match ? match.value : null;
            })
            .filter(Boolean);

        setFormData({
            name: data.name,
            description: data.description,
            long_description: data.long_description || "",
            stockQuantity: data.stock_quantity,
            regularPrice: data.regular_price,
            salesPrice: data.sales_price,
            categories: categoryIds,
        });

        setMaterials(materialIds);

        // main image
        setMainImage({
            existing: true,
            preview: `${API_URL}${data.main_image}`,
        });

        // gallery images
        setImages(
            data.images.map((img) => ({
            id: img.id,
            existing: true,
            preview: `${API_URL}${img.image}`,
            }))
        );

        } catch (err) {
        console.error("Failed to fetch product details", err);
        }
    }

    if (categoryOptions.length > 0 && materialOptions.length > 0) {
        loadProduct();
    }
    }, [id, categoryOptions, materialOptions]);

  /* ---------------------------
     Handle Input Changes
  ---------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------
     Image Upload / Remove
  ---------------------------- */

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMainImage({
      file,
      existing: false,
      preview: URL.createObjectURL(file),
    });
  };

  // Upload multiple gallery images
  const handleImageUpload = (e) => {
    const files = [...e.target.files];
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      existing: false,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (img) => {
    // If it's an existing image, send ID to delete
    if (img.existing) {
      setDeletedImages((prev) => [...prev, img.id]);
    }

    // Remove from UI
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  /* ---------------------------
     Submit Form
  ---------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      long_description: formData.long_description,
      stock_quantity: formData.stockQuantity,
      regular_price: formData.regularPrice,
      sales_price: formData.salesPrice,
      categories: formData.categories,
      materials: materials,
    };

    const result = await updateProduct(id, payload, mainImage, images, deletedImages);

    if (!result.ok) {
      console.error(result.json);
      alert("Update failed!");
      return;
    }

    alert("Product updated successfully!");
    navigate("/all-products");
  };

  /* ---------------------------
     RENDER UI
  ---------------------------- */
  return (
    <div className="add-product-container">
      <h1 className="page-title">Edit Product</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-columns">
          {/* LEFT COLUMN */}
          <div className="form-left-column">

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label>Long Description</label>
              <textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <Select
                isMulti
                value={categoryOptions.filter((o) =>
                  formData.categories.includes(o.value)
                )}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    categories: selected.map((s) => s.value),
                  }))
                }
                options={categoryOptions}
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="price-row">
              <div className="form-group">
                <label>Regular Price</label>
                <input
                  type="number"
                  name="regularPrice"
                  value={formData.regularPrice}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Sales Price</label>
                <input
                  type="number"
                  name="salesPrice"
                  value={formData.salesPrice}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-right-column">

            <div className="form-group">
              <label>Materials</label>
              <Select
                isMulti
                options={materialOptions}
                value={materialOptions.filter((m) => materials.includes(m.value))}
                onChange={(selected) => setMaterials(selected.map((s) => s.value))}
              />
            </div>

            {/* MAIN IMAGE */}
            <div className="form-group">
              <label>Main Product Image</label>
              <div className="main-image-placeholder">
                {mainImage ? (
                  <div className="main-image-preview">
                    <img src={mainImage.preview} alt="main" />

                    {/* DELETE MAIN IMAGE */}
                    <button
                      type="button"
                      className="remove-main-image"
                      onClick={() => {
                        if (mainImage.existing) {
                          setDeletedImages((prev) => [...prev, "main"]);
                        }
                        setMainImage(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="main-image-content">
                    <img src="/images/blankimage.png" className="blank-image" />
                    <span>Main Product Image</span>
                  </div>
                )}

                <input type="file" accept="image/*" onChange={handleMainImageUpload} />
              </div>
            </div>

            {/* GALLERY IMAGES */}
            <div className="gallery-section">
              <h3>Product Gallery</h3>

              <div className="upload-area">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
              </div>

              {images.length > 0 && (
                <div className="image-thumbnails">
                  {images.map((img) => (
                    <div className="thumbnail-item" key={img.id}>
                      <div className="thumbnail-preview">
                        <img src={img.preview} alt="gallery" />

                        {/* DELETE GALLERY IMAGE */}
                        <button
                          className="remove-thumbnail"
                          type="button"
                          onClick={() => removeImage(img)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/all-products")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
