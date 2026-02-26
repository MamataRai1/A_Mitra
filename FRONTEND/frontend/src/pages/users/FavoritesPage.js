import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await API.get("/favorites/");
        setFavorites(res.data || []);
      } catch (err) {
        console.error("Failed to load favorites", err);
        setError("Unable to load favorites. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const handleRemove = async (favoriteId) => {
    try {
      await API.delete(`/favorites/${favoriteId}/`);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (err) {
      console.error("Failed to remove favorite", err);
      alert("Could not remove this favorite. Please try again.");
    }
  };

  return (
    <div style={{ background: "#f8f6ff", minHeight: "100vh" }}>
      <ClientNavbar />

      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Your Favorites</h1>
        {loading && <p>Loading favorites...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <p>You have not added any favorites yet.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {favorites.map((fav) => {
            const serviceName = fav.service?.name || "Service";
            const providerName =
              fav.service?.provider?.user?.username ||
              fav.provider?.user?.username ||
              "Provider";

            // Safe Image parsing
            let pic = fav.service?.provider?.profile_pic || fav.provider?.profile_pic || null;
            let avatarUrl = pic;
            if (pic) {
              if (!pic.startsWith("http")) {
                avatarUrl = `http://127.0.0.1:8000${pic.startsWith('/media/') ? '' : '/media/'}${pic.replace(/^\/?media\//, '')}`;
              }
            } else {
              avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(providerName)}&backgroundColor=e2e8f0`;
            }

            return (
              <div
                key={fav.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "18px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <img src={avatarUrl} alt={providerName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ marginBottom: "2px", fontSize: "16px" }}>{serviceName}</h3>
                    <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                      by <strong>{providerName}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(fav.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: '100%'
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default FavoritesPage;

