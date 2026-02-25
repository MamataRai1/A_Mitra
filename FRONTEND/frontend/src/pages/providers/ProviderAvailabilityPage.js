import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";

function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        day,
        start_time: startTime,
        end_time: endTime,
      });
      setStartTime("");
      setEndTime("");
      await loadSlots();
    } catch (err) {
      console.error("Failed to add availability", err);
      setError("Could not add slot. Use HH:MM time like 09:00.");
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
          Availability
        </h1>
        <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "24px" }}>
          Set the days and hours when clients are allowed to book you.
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
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
              }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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
            {slots.map((slot) => (
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
                  <strong>{slot.day}</strong> • {slot.start_time} –{" "}
                  {slot.end_time}
                </span>
                <button
                  onClick={() => handleDelete(slot.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(248,113,113,0.6)",
                    background: "rgba(248,113,113,0.14)",
                    color: "#fecaca",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ProviderAvailabilityPage;

