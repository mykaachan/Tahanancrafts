import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ForgotPass from './ForgotPass';
import ForgotPass2 from './ForgotPass2';
import ChangePassword from './ChangePassword';
import SignUp from './SignUp';   
import VerifyCode from './VerifyCode';
import HomePage from './HomePage';   // ✅ homepage
import StoryPage from './StoryPage'; // ✅ story page
import Products from './Products';   // ✅ products page
import Iraya from './Iraya';         // ✅ import Iraya page
import Cart from './Cart';           // ✅ import Cart page
import Layout from './Layout';       // ✅ import Layout component
import AddProduct from './AddProduct'; // ✅ import AddProduct page
import "@fortawesome/fontawesome-free/css/all.min.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/forgot-password" element={<ForgotPass />} />
      <Route path="/forgotpass2" element={<ForgotPass2 />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/signup" element={<SignUp />} />  
      <Route path="/verify" element={<VerifyCode />} />
      <Route path="/homepage" element={<HomePage />} />  
      <Route path="/story" element={<StoryPage />} />   
      <Route path="/products" element={<Products />} /> 
      <Route path="/iraya" element={<Iraya />} />   {/* ✅ new Iraya route */}
      <Route path="/cart" element={<Cart />} />          {/* ✅ Cart route */}
      <Route path="/admin" element={<Layout><AddProduct /></Layout>} /> {/* ✅ Admin Add Product route */}
    </Routes>
  </BrowserRouter>
);
