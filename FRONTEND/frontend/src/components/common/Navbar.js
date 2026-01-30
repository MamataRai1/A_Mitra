import React from "react";

function ClientNavbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 40px",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    }}>
      <h2 style={{ color: "#7c3aed" }}>Companion Rental</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <button style={btn}>Bookings</button>
        <button style={btn}>Messages</button>
        <button style={btn}>Profile</button>
      </div>
    </nav>
  );
}

const btn = {
  border: "none",
  background: "transparent",
  fontWeight: "600",
  cursor: "pointer"
};

export default ClientNavbar;
