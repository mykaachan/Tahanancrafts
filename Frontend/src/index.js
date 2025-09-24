import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import LoginPage from './LoginPage';
import ForgotPass from './ForgotPass';
import ForgotPass2 from './ForgotPass2';
import ChangePassword from './ChangePassword';
import SignUp from './SignUp';   
import VerifyCode from './VerifyCode';
import HomePage from './HomePage';
import StoryPage from './StoryPage';
import Products from './Products';
import Iraya from './Iraya';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Layout from './Layout';      
import AddProduct from './AddProduct'; 
import SignupVerifyContact from './SignupVerify';
import AllProducts from './AllProducts';
import OrderList from './OrderList';


import "@fortawesome/fontawesome-free/css/all.min.css";
import ProductDetail from './Iraya';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="284499389727-dnqo999fk03kvkqug19bupignpgjahq6.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/forgotpass2" element={<ForgotPass2 />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/signup" element={<SignUp />} />  
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/homepage" element={<HomePage />} />  
          <Route path="/story" element={<StoryPage />} />   
          <Route path="/products" element={<Products />} /> 
          <Route path="/iraya" element={<Iraya />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup-verify" element={<SignupVerifyContact />} />
          <Route path="/admin" element={<Layout><AllProducts /></Layout>} /> {/* Admin default: All Products */}
          <Route path="/add-product" element={<Layout><AddProduct /></Layout>} /> {/* Admin Add Product route */}
          <Route path="/all-products" element={<Layout><AllProducts /></Layout>} />
          <Route path="/order-list" element={<Layout><OrderList /></Layout>} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);