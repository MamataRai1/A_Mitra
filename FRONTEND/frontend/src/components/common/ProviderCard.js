import React from "react";
import { useNavigate } from "react-router-dom";

function ProviderCard({ service }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/services/${service.id}`);
  };

  const providerName =
    service.provider?.user?.username ||
    service.provider?.user?.first_name ||
    "Provider";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <h3>{service.name}</h3>
      <p style={{ color: "#555", minHeight: "48px" }}>{service.description}</p>
      <p>
        <strong>Hosted by:</strong> {providerName}
      </p>
      <p>
        <strong>Hourly rate:</strong> NPR {service.price}
      </p>

      <button
        onClick={handleView}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: "#7c3aed",
          color: "white",
          border: "none",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        View & Rent
      </button>
    </div>
  );
}

export default ProviderCard;
