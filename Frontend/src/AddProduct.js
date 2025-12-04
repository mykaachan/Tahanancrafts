import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './AddProduct.css';
import { fetchCategories, fetchMaterials, addProduct } from './api';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',        
    categories: [],
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
        long_description: '',
        categories: [],
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

  // 🔥 8% Artisan fee computation
  const artisanFee = 0.08;
  const regularWithFee = formData.regularPrice ? Number(formData.regularPrice) * (1 + artisanFee) : null;
  const salesWithFee = formData.salesPrice ? Number(formData.salesPrice) * (1 + artisanFee) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,   // 🔥 Added
        stock_quantity: formData.stockQuantity,
        
        // 🔥 Computed values sent to backend
        regular_price: regularWithFee,
        sales_price: salesWithFee,

        categories: formData.categories,
        materials: materials
      };

      const response = await addProduct(dataToSend, mainImage, images);
      alert('Product added successfully!');
      console.log(response);
      deleteAllImages();
    } catch (error) {
      console.error('Error adding product:', error.response ? error.response.data : error);
      console.log("BACKEND ERROR:", error.response?.data);   // 🔥 SHOW THE REAL ERROR
      console.log("FULL ERROR:", error);
      alert("Failed to add product. Check console for real error details.");
    }
  };

  return (
    <div className="add-product-container">
      <h1 className="page-title">Product Details</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-columns">

          {/* LEFT COLUMN */}
          <div className="form-left-column">

            <div className="form-group">
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Type name here" className="form-input"/>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Short description" className="form-textarea" rows="4"/>
            </div>

            {/* 🔥 LONG DESCRIPTION FIELD */}
            <div className="form-group">
              <label>Long Description</label>
              <textarea name="long_description" value={formData.long_description} onChange={handleInputChange} placeholder="Detailed long description" className="form-textarea" rows="6"/>
            </div>

            <div className="form-group">
              <label>Category</label>
              <Select
                options={categoryOptions}
                isMulti
                onChange={(selected) =>
                  setFormData(prev => ({ ...prev, categories: selected ? selected.map(opt => opt.value) : [] }))
                }
                value={categoryOptions.filter(opt => formData.categories.includes(opt.value))}
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="form-input stock-input"/>
            </div>

            {/* PRICE INPUTS + AUTO-COMPUTED VALUES */}
            <div className="price-row">
              <div className="form-group">
                <label>Regular Price</label>
                <input type="number" name="regularPrice" value={formData.regularPrice} onChange={handleInputChange} step="0.01" className="form-input"/>
                {/* 🔥 Show computed price */}
                {regularWithFee && (
                  <p className="computed-text">+ 8%: ₱{regularWithFee.toFixed(2)}</p>
                )}
              </div>

              <div className="form-group">
                <label>Sales Price</label>
                <input type="number" name="salesPrice" value={formData.salesPrice} onChange={handleInputChange} step="0.01" className="form-input"/>
                {/* 🔥 Show computed price */}
                {salesWithFee && (
                  <p className="computed-text">+ 8%: ₱{salesWithFee.toFixed(2)}</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (unchanged except brand removed) */}
          <div className="form-right-column">
            <div className="form-group">
              <label>Materials</label>
              <Select options={materialOptions} isMulti onChange={(selected) => setMaterials(selected ? selected.map(opt => opt.value) : [])} value={materialOptions.filter(opt => materials.includes(opt.value))}/>
            </div>

            {/* Main Image Upload */}
            <div className="form-group">
              <label>Main Product Image</label>
              <div className="main-image-placeholder">
                {mainImage ? (
                  <div className="main-image-preview">
                    <img src={mainImage.preview} alt={mainImage.name}/>
                    <button type="button" className="remove-main-image" onClick={() => setMainImage(null)}>×</button>
                  </div>
                ) : (
                  <div className="main-image-content">
                    <img src="/images/blankimage.png" alt="Upload main" className="blank-image"/>
                    <span className="image-text">Main Product Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="main-image-input"/>
              </div>
            </div>

            {/* Gallery */}
            <div className="gallery-section">
              <h3 className="gallery-title">Product Gallery</h3>
              <div className="upload-area">
                <div className="upload-content">
                  <img src="/images/blankimage.png" alt="Upload images" className="upload-image"/>
                  <span className="upload-text">Drop your image here, or upload</span>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-input"/>
              </div>

              {images.length > 0 && (
                <div className="image-thumbnails">
                  {images.map((image) => (
                    <div key={image.id} className="thumbnail-item">
                      <div className="thumbnail-preview">
                        <img src={image.preview} alt={image.name}/>
                        <button type="button" className="remove-thumbnail" onClick={() => removeImage(image.id)}>×</button>
                      </div>
                      <span className="thumbnail-name">{image.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="form-actions">
          <button type="button" onClick={deleteAllImages} className="btn-secondary">Clear</button>
          <button type="submit" className="btn-primary">Save and Publish</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
