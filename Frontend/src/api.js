// src/api.js
import axios from "axios";

// Base URL of your Django backend
const API_URL = "http://127.0.0.1:8000/api";

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH FUNCTIONS ---

export async function registerUser(userData) {
  const res = await api.post("/users/auth/user_register/", userData);
  return res.data;
}

export async function login(userData) {
  const res = await api.post("/users/auth/login/", userData);
  return res.data;
}

export async function forgotPassword(userData) {
  const res = await api.post("/users/auth/forgot_password/", userData);
  return res.data;
}

export async function registerUserOtp(userData) {
  const res = await api.post("/users/auth/register_otp_verify/", userData);
  return res.data;
}

export async function loginOtp(userData) {
  const res = await api.post("/users/auth/login_otp_verify/", userData);
  return res.data;
}

export async function forgotPasswordOtp(userData) {
  const res = await api.post("/users/auth/forgot_password_verify/", userData);
  return res.data;
}

export async function google(userData) {
  const res = await api.post("/users/auth/google_callback/", userData);
  return res.data;
}

export async function ChangePassword(userData) {
  const res = await api.post("/users/auth/change_password/", userData);
  return res.data;
}

// api.js
export async function getProfile() {
  const userId = localStorage.getItem("user_id");
  if (!userId) throw new Error("No user ID found");

  const res = await fetch(`http://127.0.0.1:8000/api/users/profile/profile/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch profile");

  const data = await res.json();
  return data;
}


// --- PRODUCT FUNCTIONS ---

// Fetch all products
export async function fetchProducts() {
  const res = await api.get("/products/product/products/"); 
  return res.data;
}

// Fetch all categories
export async function fetchCategories() {
  const res = await api.get("/products/product/categories/");
  return res.data;
}

// Fetch all materials
export async function fetchMaterials() {
  const res = await api.get("/products/product/materials/");
  return res.data;
}

export async function addProduct(formData, mainImage = null, galleryImages = []) {
  const data = new FormData();

  // Append all fields
  for (const key in formData) {
    if (Array.isArray(formData[key])) {
      formData[key].forEach(val => data.append(key, val));
    } else {
      data.append(key, formData[key]);
    }
  }

  // Main image
  if (mainImage) data.append("main_image", mainImage.file);

  // Gallery images
  galleryImages.forEach(img => data.append("images", img.file));

  const res = await api.post("/products/product/add_product/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}


export const MEDIA_URL = "http://127.0.0.1:8000";

// src/api.js
export function getImageUrl(path) {
  if (!path) return ""; // handle missing image
  // if path already starts with http, return it as is
  if (path.startsWith("http")) return path;
  // otherwise prepend host
  return `http://127.0.0.1:8000${path}`;
}

