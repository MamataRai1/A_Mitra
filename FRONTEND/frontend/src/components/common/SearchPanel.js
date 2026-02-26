import React, { useState } from "react";

function SearchPanel({ filters, onChange, onSubmit }) {
  const [localSearch, setLocalSearch] = useState(filters?.search || "");
  const [localDate, setLocalDate] = useState(filters?.date || "");
  const [localType, setLocalType] = useState(filters?.serviceType || "");

  const handleSearchClick = () => {
    onChange({
      search: localSearch,
      date: localDate,
      serviceType: localType,
    });
    if (onSubmit) onSubmit();
  };

  return (
    <div style={{
      background: "white",
      padding: "30px",
      margin: "40px auto",
      maxWidth: "1100px",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
    }}>
      <h3 style={{ marginBottom: "15px" }}>Find a Companion</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        <input
          placeholder="Location (e.g. Kathmandu)"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          style={input}
        />
        <input
          type="date"
          value={localDate}
          onChange={e => setLocalDate(e.target.value)}
          style={input}
        />
        <select
          value={localType}
          onChange={e => setLocalType(e.target.value)}
          style={input}
        >
          <option value="">Any Service Type</option>
          <option value="friend">Friend / Chat</option>
          <option value="event">Event Partner</option>
          <option value="travel">Travel Companion</option>
          <option value="study date">Study Date</option>
          <option value="movie">Movie Date</option>
          <option value="picnic">Picnic</option>
          <option value="restaurant">Dinner / Restaurant</option>
          <option value="gaming">Gaming Buddy</option>
        </select>

        <button onClick={handleSearchClick} style={searchBtn}>Search</button>
      </div>
    </div>
  );
}

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const searchBtn = {
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

export default SearchPanel;
