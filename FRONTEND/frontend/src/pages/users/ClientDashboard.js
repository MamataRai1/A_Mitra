import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import SearchPanel from "../../components/common/SearchPanel";
import ProviderCard from "../../components/common/ProviderCard";
import Footer from "../../components/common/Footer";
import API from "../../api";

function ClientDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await API.get("/services/");
        setProviders(res.data || []);
      } catch (err) {
        console.error("Failed to load services", err);
        setError("Unable to load providers. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  return (
    <div style={{ background: "#f8f6ff" }}>
      <ClientNavbar />
      <SearchPanel />

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Available Companions</h2>

        {loading && <p>Loading providers...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {!loading && !error && providers.map(service => (
            <ProviderCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ClientDashboard;
