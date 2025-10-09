// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import VerifyCode from "./VerifyCode";
import AllProducts from "./AllProducts";
import AddProduct from "./AddProduct";



function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/verify-code" element={<VerifyCode />} />
    </Routes>
  );
}

export default App;