import React, { useState } from "react";
import axios from "axios";
function UserForm() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    role: "seller",
    password: "",
  });
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/users/auth/create-user/", formData);
      setMessage(res.data.message);
      setFormData({
        username: "",
        name: "",
        email: "",
        phone: "",
        role: "seller",
        password: "",
      });
    } catch (err) {
      setMessage(err.response?.data?.password || err.response?.data?.email || "Error creating user.");
    }
  };
  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>Create User</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} />
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        <label>Phone:</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
        </select>
        <label>Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        <button type="submit" style={{ marginTop: "10px" }}>Create User</button>
      </form>
    </div>
  );
}
export default UserForm;
