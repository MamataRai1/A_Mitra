import React, { useEffect, useMemo, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import SearchPanel from "../../components/common/SearchPanel";
import ProviderCard from "../../components/common/ProviderCard";
import Footer from "../../components/common/Footer";
import ReviewModal from "../../components/common/ReviewModal";
import API from "../../api";
import { Link } from "react-router-dom";

function ClientDashboard() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    serviceType: "",
    date: "",
  });
  const [sortBy, setSortBy] = useState("relevance"); // relevance | priceLow | priceHigh

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servRes, bookRes, settingsRes] = await Promise.all([
          API.get("/services/"),
          // Fetch bookings for the logged-in user
          API.get("/bookings/").catch(() => ({ data: [] })),
          API.get("/settings/").catch(() => ({ data: [] }))
        ]);
        setServices(servRes.data || []);

        const catSetting = (settingsRes.data || []).find(s => s.key === 'service_categories');
        if (catSetting && catSetting.value) {
          setCategories(catSetting.value);
        } else {
          setCategories(["Friend / Chat", "Event Partner", "Travel Companion", "Study Date", "Movie Date", "Picnic", "Dinner / Restaurant", "Gaming Buddy"]);
        }

        // Filter bookings to show pending/confirmed/completed ones on the dashboard
        const activeBookings = (bookRes.data || []).filter(
          (b) => b.status === "pending" || b.status === "confirmed" || b.status === "completed"
        );
        // Sort activeBookings by date descending
        activeBookings.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
        setBookings(activeBookings);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(
          "Unable to load companions. Please check if the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openReview = (booking) => {
    setReviewTarget(booking);
    setReviewOpen(true);
    setReviewMessage("");
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!reviewTarget) return;
    try {
      await API.post("/reviews/", {
        booking_id: reviewTarget.id,
        rating,
        comment,
      });

      // Optimistically update the booking in state to hide the review button
      setBookings((prev) =>
        prev.map((b) => (b.id === reviewTarget.id ? { ...b, has_review: true } : b))
      );

      setReviewMessage("Review submitted successfully! Thank you.");
      setReviewOpen(false);
    } catch (err) {
      console.error("Failed to submit review", err);
      setReviewMessage("Could not submit review. You may have already reviewed this booking.");
      throw err;
    }
  };

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



    const query = (filters.search || "").trim().toLowerCase();
    const type = (filters.serviceType || "").trim().toLowerCase();
    const searchDate = filters.date || "";

    // Filter by Search text (checks service name, provider username, or provider address/location)
    if (query) {
      result = result.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const address = (s.provider?.address || "").toLowerCase();
        const providerName = (s.provider?.user?.username || s.provider?.user?.first_name || "").toLowerCase();
        return (
          name.includes(query) ||
          address.includes(query) ||
          providerName.includes(query)
        );
      });
    }

    // Filter by Service Type / Category dropdown
    if (type) {
      result = result.filter((s) =>
        (s.category || "").toLowerCase().includes(type)
      );
    }

    // Filter by Availability Date
    if (searchDate) {
      try {
        const selectedDate = new Date(searchDate).toISOString().split("T")[0]; // YYYY-MM-DD
        result = result.filter((s) => {
          const availabilitySlots = s.provider?.availability || [];
          // Provider is available if they have at least one active slot on the exact selected date
          return availabilitySlots.some(
            (slot) => slot.is_active && slot.date === selectedDate
          );
        });
      } catch (err) {
        console.error("Invalid date filter", err);
      }
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

  const isSearching = !!(filters.search?.trim() || filters.serviceType?.trim() || filters.date);

  // Status Badge Helper for Upcoming Bookings
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px] uppercase tracking-wider">{status}</span>;
      case "confirmed":
        return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[10px] uppercase tracking-wider">Approved</span>;
      case "canceled":
        return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[10px] uppercase tracking-wider">Canceled</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 font-bold text-[10px] uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] text-slate-900 duration-500">
      <ClientNavbar />

      <main className="flex-grow w-full pt-16">
        {/* Premium Hero Section */}
        <section className="px-6 md:px-10 pt-8 pb-10 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 px-8 md:px-12 py-10 md:py-14 shadow-2xl shadow-indigo-500/5">
            {/* Background Ornaments */}
            <div className="absolute -right-20 -top-40 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] tracking-[0.2em] uppercase font-black text-indigo-600 mb-6">
                Companion Command Center
              </span>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900">
                Find the perfect companion for your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">next adventure.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
                Discover trusted professionals for city walks, dining out, events, and more. Authentic connections exactly when you need them.
              </p>
            </div>
          </div>
        </section>

        {/* Search Panel */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 mb-8 relative z-20 -mt-10">
          <SearchPanel
            filters={filters}
            onChange={handleFiltersChange}
            onSubmit={handleSearchSubmit}
            categories={categories}
          />
        </section>

        {/* Upcoming Bookings Widget */}
        {!isSearching && bookings.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 md:px-10 mb-16">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="text-3xl">📅</span> Recent & Upcoming Dates
              </h2>
              <Link to="/bookings" className="text-sm font-bold text-indigo-500 hover:text-indigo-600 px-4 py-2 bg-indigo-50 rounded-full transition-colors">
                View all bookings →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.slice(0, 3).map((b) => {
                const dateObj = new Date(b.booking_date);
                const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                return (
                  <div key={b.id} className="group relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 border backdrop-blur-xl bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-indigo-200 hover:shadow-indigo-500/10 flex flex-col justify-between">
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        {getStatusBadge(b.status)}
                      </div>
                      <h3 className="font-bold text-xl text-slate-900 truncate mb-1">{b.service?.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 mb-6">
                        with <span className="text-indigo-600">{b.service?.provider?.user?.username || "Provider"}</span>
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                          <span>{dateStr}</span>
                          <span className="text-slate-300">•</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>

                      {b.status === "completed" && !b.has_review && (
                        <button
                          type="button"
                          onClick={() => openReview(b)}
                          className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 font-bold text-sm transition-all shadow-xl shadow-purple-500/30 transform hover:-translate-y-0.5"
                        >
                          ⭐ Leave a Review
                        </button>
                      )}

                      {b.status === "completed" && b.has_review && (
                        <div className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-full bg-slate-100 text-slate-500 font-bold text-sm transition-all border border-slate-200">
                          ✅ Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended Row */}
        {!isSearching && (
          <section className="max-w-7xl mx-auto px-6 md:px-10 mb-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black">
                  Recommended for you
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Hand-picked companions matching your vibe.
                </p>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                {recommendedServices.length} Selected
              </p>
            </div>

            {loading && (
              <div className="flex gap-6 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[280px] h-[320px] rounded-[24px] bg-slate-200 animate-pulse border border-slate-100"
                  />
                ))}
              </div>
            )}

            {!loading && !error && recommendedServices.length === 0 && (
              <div className="text-center py-12 rounded-[24px] border bg-white border-slate-200">
                <p className="text-slate-500 font-medium">Once providers list services, recommendations will magically appear here. ✨</p>
              </div>
            )}

            {!loading && !error && recommendedServices.length > 0 && (
              <div className="flex gap-6 overflow-x-auto pb-6 px-2 -mx-2 snap-x">
                {recommendedServices.map((service) => (
                  <div key={service.id} className="min-w-[280px] max-w-[320px] snap-start">
                    <ProviderCard service={service} variant="compact" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Explore All Services */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black">
                {isSearching ? "Search Results" : "Explore all companions"}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {isSearching ? `Found ${filteredServices.length} matching services.` : "Use filters to find the right match for your vibe."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold outline-none text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="priceLow">Price: Low to high</option>
                  <option value="priceHigh">Price: High to low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl mb-8 font-medium shadow-lg shadow-red-500/5">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] rounded-[24px] bg-slate-200 animate-pulse border border-slate-100"
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="text-center py-20 rounded-[32px] border bg-white border-slate-200 shadow-xl shadow-slate-200/40">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold mb-2 text-slate-900">No companions found</h3>
              <p className="text-slate-500">
                No companions match these filters yet. Try clearing the search or choosing a different category.
              </p>
              <button
                onClick={() => setFilters({ search: "", serviceType: "", date: "" })}
                className="mt-6 font-bold text-indigo-600 hover:text-indigo-500 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && !error && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ProviderCard key={service.id} service={service} variant="normal" />
              ))}
            </div>
          )}
        </section>
      </main>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={handleSubmitReview}
        targetLabel={reviewTarget?.service?.name}
      />
      <Footer />
    </div>
  );
}

export default ClientDashboard;
