// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import VerifyCode from "./VerifyCode";
import AllProducts from "./AllProducts";
import AddProduct from "./AddProduct";
import HomePage from "./HomePage";



function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;