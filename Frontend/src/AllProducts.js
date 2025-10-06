import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import './AllProducts.css';

// Placeholder product data for frontend only
const placeholderProducts = [
  {
    id: 1,
    image: '/images/blankimage.png',
    name: 'Sample Product',
    category: 'Sample Category',
    dateAdded: '18 September 2025',
    stock: 10,
    price: 500,
    status: 'Low Stock',
    orders: 5,
  },
  {
    id: 2,
    image: '/images/blankimage.png',
    name: 'Another Product',
    category: 'Another Category',
    dateAdded: '17 September 2025',
    stock: 50,
    price: 1200,
    status: 'On Stock',
    orders: 12,
  },
  // Add more placeholder products as needed
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Low Stock':
      return 'status-low';
    case 'On Stock':
      return 'status-on';
    case 'Out of Stock':
      return 'status-out';
    default:
      return '';
  }
};

const AllProducts = () => {
  const navigate = useNavigate();

  const handleDelete = (id) => {
    // Placeholder for delete action, ready for backend integration
    alert('Delete product with id: ' + id);
  };

  return (
    <Layout>
      <div className="all-products-page-container">
        <h1 className="page-title">Product Details</h1>
        <div className="products-section">
          <div className="products-header">
            <h2>Products</h2>
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {placeholderProducts.map(product => (
                <tr key={product.id}>
                  <td className="product-info">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-details">
                      <div className="product-name">{product.name}</div>
                      <div className="product-category">{product.category}</div>
                      <div className="product-date">{product.dateAdded}</div>
                    </div>
                  </td>
                  <td>{product.stock}</td>
                  <td>₱{product.price}</td>
                  <td>
                    <span className={`product-status ${getStatusClass(product.status)}`}>{product.status}</span>
                  </td>
                  <td>{product.orders}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(product.id)} title="Delete Product">
                      <img src="/images/trash.png" alt="Delete" className="delete-icon" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Placeholder row for backend integration */}
              {/* Example: <tr><td colSpan="6">Loading products...</td></tr> */}
            </tbody>
          </table>
          <div className="add-product-btn-container">
            <button className="btn-primary" onClick={() => navigate('/add-product')}>+ Add a New Product</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllProducts;
