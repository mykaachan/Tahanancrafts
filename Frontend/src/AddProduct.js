import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './AddProduct.css';
import { fetchCategories, fetchMaterials, addProduct } from './api';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: [], // array for selected category ids
    brandName: '',
    stockQuantity: '',
    regularPrice: '',
    salesPrice: ''
  });

  const [materials, setMaterials] = useState([]); // array for selected material ids
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [mainImageDragActive, setMainImageDragActive] = useState(false);

  // Fetch categories and materials from API
  useEffect(() => {
    async function fetchOptions() {
      try {
        const categoriesData = await fetchCategories();
        const materialsData = await fetchMaterials();

        setCategoryOptions(categoriesData.map(cat => ({ value: cat.id, label: cat.name })));
        setMaterialOptions(materialsData.map(mat => ({ value: mat.id, label: mat.name })));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    }
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gallery Images Handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
      return prev.filter(img => img.id !== imageId);
    });
  };

  // Main Image Handlers
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setMainImage({ file, preview: URL.createObjectURL(file), name: file.name });
    e.target.value = '';
  };

  const handleMainImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setMainImageDragActive(true);
    else if (e.type === "dragleave") setMainImageDragActive(false);
  };

  const handleMainImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMainImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setMainImage({ file, preview: URL.createObjectURL(file), name: file.name });
    }
  };

  // Clear everything
  const deleteAllImages = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete everything? This will clear all form data, main product image, and gallery images. This action cannot be undone."
    );
    if (confirmDelete) {
      setFormData({
        name: '',
        description: '',
        category: [],
        brandName: '',
        stockQuantity: '',
        regularPrice: '',
        salesPrice: ''
      });
      setMaterials([]);
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      if (mainImage) URL.revokeObjectURL(mainImage.preview);
      setMainImage(null);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data for backend
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        brandName: formData.brandName,
        stock_quantity: formData.stockQuantity,
        regular_price: formData.regularPrice,
        sales_price: formData.salesPrice || null,
        categories: formData.categories, // array of category IDs
        materials: materials,            // array of material IDs
      };

      const response = await addProduct(dataToSend, mainImage, images);
      alert("Product added successfully!");
      console.log(response);
      deleteAllImages();
    } catch (error) {
      console.error("Error adding product:", error.response ? error.response.data : error);
      alert("Failed to add product. Check console for details.");
    }
  };

  return (
    <div className="add-product-container">
      <h1 className="page-title">Product Details</h1>
      <div className="product-form-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-columns">

            {/* Left Column */}
            <div className="form-left-column">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Type name here"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Type Description here"
                  className="form-textarea"
                  rows="4"
                />
              </div>

              {/* Categories */}
              <div className="form-group">
                <label>Category</label>
                <Select
                  options={categoryOptions}
                  isMulti
                  onChange={(selected) => {
                    const selectedIds = selected ? selected.map(opt => opt.value) : [];
                    setFormData(prev => ({ ...prev, category: selectedIds }));
                  }}
                  value={categoryOptions.filter(opt => formData.category.includes(opt.value))}
                  closeMenuOnSelect={false}
                />
              </div>

              <div className="form-group">
                <label htmlFor="brandName">Brand Name</label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  placeholder="Type brand name here"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stockQuantity">Stock Quantity</label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="form-input stock-input"
                />
              </div>

              <div className="price-row">
                <div className="form-group">
                  <label htmlFor="regularPrice">Regular Price</label>
                  <input
                    type="number"
                    id="regularPrice"
                    name="regularPrice"
                    value={formData.regularPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="salesPrice">Sales Price</label>
                  <input
                    type="number"
                    id="salesPrice"
                    name="salesPrice"
                    value={formData.salesPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-right-column">
              {/* Materials */}
              <div className="form-group">
                <label>Materials</label>
                <Select
                  options={materialOptions}
                  isMulti
                  onChange={(selected) => setMaterials(selected ? selected.map(opt => opt.value) : [])}
                  value={materialOptions.filter(opt => materials.includes(opt.value))}
                  closeMenuOnSelect={false}
                />
              </div>

              {/* Main Image */}
              <div 
                className={`main-image-placeholder ${mainImageDragActive ? 'drag-active' : ''}`}
                onDragEnter={handleMainImageDrag}
                onDragLeave={handleMainImageDrag}
                onDragOver={handleMainImageDrag}
                onDrop={handleMainImageDrop}
              >
                {mainImage ? (
                  <div className="main-image-preview">
                    <img src={mainImage.preview} alt={mainImage.name} />
                    <button type="button" className="remove-main-image" onClick={() => setMainImage(null)}>×</button>
                  </div>
                ) : (
                  <div className="main-image-content">
                    <img src="/images/blankimage.png" alt="Upload main" className="blank-image" />
                    <span className="image-text">Main Product Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="main-image-input"/>
              </div>

              {/* Gallery */}
              <div className="gallery-section">
                <h3 className="gallery-title">Product Gallery</h3>
                <div
                  className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <img src="/images/blankimage.png" alt="Upload images" className="upload-image" />
                    <span className="upload-text">drop your image here, or upload</span>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-input" />
                </div>

                {images.length > 0 && (
                  <div className="image-thumbnails">
                    {images.map((image) => (
                      <div key={image.id} className="thumbnail-item">
                        <div className="thumbnail-preview">
                          <img src={image.preview} alt={image.name} />
                          <button type="button" className="remove-thumbnail" onClick={() => removeImage(image.id)}>×</button>
                        </div>
                        <span className="thumbnail-name">{image.name}</span>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, index) => (
                      <div key={`empty-${index}`} className="thumbnail-item empty">
                        <div className="thumbnail-preview">
                          <img src="/images/blankimage.png" alt="Empty slot" className="empty-thumbnail-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="gallery-actions">
                  <button type="button" className="btn-primary" onClick={deleteAllImages} disabled={images.length === 0 && !mainImage && Object.values(formData).every(value => value === '')}>Clear Everything</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save and Publish</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
