// src/api.js
import axios from "axios";
// ✅ Base URL of your Django backend
export const API_URL = `${process.env.REACT_APP_API_URL}`;
//export const API_URL = ` http://127.0.0.1:8000`;
export const MEDIA_URL = process.env.REACT_APP_API_URL;
//export const MEDIA_URL = ` http://127.0.0.1:8000`;

// ✅ Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// --- AUTH FUNCTIONS ---
export async function registerUser(userData) {
  const res = await api.post("/api/users/auth/user_register/", userData);
  return res.data;
}
export async function login(userData) {
  const res = await api.post("/api/users/auth/login/", userData);
  return res.data;
}
export async function forgotPassword(userData) {
  const res = await api.post("/api/users/auth/forgot_password/", userData);
  return res.data;
}
export async function registerUserOtp(userData) {
  const res = await api.post("/api/users/auth/register_otp_verify/", userData);
  return res.data;
}
export async function loginOtp(userData) {
  const res = await api.post("/api/users/auth/login_otp_verify/", userData);
  return res.data;
}
export async function forgotPasswordOtp(userData) {
  const res = await api.post("/api/users/auth/forgot_password_verify/", userData);
  return res.data;
}
export async function google(userData) {
  const res = await api.post("/api/users/auth/google_callback/", userData);
  return res.data;
}
export async function ChangePassword(userData) {
  const res = await api.post("/api/users/auth/change_password/", userData);
  return res.data;
}
export async function getUserByContact(contact) {
  const res = await fetch(`https://tahanancrafts.onrender.com/api/users/auth/get_user_by_contact/?contact=${contact}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return await res.json();
}
// Fetch user profile
export async function getProfile(userId) {
  if (!userId) throw new Error("User ID is required for profile fetch");
  const res = await fetch(`${API_URL}/api/users/profile/profile/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data = await res.json();
  return data.user; // backend returns { user: {...} }
}
// update profile
export async function updateProfile(userId, profileData, isFormData = false) {
  const res = await fetch(`${API_URL}/api/users/profile/edit/?user_id=${userId}`, {
    method: "PATCH",
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? profileData : JSON.stringify(profileData),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update profile: ${errText}`);
  }
  return res.json();
}
// Helper to generate avatar URL or initials placeholder
export function getAvatarUrl(avatarPath, name) {
  if (avatarPath) return avatarPath; // uploaded avatar
  // generate initials placeholder
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";
  return `https://via.placeholder.com/150?text=${initials}`;
}
export async function changePassword(oldPassword, newPassword, repeatPassword) {
  const userId = JSON.parse(localStorage.getItem("user_id"));
  if (!userId) {
    throw new Error("User not logged in");
  }
  const response = await fetch(`${API_URL}/users/profile/change_password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      old_password: oldPassword,
      new_password: newPassword,
      repeat_password: repeatPassword, 
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to change password");
  }
  return data;
}
// Fetch all products
export async function fetchProducts() {
  const res = await api.get("/api/products/product/products/"); 
  return res.data;
}
// Fetch all categories
export async function fetchCategories() {
  const res = await api.get("/api/products/product/categories/");
  return res.data;
}
// Fetch all materials
export async function fetchMaterials() {
  const res = await api.get("/api/products/product/materials/");
  return res.data;
}
export async function addProduct(formData, mainImage = null, galleryImages = []) {
  const data = new FormData();

  // Append all normal fields
  for (const key in formData) {
    if (Array.isArray(formData[key])) {
      formData[key].forEach(val => data.append(key, val));
    } else {
      data.append(key, formData[key]);
    }
  }

  // ⭐ REQUIRED for backend
  const artisanId = localStorage.getItem("artisan_id");
    data.append("artisan_id", localStorage.getItem("artisan_id"));

    // Append main image
    if (mainImage) data.append("main_image", mainImage.file);

    // Append gallery images
    galleryImages.forEach(img => data.append("images", img.file));

    const res = await api.post("/api/products/product/add_product/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  }

// src/api.js
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_URL}${path}`;
}
export async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/products/product/products/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
}
// ✅ Add item to cart (no JWT, just send user_id)
export async function addToCart(userId, productId, quantity) {
  const res = await fetch(`${API_URL}/api/products/cart/carts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,       
      product_id: productId,
      quantity: quantity,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add to cart");
  }
  return await res.json();
}
// ✅ Get all cart items for a specific user
export async function getCartItems(userId) {
  const res = await fetch(`${API_URL}/api/products/cart/carts/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return await res.json();
}
// ✅ Update cart item quantity
export async function updateCartItem(cartId, quantity, userId) {
  const res = await fetch(`${API_URL}/api/products/cart/carts/qty/${cartId}/${userId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update cart item: ${errText}`);
  }
  return await res.json();
}
// ✅ Remove cart item
export async function removeCartItem(cartId, userId) {
  const res = await fetch(`${API_URL}/api/products/cart/carts/${cartId}/delete/?user_id=${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete cart item");
  return true;
}
//stories api
export async function fetchArtisanStories(artisan_id) {
  const res = await fetch(`${API_URL}/api/users/artisan/artisan-stories/?artisan_id=${artisan_id}`);
  if (!res.ok) throw new Error("Failed to fetch artisan stories");
  return await res.json();
}
//products by shop
export async function fetchShopProducts(artisan_id) {
  const res = await fetch(`${API_URL}/api/products/product/shop/${artisan_id}/`);
  if (!res.ok) throw new Error("Failed to fetch shop products");
  return await res.json();
}
//HOMEPAGE - latest products
export async function fetchLatestProducts() {
  const res = await fetch(`${API_URL}/api/products/product/latest-products/`);
  if (!res.ok) throw new Error("Failed to fetch latest products");
  return await res.json();
}
//HOMEPAGE - featured products
export async function fetchFeaturedProducts(userId) {
  const res = await fetch(`${API_URL}/api/products/product/featured-products/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch featured products");
  return await res.json();
}