import React, { useEffect, useMemo, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import SearchPanel from "../../components/common/SearchPanel";
import ProviderCard from "../../components/common/ProviderCard";
import Footer from "../../components/common/Footer";
import API from "../../api";

function ClientDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    serviceType: "",
  });
  const [sortBy, setSortBy] = useState("relevance"); // relevance | priceLow | priceHigh

  const username = localStorage.getItem("username") || "friend";

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await API.get("/services/");
        setServices(res.data || []);
      } catch (err) {
        console.error("Failed to load services", err);
        setError(
          "Unable to load companions. Please check if the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const handleFiltersChange = (next) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const handleSearchSubmit = () => {
    // No-op for now; filtering is live as you type.
  };

  // Shuffle services once for recommendations
  const recommendedServices = useMemo(() => {
    if (!services.length) return [];
    const copy = [...services];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 6);
  }, [services]);

  const filteredServices = useMemo(() => {
    let result = [...services];
    const query = filters.search.trim().toLowerCase();
    const type = filters.serviceType.trim().toLowerCase();

    if (query) {
      result = result.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        const provider =
          (s.provider?.user?.username ||
            s.provider?.user?.first_name ||
            ""
          ).toLowerCase();
        return (
          name.includes(query) ||
          desc.includes(query) ||
          provider.includes(query)
        );
      });
    }

    if (type) {
      const cat = type;
      result = result.filter((s) =>
        (s.category || "").toLowerCase().includes(cat)
      );
    }

    if (sortBy === "priceLow") {
      result.sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (sortBy === "priceHigh") {
      result.sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    }

    return result;
  }, [services, filters, sortBy]);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <ClientNavbar />

      {/* Hero */}
      <header className="px-6 md:px-10 pt-8 pb-6 md:pb-10 max-w-6xl mx-auto">
        <div className="rounded-[26px] bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-sky-500/10 border border-indigo-500/40 px-6 md:px-10 py-6 md:py-8 shadow-[0_18px_60px_rgba(15,23,42,0.65)]">
          <p className="text-[11px] tracking-[0.24em] uppercase font-black text-indigo-200/80 mb-2">
            Companion Command Center
          </p>
          <h1 className="text-2xl md:text-3xl font-black mb-2">
            Welcome back, {username}.
          </h1>
          <p className="text-xs md:text-sm text-indigo-100/90 max-w-2xl">
            Discover trusted companions for movies, city walks, study sessions,
            and more — all in one place.
          </p>
        </div>
      </header>

      {/* Search + filters */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 mb-6">
        <SearchPanel
          filters={filters}
          onChange={handleFiltersChange}
          onSubmit={handleSearchSubmit}
        />
      </section>

      {/* Recommended row */}
      <main className="max-w-6xl mx-auto px-6 md:px-10 pb-10 space-y-8">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold">
                Recommended for you
              </h2>
              <p className="text-xs opacity-70">
                A quick preview of companions you might like.
              </p>
            </div>
            <p className="text-[11px] opacity-60">
              Showing {recommendedServices.length} of {services.length} services
            </p>
          </div>

          {loading && (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className="w-64 h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && !error && recommendedServices.length === 0 && (
            <p className="text-xs opacity-70">
              Once providers list services, recommendations will appear here.
            </p>
          )}

          {!loading && !error && recommendedServices.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommendedServices.map((service) => (
                <div key={service.id} className="min-w-[260px] max-w-xs">
                  <ProviderCard service={service} variant="compact" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Explore all services */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold">
                Explore all companions
              </h2>
              <p className="text-xs opacity-70">
                Use filters to find the right match for your vibe.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="priceLow">Price: Low to high</option>
                <option value="priceHigh">Price: High to low</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-2xl px-4 py-3">
              {error}
            </p>
          )}

          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={i}
                  className="h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredServices.length === 0 && (
            <p className="text-xs opacity-70">
              No companions match these filters yet. Try clearing the search or
              choosing a different category.
            </p>
          )}

          {!loading && !error && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <ProviderCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ClientDashboard;
