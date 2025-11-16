// src/components/AddressDropdownPH.js
import React, { useEffect, useState } from "react";

export default function AddressDropdownPH({ onChange, initial }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selected, setSelected] = useState({
    region: initial?.region || "",
    regionCode: initial?.regionCode || "",
    province: initial?.province || "",
    provinceCode: initial?.provinceCode || "",
    city: initial?.city || "",
    cityCode: initial?.cityCode || "",
    barangay: initial?.barangay || "",
  });

  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((r) => r.json())
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  useEffect(() => {
    if (selected.regionCode) {
      fetch(`https://psgc.gitlab.io/api/regions/${selected.regionCode}/provinces/`)
        .then((r) => r.json())
        .then((d) => { setProvinces(d); setCities([]); setBarangays([]); })
        .catch(() => { setProvinces([]); });
    }
  }, [selected.regionCode]);

  useEffect(() => {
    if (selected.provinceCode) {
      fetch(`https://psgc.gitlab.io/api/provinces/${selected.provinceCode}/cities-municipalities/`)
        .then((r) => r.json())
        .then((d) => { setCities(d); setBarangays([]); })
        .catch(() => setCities([]));
    }
  }, [selected.provinceCode]);

  useEffect(() => {
    if (selected.cityCode) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selected.cityCode}/barangays/`)
        .then((r) => r.json())
        .then(setBarangays)
        .catch(() => setBarangays([]));
    }
  }, [selected.cityCode]);

  function updateField(field, value, extras = {}) {
    const s = { ...selected, [field]: value, ...extras };
    setSelected(s);
    onChange && onChange(s);
  }

  return (
    <div className="ph-dropdown">
      <select
        value={selected.regionCode}
        onChange={(e) => {
          const code = e.target.value;
          const name = regions.find((r) => r.code === code)?.name || "";
          updateField("region", name, { regionCode: code, province: "", provinceCode: "", city: "", cityCode: "", barangay: "" });
        }}
      >
        <option value="">Select Region</option>
        {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
      </select>

      <select
        value={selected.provinceCode}
        disabled={!provinces.length}
        onChange={(e) => {
          const code = e.target.value;
          const name = provinces.find((p) => p.code === code)?.name || "";
          updateField("province", name, { provinceCode: code, city: "", cityCode: "", barangay: "" });
        }}
      >
        <option value="">Select Province</option>
        {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
      </select>

      <select
        value={selected.cityCode}
        disabled={!cities.length}
        onChange={(e) => {
          const code = e.target.value;
          const name = cities.find((c) => c.code === code)?.name || "";
          updateField("city", name, { cityCode: code, barangay: "" });
        }}
      >
        <option value="">Select City / Municipality</option>
        {cities.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
      </select>

      <select
        value={selected.barangay}
        disabled={!barangays.length}
        onChange={(e) => updateField("barangay", e.target.value)}
      >
        <option value="">Select Barangay</option>
        {barangays.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
      </select>
    </div>
  );
}
