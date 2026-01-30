import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import SearchPanel from "../../components/common/SearchPanel";
import ProviderCard from "../../components/common/ProviderCard";
import Footer from "../../components/common/Footer";

function ClientDashboard() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/services/")
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(() => console.log("Backend not connected yet"));
  }, []);

  return (
    <div style={{ background: "#f8f6ff" }}>
      <ClientNavbar />
      <SearchPanel />

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Available Providers</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {providers.map(service => (
            <ProviderCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ClientDashboard;
