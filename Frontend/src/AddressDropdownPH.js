// src/components/AddressDropdownPH.js

import React, { useEffect, useState } from "react";

export default function AddressDropdownPH({ onChange }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selected, setSelected] = useState({
    region: "",
    regionCode: "",
    province: "",
    provinceCode: "",
    city: "",
    cityCode: "",
    barangay: "",
  });

  // ----------------------------------------------------
  // 1. Load Regions on Mount
  // ----------------------------------------------------
  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((res) => res.json())
      .then((data) => {
        setRegions(data);
      });
  }, []);

  // ----------------------------------------------------
  // When region selected → load provinces
  // ----------------------------------------------------
  const loadProvinces = (regionCode) => {
    fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`)
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
        setCities([]);
        setBarangays([]);
      });
  };

  // ----------------------------------------------------
  // When province selected → load cities
  // ----------------------------------------------------
  const loadCities = (provinceCode) => {
    fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`
    )
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setBarangays([]);
      });
  };

  // ----------------------------------------------------
  // When city selected → load barangays
  // ----------------------------------------------------
  const loadBarangays = (cityCode) => {
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`)
      .then((res) => res.json())
      .then((data) => {
        setBarangays(data);
      });
  };

  // ----------------------------------------------------
  // Handle changes in dropdowns
  // ----------------------------------------------------
  const updateField = (field, value, extra = {}) => {
    const updated = { ...selected, [field]: value, ...extra };
    setSelected(updated);

    // send updated values to parent (AddAddress page)
    onChange(updated);
  };

  // ----------------------------------------------------
  // Render Component
  // ----------------------------------------------------
  return (
    <div className="address-dropdown-ph">

      {/* REGION */}
      <select
        onChange={(e) => {
          const regionCode = e.target.value;
          const regionName = regions.find((r) => r.code === regionCode)?.name;

          updateField("region", regionName, {
            regionCode,
            province: "",
            provinceCode: "",
            city: "",
            cityCode: "",
            barangay: ""
          });

          loadProvinces(regionCode);
        }}
      >
        <option value="">Select Region</option>
        {regions.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>

      {/* PROVINCE */}
      <select
        disabled={provinces.length === 0}
        onChange={(e) => {
          const provinceCode = e.target.value;
          const provinceName = provinces.find((p) => p.code === provinceCode)?.name;

          updateField("province", provinceName, {
            provinceCode,
            city: "",
            cityCode: "",
            barangay: ""
          });

          loadCities(provinceCode);
        }}
      >
        <option value="">Select Province</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      {/* CITY */}
      <select
        disabled={cities.length === 0}
        onChange={(e) => {
          const cityCode = e.target.value;
          const cityName = cities.find((c) => c.code === cityCode)?.name;

          updateField("city", cityName, {
            cityCode,
            barangay: ""
          });

          loadBarangays(cityCode);
        }}
      >
        <option value="">Select City / Municipality</option>
        {cities.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      {/* BARANGAY */}
      <select
        disabled={barangays.length === 0}
        onChange={(e) => {
          const barangayName = e.target.value;
          updateField("barangay", barangayName);
        }}
      >
        <option value="">Select Barangay</option>
        {barangays.map((b) => (
          <option key={b.code} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>

    </div>
  );
}
