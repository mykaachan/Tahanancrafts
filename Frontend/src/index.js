import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import LoginPage from './LoginPage';
import ForgotPass from './ForgotPass';
import ForgotPass2 from './ForgotPass2';
import SignUp from './SignUp';
import VerifyCode from './VerifyCode';
import ChangePassword from './ChangePassword';
import HomePage from './HomePage';
import StoryPage from './StoryPage';
import Products from './Products';
import Iraya from './Iraya';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Layout from './components/Layout';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import SignupVerifyContact from './SignupVerify';
import AllProducts from './AllProducts';
import OrderList from './OrderList';
import Checkout from './Checkout';
import Profile from './Profile';
import HomeDashboard from './HomeDashboard';
import Shop from './Shop';
import ShopAllProducts from './ShopAllProducts';
import ChatPopup from './ChatPopup'; // ✅ Global popup
import TransactionHistory from './TransactionHistory';
import AdminLogin from './AdminLogin';  
import MyPurchases from './MyPurchases';
import Notification from './Notification';
import UserForm from './UserForm';
import AdminSidebar from './AdminSidebar';
import AdminDash from './AdminDash';
import AdminProd from "./AdminProd";
import AdminDet from "./AdminDet"; // import at top
import AdminCust from "./AdminCust";
import AdminCustDetails from "./AdminCustDetails";
import AdminArtisan from "./AdminArtisan";
import AdminArtisanDetails from "./AdminArtisanDetails";
import ArtisanProducts from "./ArtisanProducts";
import AdminTransHistory from "./AdminTransHistory";
import AdminNotification from './AdminNotification';
import AdminOrders from './AdminOrders';
import AdminOrderDet from './AdminOrderDet';
import AdminForecast from './AdminForecast';
import UnderDevelopment from './UnderDevelopment';
import TaalStory from './TaalStory';
import PrivacyTerms from './PrivacyTerms';
import SellerProfile from "./SellerProfile"; // ✅ NEW — Import SellerProfile
import SellerRegister from "./SellerRegister"; // ✅ default export
import "@fortawesome/fontawesome-free/css/all.min.css";
import HeaderFooter from './HeaderFooter';
// ✅ Step 1: Create a conditional wrapper for the popup
function ConditionalChatPopup() {
  const location = useLocation();
  // List of routes where popup should be hidden
  const hiddenPaths = [
    "/",
    "/login",                // login
    "/signup",
    "/forgot-password",
    "/forgotpass2",
    "/verify",
    "/signup-verify",
    "/change-password",
    "/sellerregister" 
  ];
  const shouldHide = hiddenPaths.includes(location.pathname);
  if (shouldHide) return null; // Don't render popup on those pages
  return <ChatPopup />;        // Render on all others
}
// ✅ Step 2: Main App Wrapper
function MainApp() {
  return (
    <BrowserRouter>
      {/* Chat Popup shows everywhere except hidden paths */}
      <ConditionalChatPopup />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/forgotpass2" element={<ForgotPass2 />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/story" element={<HeaderFooter><StoryPage /></HeaderFooter>} />
        <Route path="/products" element={<HeaderFooter><Products /></HeaderFooter>} />
        <Route path="/iraya" element={<Iraya />} />
        <Route path="/cart" element={<HeaderFooter><Cart /></HeaderFooter>} />
        <Route path="/signup-verify" element={<SignupVerifyContact />} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
        <Route path="/edit-product/:id" element={<Layout><EditProduct /></Layout>} />
        <Route path="/seller-dashboard" element={<HomeDashboard />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/order-list" element={<OrderList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<HeaderFooter><Checkout /></HeaderFooter>} />
        <Route path="/shop/:artisan_id" element={<Shop />} />
        <Route path="/shop/:artisan_id/products" element={<ShopAllProducts />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/dashboard/transaction-history" element={<TransactionHistory />} />
        <Route path="/my-purchases" element={<MyPurchases />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/create-user" element={<UserForm />} />
        <Route path="/adminsidebar" element={<AdminSidebar />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path="/adminprod" element={<AdminProd />} />
        <Route path="/admindet/:id" element={<AdminDet />} />
        <Route path="/admincust" element={<AdminCust />} />
        <Route path="/admincustdetails/:id" element={<AdminCustDetails />} />
        <Route path="/adminartisan" element={<AdminArtisan />} />
        <Route path="/adminartisandetails/:id" element={<AdminArtisanDetails />} />
        <Route path="/artisanproducts" element={<ArtisanProducts />} />
        <Route path="/admintranshistory" element={<AdminTransHistory />} />
        <Route path="/adminnotification" element={<AdminNotification />} />
        <Route path="/adminorders" element={<AdminOrders />} /> 
        <Route path="/adminorders/:id" element={<AdminOrderDet />} /> 
        <Route path="/adminforecast" element={<AdminForecast />} />
        <Route path="/heritage/:artisan_id" element={<HeaderFooter><TaalStory /></HeaderFooter>} />
        <Route path="/privacy-terms" element={<PrivacyTerms />} />
        <Route path="/sellerprofile" element={<SellerProfile />} /> {/* ✅ NEW route */}
        <Route path="/sellerregister" element={<SellerRegister />} />
        {/* ✅ Profile and its nested routes */}
        <Route path="/profile" element={<HeaderFooter><Profile /></HeaderFooter>}>
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
         {/* ✅ My Purchases */}
            <Route path="purchase" element={
              <div className="purchase-page">
                <h2>My Purchases</h2>
                <div className="purchase-tabs">
                  <button className="active">All</button>
                  <button>To Pay</button>
                  <button>To Ship</button>
                  <button>To Receive</button>
                  <button>To Review</button> {/* ✅ New tab */}
                  <button>Completed</button>
                </div>
                <div className="purchase-empty">
                  <img src="/images/empty-box.png" alt="No orders" />
                  <p>No orders yet</p>
                </div>
              </div>
            }/>            
dir Frontend\src\TaalStory.*
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