import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

function ClientNavbar() {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const profileId = localStorage.getItem("profile_id");
      if (profileId) {
        try {
          const res = await API.get(`/profiles/${profileId}/`);
          setProfilePic(res.data.profile_pic);
          setUsername(res.data.user?.username || "");
        } catch (err) {
          console.error("Failed to fetch profile for navbar", err);
        }
      }
    };
    fetchProfile();
  }, []);

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

        {/* Profile Icon */}
        <div
          onClick={() => goTo("/profile")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #c084fc)", overflow: "hidden", border: "2px solid #e0e7ff" }}
          title={username || "Profile"}
        >
          {profilePic ? (
            <img
              src={profilePic.startsWith("http") ? profilePic : `http://127.0.0.1:8000/media/${profilePic}`}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>
              {username ? username[0].toUpperCase() : "U"}
            </span>
          )}
        </div>

        <button
          style={{
            ...btn,
            background: "#ef4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)"
          }}
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
