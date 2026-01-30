import React from "react";

function ProviderCard({ service }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "18px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
    }}>
      <h3>{service.name}</h3>
      <p style={{ color: "#555" }}>{service.description}</p>
      <p><strong>Price:</strong> NPR {service.price}</p>

      <button style={{
        marginTop: "10px",
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        background: "#7c3aed",
        color: "white",
        border: "none",
        fontWeight: "600",
        cursor: "pointer"
      }}>
        View Profile
      </button>
    </div>
  );
}

export default ProviderCard;
