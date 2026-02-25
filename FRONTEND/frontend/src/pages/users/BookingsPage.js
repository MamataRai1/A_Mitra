import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";
import ReportModal from "../../components/common/ReportModal";

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportMessage, setReportMessage] = useState("");

  const role = localStorage.getItem("role") || "client";

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await API.get("/bookings/");
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings", err);
        setError("Unable to load bookings. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const openReport = (booking) => {
    setReportTarget(booking);
    setReportOpen(true);
    setReportMessage("");
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await API.patch(`/bookings/${bookingId}/`, {
        status: newStatus,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...res.data } : b))
      );
    } catch (err) {
      console.error("Failed to update booking status", err);
      alert("Could not update booking. Please try again.");
    }
  };

  const handleSubmitReport = async ({ reason, description }) => {
    if (!reportTarget) return;
    const profileId = localStorage.getItem("profile_id");
    if (!profileId) {
      setReportMessage(
        "Could not find your profile. Please log out and log in again."
      );
      return;
    }

    // If current user is client, they report the provider.
    // If current user is provider, they report the client.
    const reportedProfileId =
      role === "provider"
        ? reportTarget.client?.id
        : reportTarget.service?.provider?.id;

    try {
      await API.post("/reports/", {
        reporter_id: profileId,
        reported_user_id: reportedProfileId,
        booking_id: reportTarget.id,
        reason,
        description,
      });
      setReportMessage(
        "Your alert has been submitted to the admin for review."
      );
      setReportOpen(false);
    } catch (err) {
      console.error("Failed to submit booking report", err);
      setReportMessage("Could not send report. Please try again.");
      throw err;
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
        <h1 style={{ marginBottom: "20px" }}>Your Bookings</h1>
        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <p>You do not have any bookings yet.</p>
        )}

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {bookings.map((booking) => {
            const serviceName = booking.service?.name || "Service";
            const providerName =
              booking.service?.provider?.user?.username || "Provider";
            const clientName =
              booking.client?.user?.username || booking.client?.user?.first_name || "Client";
            const date = booking.booking_date
              ? new Date(booking.booking_date).toLocaleString()
              : "N/A";

            return (
              <div
                key={booking.id}
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: "4px" }}>{serviceName}</h3>
                    <p style={{ color: "#555", fontSize: "14px" }}>
                      {role === "provider" ? (
                        <>
                          with client <strong>{clientName}</strong>
                        </>
                      ) : (
                        <>
                          with <strong>{providerName}</strong>
                        </>
                      )}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>{date}</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        background: "#e5e7eb",
                        fontSize: "12px",
                        textTransform: "capitalize",
                      }}
                    >
                      {booking.status}
                    </span>
                    {role === "provider" && booking.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingStatus(booking.id, "confirmed")
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #bbf7d0",
                            background: "#ecfdf5",
                            color: "#15803d",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingStatus(booking.id, "canceled")
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#b91c1c",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {role === "provider" &&
                      (booking.status === "confirmed" ||
                        booking.status === "pending") && (
                        <button
                          type="button"
                          onClick={() =>
                            updateBookingStatus(booking.id, "canceled")
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #fed7aa",
                            background: "#fff7ed",
                            color: "#c2410c",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => openReport(booking)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🚨 Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {reportMessage && (
          <p style={{ marginTop: "12px", color: "#b91c1c", fontSize: "13px" }}>
            {reportMessage}
          </p>
        )}
      </div>

      <Footer />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        targetLabel={
          reportTarget
            ? role === "provider"
              ? reportTarget.client?.user?.username || "Client"
              : reportTarget.service?.provider?.user?.username || "Provider"
            : ""
        }
      />
    </div>
  );
}

export default BookingsPage;

