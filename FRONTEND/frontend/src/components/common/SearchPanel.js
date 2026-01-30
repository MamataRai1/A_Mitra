import React, { useState } from "react";

function SearchPanel() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

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
        <input placeholder="Location" onChange={e => setLocation(e.target.value)} style={input} />
        <input type="date" onChange={e => setDate(e.target.value)} style={input} />
        <select onChange={e => setType(e.target.value)} style={input}>
          <option value="">Service Type</option>
          <option value="friend">Friend</option>
          <option value="event">Event Partner</option>
          <option value="travel">Travel Companion</option>
        </select>

        <button style={searchBtn}>Search</button>
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
