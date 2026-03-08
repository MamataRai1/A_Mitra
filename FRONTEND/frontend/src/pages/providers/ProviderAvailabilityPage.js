import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";

function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  // Change from generic "Day" to specific "Date"
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const profileId = localStorage.getItem("profile_id");

  const loadSlots = async () => {
    try {
      const res = await API.get("/availability/");
      setSlots(res.data || []);
    } catch (err) {
      console.error("Failed to load availability", err);
      setError("Could not load availability. Please try again.");
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!profileId) return;
    setSaving(true);
    setError("");
    try {
      await API.post("/availability/", {
        provider_id: profileId,
        date, // Send exact date to API
        start_time: startTime,
        end_time: endTime,
      });
      setStartTime("");
      setEndTime("");
      await loadSlots();
      // After creating a slot, go back to dashboard Availability tab
      navigate("/dashboard?tab=availability");
    } catch (err) {
      console.error("Failed to add availability", err);
      setError("Could not add slot. Please ensure valid time ranges.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/availability/${id}/`);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete slot", err);
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      await API.patch(`/availability/${slot.id}/`, {
        is_active: !slot.is_active,
      });
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, is_active: !slot.is_active } : s
        )
      );
    } catch (err) {
      console.error("Failed to update slot", err);
      setError("Could not update this slot. Please try again.");
    }
  };

  return (
    <div style={{ background: "#050816", minHeight: "100vh", color: "white" }}>
      <ClientNavbar />
      <main
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "0 20px 40px",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>
          📅 Availability Control
        </h1>
        <p style={{ fontSize: "13px", opacity: 0.75, marginBottom: "4px" }}>
          Set available dates &amp; exact hours for your bookings.
        </p>
        <p style={{ fontSize: "13px", opacity: 0.75, marginBottom: "24px" }}>
          Mark busy / unavailable times without deleting your schedule.
        </p>

        <form
          onSubmit={handleAddSlot}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "flex-end",
            marginBottom: "24px",
          }}
        >
          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              Start time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              End time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, rgba(129,140,248,1), rgba(59,130,246,1))",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Adding..." : "Add Slot"}
          </button>
        </form>

        {error && (
          <p style={{ marginBottom: 16, color: "#f97373", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <section
          style={{
            background: "rgba(15,23,42,0.9)",
            borderRadius: 18,
            border: "1px solid rgba(148,163,184,0.35)",
            padding: "16px 18px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: 8 }}>
            Your current slots
          </h2>
          {slots.length === 0 && (
            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              You haven’t added any availability yet. Clients won’t be able to
              see when you are free.
            </p>
          )}
          <div style={{ display: "grid", gap: "8px", marginTop: 8 }}>
            {slots.map((slot) => {
              const dateObj = slot.date ? new Date(slot.date) : null;
              const dateDisplay = dateObj ? dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "No Date";

              return (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "rgba(15,23,42,1)",
                    border: "1px solid rgba(148,163,184,0.4)",
                    fontSize: "13px",
                  }}
                >
                  <span>
                    <strong>{dateDisplay}</strong> • {slot.start_time} –{" "}
                    {slot.end_time}{" "}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: 999,
                        backgroundColor: slot.is_active
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(248,113,113,0.14)",
                        color: slot.is_active ? "#6ee7b7" : "#fecaca",
                        border: slot.is_active
                          ? "1px solid rgba(16,185,129,0.5)"
                          : "1px solid rgba(248,113,113,0.6)",
                      }}
                    >
                      {slot.is_active ? "Available" : "Busy / unavailable"}
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleToggleActive(slot)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: slot.is_active
                          ? "1px solid rgba(248,113,113,0.6)"
                          : "1px solid rgba(16,185,129,0.6)",
                        background: slot.is_active
                          ? "rgba(248,113,113,0.14)"
                          : "rgba(16,185,129,0.14)",
                        color: slot.is_active ? "#fecaca" : "#6ee7b7",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {slot.is_active ? "Mark busy" : "Mark available"}
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.5)",
                        background: "transparent",
                        color: "#cbd5f5",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ProviderAvailabilityPage;

