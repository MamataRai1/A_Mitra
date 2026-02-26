import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../../api";
import ReportModal from "../../components/common/ReportModal";

function ProviderDashboard() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("overview"); // overview | profile | work | availability | earnings | alerts | location

  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [reports, setReports] = useState([]); // reports I filed
  const [reportsReceived, setReportsReceived] = useState([]); // reports about me
  const [reviews, setReviews] = useState([]); // reviews about my services
  const [locations, setLocations] = useState([]);
  const [alertSummary, setAlertSummary] = useState(null);
  const [alertToast, setAlertToast] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetBooking, setReportTargetBooking] = useState(null);
  const [reportTargets, setReportTargets] = useState([]);
  const [selectedReportTargetId, setSelectedReportTargetId] = useState("");
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [lastLocation, setLastLocation] = useState(null);
  const [sendingLocation, setSendingLocation] = useState(false);

  const geoWatchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);

  // create/edit service form state
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [savingService, setSavingService] = useState(false);
  // inline edit state for existing services
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServicePrice, setEditServicePrice] = useState("");
  const [savingServiceEdit, setSavingServiceEdit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profileId = localStorage.getItem("profile_id");

  // Support deep-link to a specific tab, e.g. /dashboard?tab=availability
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const allowedTabs = [
      "overview",
      "profile",
      "work",
      "availability",
      "earnings",
      "alerts",
      "location",
    ];
    if (tab && allowedTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

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
          alertsPanelRes,
          locationsRes,
        ] = await Promise.all([
          API.get("/bookings/"),
          API.get("/payments/"),
          API.get("/services/"),
          API.get(`/profiles/${profileId}/`),
          API.get("/availability/"),
          API.get("/alerts/panel/"),
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
        setReports(alertsPanelRes.data?.sent_reports || []);
        setReportsReceived(alertsPanelRes.data?.received_reports || []);
        setReviews(alertsPanelRes.data?.reviews || []);
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

  // Poll alert summary periodically for real-time-like alerts
  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;

    const fetchSummary = async () => {
      try {
        const res = await API.get("/alerts/summary/");
        if (cancelled) return;

        const next = res.data;
        // If counts increased compared to last time, show a small toast
        if (alertSummary) {
          const hadNewBooking =
            (next.upcoming_bookings || 0) > (alertSummary.upcoming_bookings || 0);
          const hadNewReport =
            (next.unresolved_reports || 0) > (alertSummary.unresolved_reports || 0);

          if (hadNewBooking) {
            setAlertToast("You have new or updated bookings.");
          } else if (hadNewReport) {
            setAlertToast("A new safety report has been recorded.");
          }
        }

        setAlertSummary(next);
      } catch (err) {
        // Silent fail; dashboard already shows general error if main load fails
        console.error("Failed to load alert summary", err);
      }
    };

    fetchSummary();
    const id = setInterval(fetchSummary, 15000); // every 15s

    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // Load report targets (clients you have bookings with) for Alerts tab
  useEffect(() => {
    if (!profileId) return;

    const loadTargets = async () => {
      try {
        const res = await API.get("/alerts/report-targets/");
        setReportTargets(res.data?.targets || []);
      } catch (err) {
        console.error("Failed to load report targets", err);
      }
    };

    loadTargets();
  }, [profileId]);

  const isDark = theme === "dark";

  const upcomingBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = payments
    .filter((p) => p.status === "completed" || p.status === "pending")
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

  const startEditServicePrice = (service) => {
    setEditingServiceId(service.id);
    setEditServicePrice(String(service.price ?? ""));
  };

  const cancelEditServicePrice = () => {
    setEditingServiceId(null);
    setEditServicePrice("");
  };

  const handleUpdateServicePrice = async (id) => {
    if (!id) return;
    setSavingServiceEdit(true);
    try {
      const res = await API.patch(`/services/${id}/`, {
        price: editServicePrice || "0",
      });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.data } : s))
      );
      setEditingServiceId(null);
      setEditServicePrice("");
    } catch (err) {
      console.error("Failed to update service price", err);
      alert("Could not update price. Please try again.");
    } finally {
      setSavingServiceEdit(false);
    }
  };

  const openReport = (booking) => {
    setReportTargetBooking(booking);
    setReportOpen(true);
  };

  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      const res = await API.patch(`/bookings/${id}/`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...res.data } : b))
      );
      setAlertToast(`Booking marked as ${newStatus}`);
    } catch (err) {
      console.error("Failed to update booking status", err);
      alert("Could not update booking. Please try again.");
    }
  };

  const handleSubmitReport = async ({ reason, description }) => {
    if (!profileId) return;

    const reportedProfileId =
      reportTargetBooking?.client?.id || Number(selectedReportTargetId);
    if (!reportedProfileId) {
      setAlertToast("Please select a user to report.");
      throw new Error("Missing reported user id");
    }

    try {
      await API.post("/reports/", {
        reporter_id: profileId,
        reported_user_id: reportedProfileId,
        booking_id: reportTargetBooking?.id,
        reason,
        description,
      });
      setAlertToast("Safety alert sent to admin for review.");
      setReportOpen(false);
      setReportTargetBooking(null);
      setSelectedReportTargetId("");
    } catch (err) {
      console.error("Failed to submit report", err);
      setAlertToast("Could not send report. Please try again.");
      throw err;
    }
  };

  const postLocation = async ({ latitude, longitude }) => {
    if (!profileId) return;
    setSendingLocation(true);
    try {
      const res = await API.post("/locations/", {
        profile_id: profileId,
        latitude,
        longitude,
      });
      setLastLocation(res.data);
      setLocations((prev) => [res.data, ...prev].slice(0, 25));
      setTrackingError("");
    } catch (err) {
      console.error("Failed to post location", err);
      setTrackingError("Could not send location to server.");
    } finally {
      setSendingLocation(false);
    }
  };

  const startTracking = () => {
    setTrackingError("");
    if (!("geolocation" in navigator)) {
      setTrackingError("Geolocation is not supported in this browser.");
      return;
    }
    if (geoWatchIdRef.current != null) return;

    // Throttle: send at most once every 20 seconds
    const minMs = 20000;

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSentAtRef.current < minMs) return;
        lastSentAtRef.current = now;
        postLocation({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      (err) => {
        console.error("Geolocation error", err);
        setTrackingError(
          err.code === 1
            ? "Permission denied. Allow location access in your browser."
            : "Could not read your location."
        );
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    setTrackingActive(true);
  };

  const stopTracking = () => {
    if (geoWatchIdRef.current != null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    }
    geoWatchIdRef.current = null;
    setTrackingActive(false);
  };

  const logOnce = () => {
    setTrackingError("");
    if (!("geolocation" in navigator)) {
      setTrackingError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        postLocation({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      (err) => {
        console.error("Geolocation error", err);
        setTrackingError(
          err.code === 1
            ? "Permission denied. Allow location access in your browser."
            : "Could not read your location."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Cleanup watch on unmount
  useEffect(() => {
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-gray-900"
          }`}
      >
        Loading provider command center...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-gray-900"
        } transition-colors duration-500`}
    >
      {/* Small floating alert toast */}
      {alertToast && (
        <div className="fixed right-6 top-6 z-40 max-w-xs">
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-medium shadow-lg border ${isDark
              ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-200"
              : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
          >
            {alertToast}
            <button
              type="button"
              onClick={() => setAlertToast(null)}
              className="ml-3 text-[10px] opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={`w-64 border-r h-full fixed inset-y-0 left-0 flex flex-col p-6 backdrop-blur-xl ${isDark ? "bg-[#020617]/95 border-white/10" : "bg-white border-gray-200"
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
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${isDark
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
                        className={`flex items-center justify-between rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
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
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 capitalize font-semibold">
                            {b.status}
                          </span>
                          {b.status === "pending" && (
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                                className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-emerald-500 text-white hover:bg-emerald-400 transition-all"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, "canceled")}
                                className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {b.status === "confirmed" && (
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, "canceled")}
                                className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => openReport(b)}
                            className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all"
                          >
                            🚨 Report
                          </button>
                        </div>
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
                      className={`rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
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
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-lg font-bold">Profile & Identity</h2>
              <Link
                to="/provider/profile"
                className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all inline-block"
              >
                Update profile
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-6 text-sm">
              <div className="space-y-3 md:w-1/3">
                <div className="flex items-center gap-3">
                  {profile?.profile_pic ? (
                    <img
                      src={profile.profile_pic.startsWith("http") ? profile.profile_pic : `http://127.0.0.1:8000${profile.profile_pic.startsWith('/media/') ? '' : '/media/'}${profile.profile_pic.replace(/^\/?media\//, '')}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl font-bold">
                      {profile?.user?.username?.[0]?.toUpperCase() || "P"}
                    </div>
                  )}
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
                    src={profile.kyc_id.startsWith("http") ? profile.kyc_id : `http://127.0.0.1:8000/media/${profile.kyc_id}`}
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
                  If any detail is wrong, use “Update profile” above or contact
                  admin.
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
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none flex-1"
                  >
                    <option value="">Select Category</option>
                    <option value="friend">Friend / Chat</option>
                    <option value="event">Event Partner</option>
                    <option value="travel">Travel Companion</option>
                    <option value="study date">Study Date</option>
                    <option value="movie">Movie Date</option>
                    <option value="picnic">Picnic</option>
                    <option value="restaurant">Dinner / Restaurant</option>
                    <option value="gaming">Gaming Buddy</option>
                  </select>
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
                    className={`rounded-2xl px-3 py-2 flex justify-between gap-3 items-center ${isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                  >
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-[11px] opacity-70 line-clamp-2 max-w-xs">
                        {service.description}
                      </p>
                      {service.category && (
                        <p className="text-[11px] opacity-60 mt-1">
                          Category:{" "}
                          <span className="font-medium">{service.category}</span>
                        </p>
                      )}
                    </div>
                    {editingServiceId === service.id ? (
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[11px] opacity-70 mr-1">
                            Price/hr
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="px-2 py-1 rounded-lg bg-black/20 border border-white/10 outline-none w-24 text-right text-xs"
                            value={editServicePrice}
                            onChange={(e) => setEditServicePrice(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditServicePrice}
                            className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white/5 text-gray-200 hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={savingServiceEdit}
                            onClick={() => handleUpdateServicePrice(service.id)}
                            className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-emerald-500/90 text-white hover:bg-emerald-400 transition-all disabled:opacity-60 disabled:cursor-wait"
                          >
                            {savingServiceEdit ? "Saving..." : "Save price"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm font-bold text-sky-400">
                          NPR {service.price}
                        </p>
                        <p className="text-[11px] opacity-60">per hour</p>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => startEditServicePrice(service)}
                            className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white/5 text-sky-300 hover:bg-white/10 transition-all"
                          >
                            Edit price
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id)}
                            className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
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
            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
              <div>
                <h2 className="text-lg font-bold mb-1">📅 Availability Control</h2>
                <p className="text-xs opacity-70">
                  Set available days &amp; hours and mark busy / unavailable times.
                </p>
              </div>
              <Link
                to="/provider/availability"
                className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all inline-block"
              >
                Open availability settings
              </Link>
            </div>
            <p className="text-xs opacity-70 mb-3">
              These are the active time windows when clients are allowed to book you.
            </p>
            <div className="space-y-2 text-sm">
              {availability
                .filter((slot) => slot.is_active !== false)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex justify-between rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
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
                  .slice(0, 10)
                  .map((p) => (
                    <div
                      key={p.id}
                      className={`flex justify-between rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
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
                        <p className={`font-bold ${p.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                          + NPR {p.amount}
                        </p>
                        <p className="text-[11px] opacity-60 capitalize">
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                {payments.length === 0 && (
                  <p className="text-xs opacity-70">
                    No payments yet. Once bookings are accepted, they’ll show here.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "alerts" && (
          <section className="space-y-4">
            {/* Quick report (from Alerts tab) */}
            <div className={cardClass}>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-bold mb-1">🚨 Report a user</h2>
                  <p className="text-xs opacity-70">
                    If a client shows unpleasant behavior or misleading actions,
                    report them to admin.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!selectedReportTargetId}
                  onClick={() => {
                    setReportTargetBooking(null);
                    setReportOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-red-500/20 text-red-200 text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚨 Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-2">
                    Select a client
                  </p>
                  <select
                    value={selectedReportTargetId}
                    onChange={(e) => setSelectedReportTargetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
                  >
                    <option value="">Choose a client…</option>
                    {reportTargets.map((t) => {
                      const c = t.client;
                      const label =
                        c?.user?.username ||
                        c?.user?.first_name ||
                        `User #${c?.id}`;
                      return (
                        <option key={c.id} value={c.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {reportTargets.length === 0 && (
                    <p className="text-[11px] opacity-70 mt-2">
                      No clients found yet. Once you receive bookings, clients
                      will appear here for reporting.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-1">
                    Tip
                  </p>
                  <p className="text-[11px] opacity-75">
                    If you want to report a specific booking, use the 🚨 Report
                    button from the booking row (Overview → Next bookings or the
                    Bookings page).
                  </p>
                </div>
              </div>
            </div>

            {/* Safety alerts */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold mb-2">Safety alerts</h2>
              <p className="text-xs opacity-70 mb-4">
                Red-flag reports you have sent, and reports where your profile
                has been flagged.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-60">
                    Reports you sent
                  </p>
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
                        }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mb-1">
                        {r.reason.replace("_", " ")}
                      </p>
                      <p className="text-xs mb-1">
                        Status:{" "}
                        <span className="font-semibold capitalize">
                          {r.status}
                        </span>
                      </p>
                      {r.action_taken && r.action_taken !== 'none' && (
                        <p className={`text-[11px] font-bold mt-1 ${r.action_taken === 'fine' || r.action_taken === 'suspension' ? 'text-red-400' : 'text-orange-400'
                          }`}>
                          Action Taken: <span className="uppercase tracking-widest">{r.action_taken}</span>
                          {r.action_taken === 'fine' ? ` (NPR ${r.fine_amount})` : ''}
                        </p>
                      )}
                      <p className="text-[11px] opacity-60 line-clamp-2 mt-1">
                        {r.description || "No extra description."}
                      </p>
                      {r.admin_note && (
                        <p className="text-[11px] font-medium text-yellow-300/80 mt-1 italic">
                          Admin note: "{r.admin_note}"
                        </p>
                      )}
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <p className="text-xs opacity-70">
                      You haven’t filed any safety alerts yet. Use the 🚨 Report
                      button on bookings whenever you notice unsafe behavior.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-60">
                    Reports about you
                  </p>
                  {reportsReceived.map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
                        }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mb-1">
                        {r.reason.replace("_", " ")}
                      </p>
                      <p className="text-[11px] opacity-60 mb-1">
                        From:{" "}
                        <span className="font-semibold">
                          {r.reporter?.user?.username ||
                            r.reporter?.user?.first_name ||
                            "User"}
                        </span>
                      </p>
                      <p className="text-xs mb-1">
                        Status:{" "}
                        <span className="font-semibold capitalize">
                          {r.status}
                        </span>
                      </p>
                      {r.action_taken && r.action_taken !== 'none' && (
                        <p className={`text-[11px] font-bold mt-1 ${r.action_taken === 'fine' || r.action_taken === 'suspension' ? 'text-red-400' : 'text-orange-400'
                          }`}>
                          Action Taken: <span className="uppercase tracking-widest">{r.action_taken}</span>
                          {r.action_taken === 'fine' ? ` (NPR ${r.fine_amount})` : ''}
                        </p>
                      )}
                      <p className="text-[11px] opacity-60 line-clamp-2 mt-1">
                        {r.description || "No description was provided."}
                      </p>
                      {r.admin_note && (
                        <p className="text-[11px] font-medium text-yellow-300/80 mt-1 italic">
                          Admin note: "{r.admin_note}"
                        </p>
                      )}
                    </div>
                  ))}
                  {reportsReceived.length === 0 && (
                    <p className="text-xs opacity-70">
                      There are currently no safety alerts involving your
                      profile. Keep following platform safety guidelines.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className={cardClass}>
              <h2 className="text-lg font-bold mb-2">Client reviews</h2>
              <p className="text-xs opacity-70 mb-4">
                Feedback left by clients after completed bookings of your
                services.
              </p>
              <div className="space-y-2 text-sm">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-2xl px-3 py-2 ${isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-xs">
                        {rev.booking?.service?.name || "Service"}
                      </p>
                      <p className="text-[11px] font-bold text-yellow-300">
                        {rev.rating}/5
                      </p>
                    </div>
                    <p className="text-[11px] opacity-60 mb-1">
                      Client:{" "}
                      <span className="font-medium">
                        {rev.booking?.client?.user?.username ||
                          rev.booking?.client?.user?.first_name ||
                          "Client"}
                      </span>
                    </p>
                    <p className="text-[11px] opacity-70 line-clamp-3">
                      {rev.comment || "No written comment."}
                    </p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-xs opacity-70">
                    You don’t have any reviews yet. Once clients complete
                    bookings and leave feedback, it will appear here.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "location" && (
          <section className={cardClass}>
            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
              <div>
                <h2 className="text-lg font-bold mb-1">📍 Location tracker</h2>
                <p className="text-xs opacity-70">
                  Share your GPS location when needed for safety tools. You can
                  log once or enable live tracking.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={logOnce}
                  disabled={sendingLocation}
                  className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {sendingLocation ? "Sending..." : "Log now"}
                </button>
                {trackingActive ? (
                  <button
                    type="button"
                    onClick={stopTracking}
                    className="px-4 py-2 rounded-2xl bg-red-500/20 text-red-200 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Stop tracking
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startTracking}
                    className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-200 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    Start tracking
                  </button>
                )}
              </div>
            </div>

            {trackingError && (
              <div
                className={`mb-4 rounded-2xl border px-4 py-3 text-xs ${isDark
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-red-200 bg-red-50 text-red-700"
                  }`}
              >
                {trackingError}
              </div>
            )}

            {(lastLocation || locations[0]) && (
              <div
                className={`mb-4 rounded-2xl px-4 py-3 border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"
                  }`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-1">
                  Latest location
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-semibold">
                      {(lastLocation || locations[0])?.latitude},{" "}
                      {(lastLocation || locations[0])?.longitude}
                    </p>
                    <p className="text-[11px] opacity-60">
                      {new Date(
                        (lastLocation || locations[0])?.logged_at
                      ).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${(lastLocation || locations[0])?.latitude},${(lastLocation || locations[0])?.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-sky-300 hover:text-sky-200"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`rounded-2xl px-3 py-2 flex justify-between ${isDark ? "bg-white/5" : "bg-gray-50"
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
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-sky-300 hover:text-sky-200"
                  >
                    View
                  </a>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-xs opacity-70">
                  No location logs yet. Click “Log now” to send your current
                  location, or “Start tracking” to keep sending updates.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        targetLabel={
          reportTargetBooking?.client?.user?.username ||
          reportTargetBooking?.client?.user?.first_name ||
          "Client"
        }
      />
    </div>
  );
}

const SidebarItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${active
      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/40"
      : "text-gray-400 hover:bg-indigo-500/10 hover:text-white"
      }`}
  >
    {label}
  </button>
);

const OverviewStat = ({ isDark, label, value, caption }) => (
  <div
    className={`rounded-[20px] border p-4 md:p-5 ${isDark
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
