import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import LoginPage from './LoginPage';
import ForgotPass from './ForgotPass';
import ForgotPass2 from './ForgotPass2';
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
import Checkout from './Checkout';
import Profile from './Profile';
import HomeDashboard from './HomeDashboard';
import Shop from './Shop';
import ShopAllProducts from './ShopAllProducts';
import ChatPopup from './ChatPopup'; // ✅ Global popup
import AdminLogin from './AdminLogin';
import Sidebar from './Sidebar';


import "@fortawesome/fontawesome-free/css/all.min.css";


// ✅ Step 1: Create a conditional wrapper for the popup
function ConditionalChatPopup() {
  const location = useLocation();

  // List of routes where popup should be hidden
  const hiddenPaths = [
    "/",                // user login
    "/signup",
    "/forgot-password",
    "/forgotpass2",
    "/verify",
    "/signup-verify",
    "/adminlogin"       // ✅ hide popup on admin login too
  ];

  const shouldHide = hiddenPaths.includes(location.pathname);

  if (shouldHide) return null; // Don't render popup on these pages
  return <ChatPopup />;        // Render everywhere else
}



// ✅ Step 2: Main App Wrapper
function MainApp() {
  return (
    <BrowserRouter>
      {/* Chat Popup shows everywhere except hidden paths */}
      <ConditionalChatPopup />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/forgotpass2" element={<ForgotPass2 />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/iraya" element={<Iraya />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup-verify" element={<SignupVerifyContact />} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
        <Route path="/dashboard" element={<HomeDashboard />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/order-list" element={<OrderList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shopallproducts" element={<ShopAllProducts />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/sidebar" element={<Sidebar />} />


        {/* ✅ Profile and its nested routes */}
        <Route path="/profile" element={<Profile />}>
          <Route
            index
            element={
              <div>
                <h2>My Profile</h2>
                <div className="profile-box">
                  <p><strong>Name:</strong> Juan Dela Cruz</p>
                  <p><strong>Email:</strong> juan@email.com</p>
                  <p><strong>Phone:</strong> 09123456789</p>
                </div>
              </div>
            }
          />

          <Route
            path="edit"
            element={
              <div>
                <h2>Edit Profile</h2>
                <form className="profile-form">
                  <label>Name</label>
                  <input type="text" defaultValue="Juan Dela Cruz" />
                  <label>Email</label>
                  <input type="email" defaultValue="juan@email.com" />
                  <label>Phone</label>
                  <input type="text" defaultValue="09123456789" />
                  <button type="submit" className="btn-save">Save</button>
                </form>
              </div>
            }
          />

          <Route
            path="change-password"
            element={
              <div>
                <h2>Change Password</h2>
                <form className="change-password-form">
                  <label>Old Password</label>
                  <input type="password" placeholder="Enter old password" />
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                  <button type="submit" className="btn-save">Update Password</button>
                </form>
              </div>
            }
          />

          <Route
            path="privacy"
            element={
              <div>
                <h2>Privacy Settings</h2>
                <div className="profile-box">
                  <p>You can request account deletion. This action is irreversible.</p>
                  <button className="btn-delete">Request Account Deletion</button>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


// ✅ Step 3: Render everything
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="284499389727-dnqo999fk03kvkqug19bupignpgjahq6.apps.googleusercontent.com">
      <MainApp />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
