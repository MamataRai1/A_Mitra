import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";
import ReportModal from "../../components/common/ReportModal";

function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState(1);
  const [method, setMethod] = useState("cash");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        const res = await API.get(`/services/${serviceId}/`);
        setService(res.data);
      } catch (err) {
        console.error("Failed to load service detail", err);
        setError("Unable to load this companion. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [serviceId]);

  const handleAddFavorite = async () => {
    if (!service) return;
    const profileId = localStorage.getItem("profile_id");
    if (!profileId) {
      return setBookingMessage(
        "Could not find your profile. Please log out and log in again."
      );
    }
    try {
      setBookingMessage("");
      await API.post("/favorites/", {
        client_id: profileId,
        service_id: service.id,
      });
      setBookingMessage("Added to favorites ✅");
    } catch (err) {
      console.error("Failed to add favorite", err);
      setBookingMessage("Could not add to favorites. Please try again.");
    }
  };

  const handleSubmitReport = async ({ reason, description }) => {
    if (!service) return;
    const profileId = localStorage.getItem("profile_id");
    if (!profileId) {
      setReportMessage(
        "Could not find your profile. Please log out and log in again."
      );
      return;
    }
    try {
      await API.post("/reports/", {
        reporter_id: profileId,
        reported_user_id: service.provider?.id,
        reason,
        description,
      });
      setReportMessage(
        "Thank you. Your safety report has been sent to the admin team."
      );
      setReportOpen(false);
    } catch (err) {
      console.error("Failed to submit report", err);
      setReportMessage("Could not send report. Please try again.");
      throw err;
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!service) return;

    const profileId = localStorage.getItem("profile_id");
    if (!profileId) {
      return setBookingMessage(
        "Could not find your profile. Please log out and log in again."
      );
    }
    if (!date || !time) {
      return setBookingMessage("Please choose a date and time.");
    }

    const bookingDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(bookingDate.getTime() + (hours || 1) * 60 * 60 * 1000);
    const totalAmount =
      Number(service.price || 0) * Number(hours || 1 || 0);

    setBookingLoading(true);
    setBookingMessage("");

    try {
      // 1. Create booking (Send exact datetime boundaries for conflict checking)
      const bookingRes = await API.post("/bookings/", {
        client_id: profileId,
        service_id: service.id,
        booking_date: bookingDate.toISOString(),
        end_time: endDate.toISOString(),
      });

      // 2. Create payment linked to booking
      await API.post("/payments/", {
        booking_id: bookingRes.data.id,
        amount: totalAmount,
        method,
      });

      setBookingMessage(
        `Booking confirmed for ${hours} hour(s). Redirecting to your bookings...`
      );

      setTimeout(() => {
        navigate('/bookings');
      }, 1500);

    } catch (err) {
      console.error("Booking or payment failed", err);
      // Display the provider conflict/overlap message from the API if present
      if (err.response?.data?.error) {
        setBookingMessage(err.response.data.error);
      } else {
        setBookingMessage("Could not complete booking. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const providerName =
    service?.provider?.user?.username ||
    service?.provider?.user?.first_name ||
    "Provider";

  let providerAvatar = service?.provider?.profile_pic;
  if (providerAvatar) {
    if (!providerAvatar.startsWith('http')) {
      providerAvatar = `http://127.0.0.1:8000${providerAvatar.startsWith('/media/') ? '' : '/media/'}${providerAvatar.replace(/^\/?media\//, '')}`;
    }
  } else {
    providerAvatar = null;
  }

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
        {loading && <p>Loading companion...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {service && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr",
              gap: "30px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "14px",
                  gap: "12px",
                }}
              >
                {providerAvatar ? (
                  <img
                    src={providerAvatar}
                    alt={providerName}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "999px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#4c1d95",
                    }}
                  >
                    {providerName[0]?.toUpperCase() || "P"}
                  </div>
                )}
                <div>
                  <h1 style={{ marginBottom: "4px" }}>{service.name}</h1>
                  <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                    Hosted by <strong>{providerName}</strong>
                  </p>
                </div>
              </div>
              <p style={{ color: "#555", marginBottom: "20px" }}>
                {service.description}
              </p>

              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px", color: "#fbbf24" }}>★</span>
                <span style={{ fontWeight: 600, fontSize: "16px" }}>
                  {service.average_rating ? service.average_rating : "New"}
                </span>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  ({service.review_count || 0} reviews)
                </span>
              </div>

              <p style={{ fontWeight: "600", marginBottom: "8px" }}>
                Hourly rate: NPR {service.price}
              </p>
              <button
                onClick={handleAddFavorite}
                style={{
                  marginTop: "10px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                ❤️ Add to Favorites
              </button>
              <button
                onClick={() => setReportOpen(true)}
                style={{
                  marginTop: "10px",
                  marginLeft: "8px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                🚨 Report safety issue
              </button>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginBottom: "16px" }}>Book this companion</h2>
              <form onSubmit={handleBook} style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Start time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payment method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="cash">Cash</option>
                    <option value="khalti">Khalti</option>
                    <option value="esewa">eSewa</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#7c3aed",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: bookingLoading ? 0.7 : 1,
                  }}
                >
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </form>

              {bookingMessage && (
                <p style={{ marginTop: "12px", color: "#111827" }}>
                  {bookingMessage}
                </p>
              )}
              {reportMessage && (
                <p style={{ marginTop: "8px", color: "#b91c1c", fontSize: "13px" }}>
                  {reportMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {service && service.reviews && service.reviews.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              marginTop: "30px",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>What clients say</h2>
            <div style={{ display: "grid", gap: "16px" }}>
              {service.reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "#e2e8f0", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: "bold", fontSize: "12px"
                    }}>
                      {rev.client_name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{rev.client_name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ color: "#fbbf24", fontSize: "12px" }}>★ {rev.rating}</span>
                        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                          • {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {rev.comment && (
                    <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        targetLabel={providerName}
      />
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "14px",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

export default ServiceDetail;

