import React from "react";
import { useNavigate } from "react-router-dom";

function ClientNavbar() {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 40px",
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{ color: "#7c3aed", cursor: "pointer" }}
        onClick={() => goTo("/dashboard")}
      >
        Companion Rental
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <button style={btn} onClick={() => goTo("/dashboard")}>
          Browse
        </button>
        <button style={btn} onClick={() => goTo("/favorites")}>
          Favorites
        </button>
        <button style={btn} onClick={() => goTo("/bookings")}>
          Bookings
        </button>
        <button
          style={{ ...btn, color: "#ef4444" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const btn = {
  border: "none",
  background: "transparent",
  fontWeight: "600",
  cursor: "pointer",
};

export default ClientNavbar;
