import React, { useState, useEffect } from "react";
import LayoutHeaderOnly from "./LayoutHeaderOnly";
import "./SellerProfile.css";

function SellerProfile() {
  const artisanId = localStorage.getItem("artisan_id");
  const API_URL = process.env.REACT_APP_API_URL || "https://tahanancrafts.onrender.com";
  //const API_URL = "http://localhost:8000";
  const [artisan, setArtisan] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    address: "",
    about_shop: "",
    vision: "",
    mission: "",
  });

  const [mainImage, setMainImage] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!artisanId) return;
    fetch(`${API_URL}/api/users/artisan/story/${artisanId}/`)
      .then((res) => res.json())
      .then((data) => {
        setArtisan(data);
        setFormData({
          username: data.username || "",
          name: data.name || "",
          email: data.email || "",
          address: data.location || "",
          about_shop: data.about_shop || "",
          vision: data.vision || "",
          mission: data.mission || "",
        });
        setMainImage(data.main_photo || null);
        setQrCode(data.gcash_qr || null);
        setGalleryImages(data.photos || []);
      })
      .catch((err) => console.error("Error fetching artisan:", err));
  }, [API_URL, artisanId]);

  if (!artisan) return <LayoutHeaderOnly><p className="loading">Loading profile...</p></LayoutHeaderOnly>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const form = new FormData();
    Object.keys(formData).forEach((key) => form.append(key, formData[key] ?? ""));
    if (mainImage instanceof File) form.append("main_photo", mainImage);
    if (qrCode instanceof File) form.append("gcash_qr", qrCode);

    try {
      const res = await fetch(`${API_URL}/api/users/artisan/update/${artisanId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: form,
      });
      const result = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        setEditMode(false);
        // refresh displayed data
        setArtisan(result);
        setGalleryImages(result.photos || galleryImages);
        setMainImage(result.main_photo || mainImage);
        setQrCode(result.gcash_qr || qrCode);
      } else {
        console.error(result);
        alert("Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update error. See console.");
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const form = new FormData();
    for (let i = 0; i < files.length; i++) form.append("photos", files[i]);
    try {
      const res = await fetch(`${API_URL}/api/users/artisan/add-photo/${artisanId}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        body: form,
      });
      const result = await res.json();
      if (res.ok) {
        setGalleryImages((prev) => [...prev, ...result.photos]);
        alert("Photos uploaded!");
      } else {
        console.error(result);
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Upload error. See console.");
    }
  };

  const deletePhoto = async (photoId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/artisan/delete-photo/${photoId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      if (res.ok) {
        setGalleryImages((prev) => prev.filter((img) => img.id !== photoId));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Photo delete error:", err);
      alert("Delete error. See console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("artisan_id");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  return (
    <LayoutHeaderOnly>
      <div className="seller-profile-container">
        <aside className="seller-sidebar">
          <div className="profile-avatar">
            <img
              src={mainImage ? (mainImage.startsWith("http") ? mainImage : `${API_URL}${mainImage}`) : "/images/blankimage.png"}
              alt="Profile"
            />
          </div>
          <div className="sidebar-info">
            <h3 className="artisan-name">{artisan.name || "Artisan"}</h3>
            <p className="artisan-username">@{artisan.username}</p>
            <p className="artisan-location">{artisan.location || ""}</p>
          </div>

          <div className="sidebar-actions">
            <button className="primary-btn" onClick={() => setEditMode((s) => !s)}>
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
            <button className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main className="seller-main">
          <div className="profile-card">
            <div className="profile-header">
              <h2>Seller Profile</h2>
              <div className="header-actions">
                {editMode && <button className="save-btn" onClick={handleSave}>Save Changes</button>}
              </div>
            </div>

            <div className="profile-form">
              <div className="form-column">
                <label>Username</label>
                <input name="username" value={formData.username} onChange={handleChange} disabled={!editMode} />

                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} disabled={!editMode} />

                <label>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} disabled={!editMode} type="email" />

                <label>Address</label>
                <input name="address" value={formData.address} onChange={handleChange} disabled={!editMode} />
              </div>

              <div className="form-column">
                <label>About Shop</label>
                <textarea name="about_shop" value={formData.about_shop} onChange={handleChange} disabled={!editMode} rows="4" />

                <label>Vision</label>
                <textarea name="vision" value={formData.vision} onChange={handleChange} disabled={!editMode} rows="3" />

                <label>Mission</label>
                <textarea name="mission" value={formData.mission} onChange={handleChange} disabled={!editMode} rows="3" />
              </div>
            </div>

            <div className="media-section">
              <div className="media-column">
                <label>Main Image</label>
                <div className="media-preview">
                  <img
                    src={mainImage ? (mainImage instanceof File ? URL.createObjectURL(mainImage) : (mainImage.startsWith("http") ? mainImage : `${API_URL}${mainImage}`)) : "/images/blankimage.png"}
                    alt="Main"
                  />
                </div>
                <input type="file" accept="image/*" disabled={!editMode} onChange={(e) => setMainImage(e.target.files[0])} />
              </div>

              <div className="media-column">
                <label>QR Code</label>
                <div className="media-preview small">
                  <img src={qrCode ? (qrCode instanceof File ? URL.createObjectURL(qrCode) : (qrCode.startsWith("http") ? qrCode : `${API_URL}${qrCode}`)) : "/images/blankqr.png"} alt="QR" />
                </div>
                <input type="file" accept="image/*" disabled={!editMode} onChange={(e) => setQrCode(e.target.files[0])} />
              </div>
            </div>
          </div>

          <section className="gallery-section">
            <div className="gallery-header">
              <h3>Gallery</h3>
              {editMode && (
                <>
                  <input id="gallery-upload" type="file" multiple onChange={handleGalleryUpload} style={{ display: "none" }} />
                  <label htmlFor="gallery-upload" className="upload-label">Upload Photos</label>
                </>
              )}
            </div>

            <div className="gallery-grid">
              {galleryImages.length === 0 && <div className="empty-gallery">No photos</div>}
              {galleryImages.map((photo) => (
                <div className="gallery-item" key={photo.id}>
                  <img src={photo.photo.startsWith("http") ? photo.photo : `${API_URL}${photo.photo}`} alt="gallery" />
                  {editMode && <button className="delete-photo" onClick={() => deletePhoto(photo.id)}>Delete</button>}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </LayoutHeaderOnly>
  );
}

export default SellerProfile;
