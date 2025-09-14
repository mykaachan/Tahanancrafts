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
import Cart from './Cart';
import SignupVerifyContact from './SignupVerify';
import AddProduct from './AddProduct';

import "@fortawesome/fontawesome-free/css/all.min.css";

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
          <Route path="/add-product" element={<AddProduct />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
