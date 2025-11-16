// src/EditAddress.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderFooter from "./HeaderFooter";
import AddressDropdownPH from "./AddressDropdownPH";
import "./ShippingAddress.css";

export default function EditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/${userId}/`
      );
      const data = await res.json();
      const found = (data || []).find((a) => a.id === Number(id));
      if (found) setForm(found);
    })();
  }, [id, userId]);

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function onPHChange(loc) {
    setForm({
      ...form,
      region: loc.region,
      province: loc.province,
      city: loc.city,
      barangay: loc.barangay,
    });
  }

  async function save() {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/update/${id}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) navigate("/select-address");
    else alert("Failed to update");
  }

  async function remove() {
    // FIXED confirm → window.confirm
    if (!window.confirm("Delete this address?")) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/delete/${id}/`,
      { method: "DELETE" }
    );

    if (res.ok) navigate("/select-address");
  }

  async function setDefault() {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE || "https://tahanancrafts.onrender.com"}/api/users/shipping-address/set-default/${id}/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    if (res.ok) {
      alert("Set as default");
      navigate("/select-address");
    }
  }

  if (!form)
    return (
      <HeaderFooter>
        <div className="loading">Loading…</div>
      </HeaderFooter>
    );

  return (
    <HeaderFooter>
      <div className="address-page-wrap">
        <div className="address-page-inner small">
          <h1>Edit Shipping Address</h1>

          <div className="form-grid">
            <label>Region / City / District</label>
            <div className="picker-row">
              <input
                name="region_display"
                value={`${form.province || ""}${
                  form.city ? ", " + form.city : ""
                }${form.barangay ? ", " + form.barangay : ""}`}
                readOnly
              />
              <button className="btn-mini" onClick={() => setModalOpen(true)}>
                Pick
              </button>
            </div>

            <label>Street / House No.</label>
            <input name="address" value={form.address || ""} onChange={change} />

            <label>Recipient's Name</label>
            <input
              name="full_name"
              value={form.full_name || ""}
              onChange={change}
            />

            <label>Phone Number</label>
            <input name="phone" value={form.phone || ""} onChange={change} />

            <label>Postal Code</label>
            <input
              name="postal_code"
              value={form.postal_code || ""}
              onChange={change}
            />

            <label>Landmark (optional)</label>
            <input
              name="landmark"
              value={form.landmark || ""}
              onChange={change}
            />

            <label>Default Shipping Address</label>
            <div className="toggle-row">
              <label className="switch">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={!!form.is_default}
                  onChange={(e) =>
                    setForm({ ...form, is_default: e.target.checked })
                  }
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={remove}>
              Delete Address
            </button>
            <button className="btn-secondary" onClick={setDefault}>
              Set as Default
            </button>
            <button className="btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </div>

        {modalOpen && (
          <div
            className="modal-backdrop"
            onClick={() => setModalOpen(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Select region / city / barangay</h3>
              <AddressDropdownPH
                onChange={onPHChange}
                initial={{
                  region: form.region,
                  regionCode: "",
                  province: form.province,
                  provinceCode: "",
                  city: form.city,
                  cityCode: "",
                  barangay: form.barangay,
                }}
              />
              <div className="modal-actions">
                <button
                  className="btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setModalOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeaderFooter>
  );
}
