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

  const avatarUrl = service.provider?.profile_pic
    ? `http://127.0.0.1:8000${service.provider.profile_pic}`
    : null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
          gap: "10px",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={providerName}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#4c1d95",
            }}
          >
            {providerName[0]?.toUpperCase() || "P"}
          </div>
        )}
        <div>
          <h3 style={{ margin: 0 }}>{service.name}</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            Hosted by <strong>{providerName}</strong>
          </p>
        </div>
      </div>

      <p style={{ color: "#555", minHeight: "48px", marginBottom: "8px" }}>
        {service.description}
      </p>
      <p style={{ marginBottom: "4px" }}>
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
