import React, { useEffect, useState } from "react";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";
import ReportModal from "../../components/common/ReportModal";
import ReviewModal from "../../components/common/ReviewModal";
import { Link } from "react-router-dom";

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportMessage, setReportMessage] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");

  const role = localStorage.getItem("role") || "client";

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await API.get("/bookings/");
        // Sort bookings by date descending
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.booking_date) - new Date(a.booking_date)
        );
        setBookings(sorted);
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

  const openReview = (booking) => {
    setReviewTarget(booking);
    setReviewOpen(true);
    setReviewMessage("");
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

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
      case "confirmed":
        return <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
      case "completed":
        return <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
      case "canceled":
        return <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
      default:
        return <span className="px-4 py-1.5 rounded-full bg-gray-500/10 text-gray-500 font-bold text-xs uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] text-slate-900 duration-500">
      <ClientNavbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">

        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b pb-6 border-slate-200">
          <div>
            <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Your Bookings
            </h1>
            <p className="text-sm text-slate-500">
              Manage your appointments, leave feedback, and connect with providers.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-500">
              {bookings.length} Total Bookings
            </span>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-3xl mb-8 font-medium shadow-lg shadow-red-500/5">
            {error}
          </div>
        )}

        {reportMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-3xl mb-8 font-medium shadow-lg shadow-emerald-500/5">
            {reportMessage}
          </div>
        )}

        {reviewMessage && (
          <div className="bg-purple-500/10 border border-purple-500/20 text-purple-500 px-6 py-4 rounded-3xl mb-8 font-medium shadow-lg shadow-purple-500/5">
            {reviewMessage}
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-24 rounded-[32px] border bg-white border-slate-200 shadow-xl shadow-slate-200/40">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
            <p className="text-slate-500">You haven't scheduled any services yet. Start exploring!</p>
            <Link to="/services" className="mt-6 inline-block bg-indigo-500 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/30">
              Find Services
            </Link>
          </div>
        )}

        <div className="grid gap-6">
          {bookings.map((booking) => {
            const serviceName = booking.service?.name || "Service";
            const providerName = booking.service?.provider?.user?.username || "Provider";
            const clientName = booking.client?.user?.username || booking.client?.user?.first_name || "Client";

            // Format Dates
            const bookingDateObj = new Date(booking.booking_date);
            const dateStr = bookingDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = bookingDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            return (
              <div
                key={booking.id}
                className="group relative overflow-hidden rounded-[32px] p-6 sm:p-8 transition-all duration-300 border backdrop-blur-xl bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-indigo-200 hover:shadow-indigo-500/10"
              >
                {/* Background Decoration */}
                <div className="absolute -right-40 -top-40 w-80 h-80 rounded-full blur-[80px] opacity-20 pointer-events-none bg-indigo-200"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">

                  {/* Left Side: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {getStatusBadge(booking.status)}
                    </div>

                    <h3 className="text-2xl font-black mb-1">{serviceName}</h3>
                    <p className="text-base font-semibold mb-6 text-slate-700">
                      {role === "provider" ? (
                        <>Session with <span className="text-indigo-500">{clientName}</span></>
                      ) : (
                        <>Provided by <span className="text-indigo-500">{providerName}</span></>
                      )}
                    </p>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-xl">📅</span>
                        <span className="font-semibold">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-xl">⏰</span>
                        <span className="font-semibold">{timeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-end gap-3 shrink-0">

                    {role === "provider" && booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/10"
                        >
                          Accept Book
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking.id, "canceled")}
                          className="px-6 py-2.5 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/10"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {role === "provider" && booking.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "completed")}
                        className="px-6 py-2.5 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/10 mb-2"
                      >
                        Mark as Completed
                      </button>
                    )}

                    {role === "provider" && (booking.status === "confirmed" || booking.status === "pending") && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "canceled")}
                        className="px-6 py-2.5 rounded-full bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white font-bold text-sm transition-all"
                      >
                        Cancel Appointment
                      </button>
                    )}
                    {role === "client" && booking.status === "completed" && !booking.has_review && (
                      <button
                        type="button"
                        onClick={() => openReview(booking)}
                        className="px-6 flex items-center justify-center gap-2 w-full sm:w-auto py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 font-bold text-sm transition-all shadow-xl shadow-purple-500/30 transform hover:-translate-y-0.5"
                      >
                        ⭐ Leave a Review
                      </button>
                    )}

                    {role === "client" && booking.status === "completed" && booking.has_review && (
                      <div className="px-6 flex items-center justify-center gap-2 w-full sm:w-auto py-3 rounded-full bg-slate-100 text-slate-500 font-bold text-sm transition-all border border-slate-200">
                        ✅ Reviewed
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => openReport(booking)}
                      className="px-6 py-2.5 w-full sm:w-auto rounded-full font-bold text-sm transition-all bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white"
                    >
                      🚨 Report Issue
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main >

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
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={handleSubmitReview}
        targetLabel={reviewTarget?.service?.name || "Service"}
      />
    </div >
  );
}

export default BookingsPage;

