import React, { useEffect, useState } from "react";
import API from "../../api";

function ProviderDashboard() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("overview"); // overview | profile | work | availability | earnings | alerts | location

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [reports, setReports] = useState([]);
  const [locations, setLocations] = useState([]);

  // create/edit service form state
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [savingService, setSavingService] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profileId = localStorage.getItem("profile_id");

  useEffect(() => {
    const loadAll = async () => {
      if (!profileId) return;
      try {
        const [
          bookingsRes,
          paymentsRes,
          servicesRes,
          profileRes,
          availabilityRes,
          reportsRes,
          locationsRes,
        ] = await Promise.all([
          API.get("/bookings/"),
          API.get("/payments/"),
          API.get("/services/"),
          API.get(`/profiles/${profileId}/`),
          API.get("/availability/"),
          API.get("/reports/"),
          API.get("/locations/"),
        ]);

        const allBookings = bookingsRes.data || [];
        const allPayments = paymentsRes.data || [];
        const allServices = servicesRes.data || [];

        const myServices = allServices.filter(
          (s) => s.provider && String(s.provider.id) === String(profileId)
        );
        const myBookings = allBookings.filter(
          (b) =>
            b.service &&
            b.service.provider &&
            String(b.service.provider.id) === String(profileId)
        );
        const myPayments = allPayments.filter(
          (p) =>
            p.booking &&
            p.booking.service &&
            p.booking.service.provider &&
            String(p.booking.service.provider.id) === String(profileId)
        );

        setServices(myServices);
        setBookings(myBookings);
        setPayments(myPayments);
        setProfile(profileRes.data);
        setAvailability(availabilityRes.data || []);
        setReports(reportsRes.data || []);
        setLocations(locationsRes.data || []);
      } catch (err) {
        console.error("Failed to load provider dashboard data", err);
        setError(
          "Unable to load provider data. Please check the backend and your provider login."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [profileId]);

  const isDark = theme === "dark";

  const upcomingBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(2);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const cardClass =
    "rounded-[24px] border p-6 md:p-7 " +
    (isDark
      ? "bg-[#111827]/80 border-white/10"
      : "bg-white border-gray-200 shadow-sm");

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!profileId) return;
    setSavingService(true);
    try {
      const res = await API.post("/services/", {
        provider_id: profileId,
        name: newServiceName,
        description: newServiceDescription,
        category: newServiceCategory,
        price: newServicePrice || "0",
        is_active: true,
      });
      setServices((prev) => [...prev, res.data]);
      setNewServiceName("");
      setNewServiceDescription("");
      setNewServiceCategory("");
      setNewServicePrice("");
    } catch (err) {
      console.error("Failed to create service", err);
      alert("Could not create service. Please check your inputs.");
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await API.delete(`/services/${id}/`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete service", err);
      alert("Could not delete service. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        Loading provider command center...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-500`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 border-r h-full fixed inset-y-0 left-0 flex flex-col p-6 backdrop-blur-xl ${
          isDark ? "bg-[#020617]/95 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/40">
            P
          </div>
          <div>
            <p className="text-[10px] tracking-[0.22em] font-black uppercase opacity-60">
              Provider
            </p>
            <p className="text-sm font-bold">
              {profile?.user?.username || "Your Space"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-semibold">
          <SidebarItem
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarItem
            label="Profile & ID"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SidebarItem
            label="My Work / Services"
            active={activeTab === "work"}
            onClick={() => setActiveTab("work")}
          />
          <SidebarItem
            label="Availability"
            active={activeTab === "availability"}
            onClick={() => setActiveTab("availability")}
          />
          <SidebarItem
            label="Earnings"
            active={activeTab === "earnings"}
            onClick={() => setActiveTab("earnings")}
          />
          <SidebarItem
            label="Alerts & Reviews"
            active={activeTab === "alerts"}
            onClick={() => setActiveTab("alerts")}
          />
          <SidebarItem
            label="Location Tracker"
            active={activeTab === "location"}
            onClick={() => setActiveTab("location")}
          />
        </nav>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full px-4 py-2 rounded-2xl border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/10 transition-all"
          >
            {isDark ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-2xl border border-red-400/40 text-xs font-bold flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 md:p-10">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase font-black opacity-60">
              Provider Command Center
            </p>
            <h1 className="text-2xl md:text-3xl font-black mt-1">
              Welcome back, {profile?.user?.first_name || profile?.user?.username}
            </h1>
            <p className="text-xs md:text-sm opacity-70 mt-2">
              Manage your work, identity, earnings, and safety tools from one
              place.
            </p>
          </div>
        </header>

        {error && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              isDark
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* TABS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <section
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}
            >
              <OverviewStat
                isDark={isDark}
                label="Active services"
                value={services.length}
                caption="Listed & visible to clients"
              />
              <OverviewStat
                isDark={isDark}
                label="Upcoming bookings"
                value={upcomingBookings.length}
                caption="Pending & confirmed"
              />
              <OverviewStat
                isDark={isDark}
                label="Completed sessions"
                value={completedBookings.length}
                caption="Great job keeping people safe"
              />
              <OverviewStat
                isDark={isDark}
                label="Total earnings"
                value={`NPR ${totalEarnings}`}
                caption="Completed payments"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={cardClass}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-bold">Next bookings</h2>
                  <span className="text-[11px] opacity-60">
                    {upcomingBookings.length} scheduled
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {upcomingBookings.slice(0, 5).map((b) => {
                    const clientName =
                      b.client?.user?.username ||
                      b.client?.user?.first_name ||
                      "Client";
                    const date = b.booking_date
                      ? new Date(b.booking_date).toLocaleString()
                      : "N/A";
                    return (
                      <div
                        key={b.id}
                        className={`flex items-center justify-between rounded-2xl px-3 py-2 ${
                          isDark ? "bg-white/5" : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">
                            {b.service?.name || "Service"}
                          </p>
                          <p className="text-[11px] opacity-70">
                            with <span className="font-medium">{clientName}</span>
                          </p>
                          <p className="text-[11px] opacity-60">{date}</p>
                        </div>
                        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 capitalize font-semibold">
                          {b.status}
                        </span>
                      </div>
                    );
                  })}
                  {upcomingBookings.length === 0 && (
                    <p className="text-xs opacity-70">
                      No upcoming bookings yet. When clients book you, they’ll
                      appear here.
                    </p>
                  )}
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-bold">Safety alerts & reviews</h2>
                  <span className="text-[11px] opacity-60">
                    {reports.length} alerts
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {reports.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-2xl px-3 py-2 ${
                        isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mb-1">
                        {r.reason.replace("_", " ")}
                      </p>
                      <p className="text-xs">
                        Status:{" "}
                        <span className="font-semibold capitalize">
                          {r.status}
                        </span>
                      </p>
                      <p className="text-[11px] opacity-60 mt-1 line-clamp-2">
                        {r.description || "No additional details."}
                      </p>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <p className="text-xs opacity-70">
                      No safety alerts yet. Use the 🚨 Report button on bookings if
                      you feel unsafe.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "profile" && (
          <section className={cardClass}>
            <h2 className="text-lg font-bold mb-4">Profile & Identity</h2>
            <div className="flex flex-col md:flex-row gap-6 text-sm">
              <div className="space-y-3 md:w-1/3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl font-bold">
                    {profile?.user?.username?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {profile?.user?.first_name || profile?.user?.username}
                    </p>
                    <p className="text-xs opacity-60">{profile?.user?.email}</p>
                  </div>
                </div>
                <p className="text-xs opacity-70">
                  Phone:{" "}
                  <span className="font-medium">
                    {profile?.phone_number || "Not set"}
                  </span>
                </p>
                <p className="text-xs opacity-70">
                  Address:{" "}
                  <span className="font-medium">
                    {profile?.address || "Not set"}
                  </span>
                </p>
                <p className="text-xs opacity-70">
                  Verification:{" "}
                  <span className="font-semibold">
                    {profile?.is_verified ? "KYC verified" : "Pending KYC review"}
                  </span>
                </p>
              </div>

              <div className="space-y-3 md:flex-1">
                <p className="text-[11px] uppercase tracking-[0.22em] opacity-60">
                  KYC document preview
                </p>
                {profile?.kyc_id ? (
                  <img
                    src={`http://127.0.0.1:8000${profile.kyc_id}`}
                    alt="KYC"
                    className="w-full max-h-64 object-cover rounded-2xl border border-white/10"
                  />
                ) : (
                  <p className="text-xs opacity-70">
                    You have not uploaded a KYC document from this side. Admin
                    may have it already from registration.
                  </p>
                )}
                <p className="text-[11px] opacity-60">
                  If any detail is wrong, contact admin or update from your
                  registration flow.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "work" && (
          <section className="space-y-4">
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold">My Services / Work</h2>
                  <p className="text-xs opacity-70">
                    These are the experiences clients can book with you.
                  </p>
                </div>
              </div>
              {/* Create new service */}
              <form
                onSubmit={handleCreateService}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-xs"
              >
                <input
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Service name"
                  className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
                />
                <input
                  required
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder="Short description"
                  className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none md:col-span-2"
                />
                <div className="flex gap-2">
                  <input
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    placeholder="Category"
                    className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="Price/hr"
                    className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none w-24"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingService}
                  className="md:col-span-4 mt-1 px-4 py-2 rounded-2xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-wait"
                >
                  {savingService ? "Saving..." : "Add New Service"}
                </button>
              </form>

              <div className="space-y-2 text-sm">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-2xl px-3 py-2 flex justify-between gap-3 items-center ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-[11px] opacity-70 line-clamp-2 max-w-xs">
                        {service.description}
                      </p>
                      {service.category && (
                        <p className="text-[11px] opacity-60 mt-1">
                          Category: <span className="font-medium">{service.category}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-sky-400">
                        NPR {service.price}
                      </p>
                      <p className="text-[11px] opacity-60">per hour</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id)}
                        className="mt-2 px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-xs opacity-70">
                    No services yet. Ask your admin or add services from the
                    backend admin if needed.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "availability" && (
          <section className={cardClass}>
            <h2 className="text-lg font-bold mb-2">Availability summary</h2>
            <p className="text-xs opacity-70 mb-4">
              These are the time windows when clients are allowed to book you.
            </p>
            <div className="space-y-2 text-sm">
              {availability.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex justify-between rounded-2xl px-3 py-2 ${
                    isDark ? "bg-white/5" : "bg-gray-50"
                  }`}
                >
                  <span>
                    <span className="font-semibold">{slot.day}</span> •{" "}
                    {slot.start_time} – {slot.end_time}
                  </span>
                  <span className="text-[11px] opacity-60">Active</span>
                </div>
              ))}
              {availability.length === 0 && (
                <p className="text-xs opacity-70">
                  You have not defined any availability slots yet. Use the
                  separate Availability page or contact admin to configure
                  schedule.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "earnings" && (
          <section className="space-y-4">
            <div className={cardClass}>
              <h2 className="text-lg font-bold mb-2">Earnings dashboard</h2>
              <p className="text-xs opacity-70 mb-4">
                Overview of completed payments linked to your bookings.
              </p>
              <div className="text-sm space-y-2">
                <p className="text-base font-bold">
                  Total: <span className="text-sky-400">NPR {totalEarnings}</span>
                </p>
                {payments
                  .filter((p) => p.status === "completed")
                  .slice(0, 10)
                  .map((p) => (
                    <div
                      key={p.id}
                      className={`flex justify-between rounded-2xl px-3 py-2 ${
                        isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">
                          {p.booking?.service?.name || "Service"}
                        </p>
                        <p className="text-[11px] opacity-70">
                          Booking ID #{p.booking?.id} • Method {p.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">
                          + NPR {p.amount}
                        </p>
                        <p className="text-[11px] opacity-60 capitalize">
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                {payments.filter((p) => p.status === "completed").length ===
                  0 && (
                  <p className="text-xs opacity-70">
                    No completed payments yet. Once bookings are finished and
                    marked as paid, they’ll show here.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "alerts" && (
          <section className="space-y-4">
            <div className={cardClass}>
              <h2 className="text-lg font-bold mb-2">Safety alerts</h2>
              <p className="text-xs opacity-70 mb-4">
                All security reports (red flags) you have sent or received on
                this account.
              </p>
              <div className="space-y-2 text-sm">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-2xl px-3 py-2 ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mb-1">
                      {r.reason.replace("_", " ")}
                    </p>
                    <p className="text-xs">
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {r.status}
                      </span>
                    </p>
                    <p className="text-[11px] opacity-60 mt-1 line-clamp-2">
                      {r.description || "No extra description."}
                    </p>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-xs opacity-70">
                    You have no safety alerts yet. Use the 🚨 Report button on
                    bookings whenever you notice unsafe behavior.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "location" && (
          <section className={cardClass}>
            <h2 className="text-lg font-bold mb-2">Location tracker</h2>
            <p className="text-xs opacity-70 mb-4">
              Recent GPS logs connected to your account. This helps admins keep
              the platform safe when you trigger alerts.
            </p>
            <div className="space-y-2 text-sm">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`rounded-2xl px-3 py-2 flex justify-between ${
                    isDark ? "bg-white/5" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      {loc.latitude}, {loc.longitude}
                    </p>
                    <p className="text-[11px] opacity-60">
                      {new Date(loc.logged_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[11px] opacity-60">
                    Linked to safety tools
                  </span>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-xs opacity-70">
                  No location logs have been recorded yet. Once you integrate GPS
                  tracking on mobile, logs will appear here.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const SidebarItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
      active
        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/40"
        : "text-gray-400 hover:bg-indigo-500/10 hover:text-white"
    }`}
  >
    {label}
  </button>
);

const OverviewStat = ({ isDark, label, value, caption }) => (
  <div
    className={`rounded-[20px] border p-4 md:p-5 ${
      isDark
        ? "bg-[#020617]/80 border-indigo-500/30"
        : "bg-white border-indigo-200 shadow-sm"
    }`}
  >
    <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">
      {label}
    </p>
    <p className="text-xl md:text-2xl font-black">{value}</p>
    <p className="text-[11px] opacity-60 mt-1">{caption}</p>
  </div>
);

export default ProviderDashboard;
