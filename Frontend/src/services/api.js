// Mock API service for frontend development
// This simulates backend API calls and can be easily replaced with real API calls

// Mock data
const mockCategories = [
  { id: 1, name: 'Furniture' },
  { id: 2, name: 'Home Decor' },
  { id: 3, name: 'Kitchenware' },
  { id: 4, name: 'Textiles' },
  { id: 5, name: 'Lighting' }
];

const mockProducts = [
  {
    id: 1,
    name: 'Handcrafted Wooden Chair',
    description: 'Beautiful handcrafted wooden chair made from reclaimed oak.',
    category: 'Furniture',
    brand_name: 'Artisan Crafts',
    stock_quantity: 15,
    regular_price: '299.99',
    sales_price: '249.99',
    main_image: '/images/blankimage.png',
    gallery_images: ['/images/blankimage.png', '/images/blankimage.png']
  }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Get all categories
  getCategories: async () => {
    try {
      await delay(500); // Simulate network delay
      console.log('📡 Mock API: Fetching categories');
      return mockCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      await delay(1000); // Simulate network delay
      console.log('📡 Mock API: Creating product', productData);
      
      // Simulate successful creation
      const newProduct = {
        id: Date.now(), // Simple ID generation
        name: productData.name,
        description: productData.description,
        category: productData.category,
        brand_name: productData.brandName,
        stock_quantity: parseInt(productData.stockQuantity),
        regular_price: productData.regularPrice,
        sales_price: productData.salesPrice,
        main_image: productData.mainImage ? URL.createObjectURL(productData.mainImage) : null,
        gallery_images: productData.galleryImages ? productData.galleryImages.map(img => URL.createObjectURL(img)) : []
      };
      
      mockProducts.push(newProduct);
      
      // Show success message
      alert('✅ Product created successfully! (This is a mock response)');
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Error creating product: ' + error.message);
      throw error;
    }
  },

  // Get all products
  getProducts: async () => {
    try {
      await delay(500);
      console.log('📡 Mock API: Fetching products');
      return mockProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    try {
      await delay(1000);
      console.log('📡 Mock API: Updating product', productId, productData);
      
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        throw new Error('Product not found');
      }
      
      mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        name: productData.name,
        description: productData.description,
        category: productData.category,
        brand_name: productData.brandName,
        stock_quantity: parseInt(productData.stockQuantity),
        regular_price: productData.regularPrice,
        sales_price: productData.salesPrice,
        main_image: productData.mainImage ? URL.createObjectURL(productData.mainImage) : mockProducts[productIndex].main_image,
        gallery_images: productData.galleryImages ? productData.galleryImages.map(img => URL.createObjectURL(img)) : mockProducts[productIndex].gallery_images
      };
      
      alert('✅ Product updated successfully! (This is a mock response)');
      return mockProducts[productIndex];
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product: ' + error.message);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      await delay(500);
      console.log('📡 Mock API: Deleting product', productId);
      
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        throw new Error('Product not found');
      }
      
      mockProducts.splice(productIndex, 1);
      alert('✅ Product deleted successfully! (This is a mock response)');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error deleting product: ' + error.message);
      throw error;
    }
  }
};

// Legacy API exports for compatibility
export const productsAPI = {
  getProducts: () => Promise.resolve({ data: mockProducts }),
  getProduct: (id) => Promise.resolve({ data: mockProducts.find(p => p.id === id) }),
  createProduct: (productData) => apiService.createProduct(productData),
  updateProduct: (id, productData) => apiService.updateProduct(id, productData),
  deleteProduct: (id) => apiService.deleteProduct(id),
};

export const categoriesAPI = {
  getCategories: () => Promise.resolve({ data: mockCategories }),
  createCategory: (categoryData) => Promise.resolve({ data: { id: Date.now(), ...categoryData } }),
};

export default apiService;

