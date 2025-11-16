import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressDropdownPH from "./components/AddressDropdownPH"; // <-- IMPORT HERE
import "./AddAddress.css";

export default function AddAddress() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    postal_code: "",
    landmark: "",
  });

  // -----------------------------------------
  // Save changes for text inputs
  // -----------------------------------------
  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -----------------------------------------
  // Save address to backend
  // -----------------------------------------
  const save = async () => {
    await fetch("https://tahanancrafts.onrender.com/api/users/shipping-address/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        ...form,
      }),
    });

    navigate("/select-address"); // Go back to selection
  };

  return (
    <div className="add-address-page">
      <h2>Add New Address</h2>

      {/* TEXT INPUTS */}
      <input name="full_name" placeholder="Full Name" onChange={change} />

      <input name="phone" placeholder="Phone Number" onChange={change} />

      <input name="address" placeholder="House No. / Street" onChange={change} />

      {/* -------------------------------------- */}
      {/*  PSGC REGION → PROVINCE → CITY → BARANGAY */}
      {/* -------------------------------------- */}

      <AddressDropdownPH
        onChange={(location) =>
          setForm({
            ...form,
            region: location.region,
            province: location.province,
            city: location.city,
            barangay: location.barangay,
          })
        }
      />

      {/* Postal code + Landmark */}
      <input
        name="postal_code"
        placeholder="Postal Code"
        onChange={change}
      />

      <input
        name="landmark"
        placeholder="Landmark (optional)"
        onChange={change}
      />

      <button onClick={save}>Save Address</button>
      <button onClick={() => navigate(-1)}>Cancel</button>
    </div>
  );
}
