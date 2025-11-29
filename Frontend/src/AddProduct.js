import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './AddProduct.css';
import { fetchCategories, fetchMaterials, addProduct } from './api';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [],
    brandName: '',
    stockQuantity: '',
    regularPrice: '',
    salesPrice: ''
  });
  const [materials, setMaterials] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const categoriesData = await fetchCategories();
        const materialsData = await fetchMaterials();

        setCategoryOptions(
          categoriesData.map(cat => ({ value: cat.id, label: cat.name }))
        );
        setMaterialOptions(
          materialsData.map(mat => ({ value: mat.id, label: mat.name }))
        );
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }
    fetchOptions();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
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
  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
      return prev.filter(img => img.id !== imageId);
    });
  };
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      });
    }
    e.target.value = '';
  };
  const deleteAllImages = () => {
    if (window.confirm('Are you sure you want to clear everything?')) {
      setFormData({
        name: '',
        description: '',
        categories: [],
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        brandName: formData.brandName,
        stock_quantity: formData.stockQuantity,
        regular_price: formData.regularPrice,
        sales_price: formData.salesPrice || null,
        categories: formData.categories,
        materials: materials,
      };
      const response = await addProduct(dataToSend, mainImage, images);
      alert('Product added successfully!');
      console.log(response);
      deleteAllImages();
    } catch (error) {
      console.error(
        'Error adding product:',
        error.response ? error.response.data : error
      );
      alert('Failed to add product. Check console for details.');
    }
  };
  return (
    <div className="add-product-container">
      <h1 className="page-title">Product Details</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-columns">
          {/* Left Column */}
          <div className="form-left-column">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Type name here"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Type description here"
                className="form-textarea"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <Select
                options={categoryOptions}
                isMulti
                onChange={(selected) => {
                  const selectedIds = selected
                    ? selected.map(opt => opt.value)
                    : [];
                  setFormData(prev => ({ ...prev, categories: selectedIds }));
                }}
                value={categoryOptions.filter(opt =>
                  formData.categories.includes(opt.value)
                )}
                closeMenuOnSelect={false}
              />
            </div>
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="Type brand name here"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="form-input stock-input"
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
                  step="0.01"
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
                  step="0.01"
                  className="form-input"
                />
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="form-right-column">
            <div className="form-group">
              <label>Materials</label>
              <Select
                options={materialOptions}
                isMulti
                onChange={(selected) =>
                  setMaterials(selected ? selected.map(opt => opt.value) : [])
                }
                value={materialOptions.filter(opt =>
                  materials.includes(opt.value)
                )}
                closeMenuOnSelect={false}
              />
            </div>
            {/* Main Image Upload */}
            <div className="form-group">
              <label>Main Product Image</label>
              <div className="main-image-placeholder">
                {mainImage ? (
                  <div className="main-image-preview">
                    <img src={mainImage.preview} alt={mainImage.name} />
                    <button
                      type="button"
                      className="remove-main-image"
                      onClick={() => setMainImage(null)}
                    >
                      
                    </button>
                  </div>
                ) : (
                  <div className="main-image-content">
                    <img
                      src="/images/blankimage.png"
                      alt="Upload main"
                      className="blank-image"
                    />
                    <span className="image-text">Main Product Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="main-image-input"
                />
              </div>
            </div>
            {/* Gallery Upload */}
            <div className="gallery-section">
              <h3 className="gallery-title">Product Gallery</h3>
              <div className="upload-area">
                <div className="upload-content">
                  <img
                    src="/images/blankimage.png"
                    alt="Upload images"
                    className="upload-image"
                  />
                  <span className="upload-text">
                    Drop your image here, or upload
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </div>
              {images.length > 0 && (
                <div className="image-thumbnails">
                  {images.map((image) => (
                    <div key={image.id} className="thumbnail-item">
                      <div className="thumbnail-preview">
                        <img src={image.preview} alt={image.name} />
                        <button
                          type="button"
                          className="remove-thumbnail"
                          onClick={() => removeImage(image.id)}
                        >
                          ×
                        </button>
                      </div>
                      <span className="thumbnail-name">{image.name}</span>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 4 - images.length) }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="thumbnail-item empty"
                      >
                        <div className="thumbnail-preview">
                          <img
                            src="/images/blankimage.png"
                            alt="Empty slot"
                            className="empty-thumbnail-icon"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={deleteAllImages}
            className="btn-secondary"
          >
            Clear
          </button>
          <button type="submit" className="btn-primary">
            Save and Publish
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
