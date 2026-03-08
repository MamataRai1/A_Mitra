import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";
import ReviewModal from "../../components/common/ReviewModal";

function ClientProfilePage() {
    const [profile, setProfile] = useState(null);
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [avatarKey, setAvatarKey] = useState(0);

    const [activeTab, setActiveTab] = useState("profile"); // profile | bookings | history | alerts
    const [bookings, setBookings] = useState([]);
    const [reportsReceived, setReportsReceived] = useState([]);
    const [postedReviews, setPostedReviews] = useState([]);
    const [sentReports, setSentReports] = useState([]);

    const [reviewBookingId, setReviewBookingId] = useState(null);

    const profileId = localStorage.getItem("profile_id");

    useEffect(() => {
        const loadProfileData = async () => {
            if (!profileId) return;
            try {
                const [profRes, bookRes, repRes, alertRes] = await Promise.all([
                    API.get(`/profiles/${profileId}/`),
                    API.get(`/bookings/`),
                    API.get(`/reports/`),
                    API.get(`/alerts/panel/`)
                ]);

                setProfile(profRes.data);
                setPhone(profRes.data.phone_number || "");
                setAddress(profRes.data.address || "");
                setBio(profRes.data.bio || "");

                // Bookings (API already filters by profile role)
                setBookings(bookRes.data || []);

                // Reports where the client is the reported user
                const allReports = repRes.data || [];
                setReportsReceived(allReports.filter((r) => r.reported_user?.id === parseInt(profileId)));

                // Populate history data
                setPostedReviews(alertRes.data?.posted_reviews || []);
                setSentReports(alertRes.data?.sent_reports || []);

            } catch (err) {
                console.error("Failed to load client profile data", err);
                setMessage("Could not load your profile data. Please try again.");
            }
        };
        loadProfileData();
    }, [profileId]);

    useEffect(() => {
        return () => {
            if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
        };
    }, [profilePicPreview]);

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        if (!profileId) return;
        setSaving(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("phone_number", phone);
            formData.append("address", address);
            formData.append("bio", bio);
            if (profilePic) {
                formData.append("profile_pic", profilePic);
            }

            const res = await API.patch(`/profiles/${profileId}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfile(res.data);
            setProfilePic(null);
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
                setProfilePicPreview(null);
            }
            setAvatarKey(Date.now());
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Failed to update profile", err);
            setMessage("Could not save changes. Please try again.");
        } finally {
            setSaving(false);
        }
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
            console.error("Failed to cancel booking", err);
            alert("Could not update booking. Please try again.");
        }
    };

    const serverAvatar =
        profile && profile.profile_pic
            ? (profile.profile_pic.startsWith("http") ? profile.profile_pic : `http://127.0.0.1:8000/media/${profile.profile_pic}`)
            : null;
    const currentAvatar = profilePicPreview || (serverAvatar ? `${serverAvatar}?t=${avatarKey}` : null);

    const cardClass = "rounded-[24px] bg-white border border-gray-200 p-6 shadow-sm";

    return (
        <div style={{ background: "#f8f6ff", minHeight: "100vh", color: "#1f2937" }}>
            <ClientNavbar />

            <main style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px 40px" }}>

                <div style={{ marginBottom: "24px" }}>
                    {/* <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", color: "#4f46e5" }}>
                        My Platform Hub
                    </h1> */}
                    <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: 0 }}>
                        Manage your personal profile, track your bookings, and view safety center notices.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-2xl mb-6 shadow-sm overflow-x-auto">
                    {["profile", "bookings", "history", "alerts"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
                        {message}
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                    <section className={cardClass}>
                        <h2 className="text-xl font-bold mb-6">Personal details</h2>
                        <form onSubmit={handleSubmitProfile} style={{ display: "grid", gap: "20px" }}>
                            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                                <div>
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt="Profile"
                                            style={{
                                                width: 96,
                                                height: 96,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: "3px solid #e0e7ff",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 96,
                                                height: 96,
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, #818cf8, #c084fc)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 32,
                                                fontWeight: 700,
                                                color: "white"
                                            }}
                                        >
                                            {profile?.user?.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    <label style={{ display: "block", marginBottom: 6 }}>
                                        <span style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                            Profile Photo
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
                                                setProfilePic(file || null);
                                                setProfilePicPreview(file ? URL.createObjectURL(file) : null);
                                            }}
                                            style={{ fontSize: "13px" }}
                                        />
                                    </label>
                                    <p style={{ opacity: 0.6, fontSize: "12px" }}>
                                        Square images (1:1) look best.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label style={{ fontSize: "13px", display: "block", marginBottom: 6, fontWeight: 600 }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:border-indigo-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", display: "block", marginBottom: 6, fontWeight: 600 }}>
                                        Address / City
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:border-indigo-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: "13px", display: "block", marginBottom: 6, fontWeight: 600 }}>
                                    Short Bio / Interests
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:border-indigo-500 outline-none text-sm transition-all"
                                    placeholder="Tell companions a bit about your hobbies and preferences..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-500 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none"
                                style={{ justifySelf: "start" }}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </form>

                        {/* ACCOUNT & KYC INFO BADGES */}
                        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Account Details Block */}
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
                                <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <span className="text-xl">💳</span> Account Identity
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    <div>
                                        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">Username</p>
                                        <p className="text-sm font-bold text-gray-800">@{profile?.user?.username || "N/A"}</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">Account ID</p>
                                            <p className="text-sm font-semibold text-gray-700">#{profileId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">Joined</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Just now"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KYC Verification Block */}
                            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🛡️</span> KYC Verification
                                    </h3>

                                    {profile?.kyc_id ? (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <span className="text-emerald-500">✓</span> Document Uploaded
                                            </div>
                                            <a
                                                href={profile.kyc_id.startsWith('http') ? profile.kyc_id : `http://127.0.0.1:8000${profile.kyc_id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block mt-3 border border-emerald-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group bg-black"
                                                title="Click to view full size"
                                            >
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <span className="text-white text-xs font-bold drop-shadow-md bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View Full Document</span>
                                                </div>
                                                <img
                                                    src={profile.kyc_id.startsWith('http') ? profile.kyc_id : `http://127.0.0.1:8000${profile.kyc_id}`}
                                                    alt="KYC Registration Document"
                                                    className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                                <span>⚠️</span> Missing KYC
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">Please upload your ID to become verified.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-emerald-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Status</span>
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                                            {profile?.kyc_id ? 'Pending Admin Approval' : 'Unverified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === "bookings" && (
                    <section className={cardClass}>
                        <h2 className="text-xl font-bold mb-2">Your Booking History</h2>
                        <p className="text-sm text-gray-500 mb-6">Review your past dates and upcoming appointments.</p>

                        <div className="space-y-4">
                            {bookings.map((booking) => {
                                const serviceName = booking.service?.name || "Service";
                                const providerName = booking.service?.provider?.user?.username || "Provider";
                                const date = booking.booking_date ? new Date(booking.booking_date).toLocaleString() : "N/A";

                                return (
                                    <div key={booking.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{serviceName}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                with <span className="font-semibold">{providerName}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">{date}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                    booking.status === 'canceled' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                            'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                {booking.status === 'confirmed' ? 'Approved' : booking.status}
                                            </span>

                                            {(booking.status === "pending" || booking.status === "confirmed") && (
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, "canceled")}
                                                    className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-full hover:bg-red-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {booking.status === "completed" && (
                                                <button
                                                    className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-bold rounded-full hover:bg-yellow-200 transition-colors"
                                                    onClick={() => setReviewBookingId(booking.id)}
                                                >
                                                    ⭐️ Leave Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {bookings.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">You have no booking history yet.</p>
                                    <Link to="/dashboard" className="text-indigo-600 font-bold text-sm hover:underline mt-2 inline-block">
                                        Explore companions →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* HISTORY TAB */}
                {activeTab === "history" && (
                    <section className={cardClass}>
                        <h2 className="text-xl font-bold mb-2">My History</h2>
                        <p className="text-sm text-gray-500 mb-6">Review your past feedback and reports submitted.</p>

                        <div className="space-y-6">
                            {/* REVIEWS SECTION */}
                            <div>
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Reviews Given</h3>
                                <div className="space-y-4">
                                    {postedReviews.map((r) => {
                                        const providerName = r.booking?.service?.provider?.user?.username || "Provider";
                                        const serviceName = r.booking?.service?.name || "Service";
                                        return (
                                            <div key={`review-${r.id}`} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{serviceName}</p>
                                                        <p className="text-xs text-gray-600">with <span className="font-semibold text-indigo-700">{providerName}</span></p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 italic border-l-2 border-indigo-300 pl-3 mt-3">"{r.comment}"</p>
                                                <p className="text-xs text-gray-400 mt-3 text-right">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {postedReviews.length === 0 && (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-500 text-sm">You haven't left any reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* REPORTS SECTION */}
                            <div className="pt-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Reports Submitted</h3>
                                <div className="space-y-4">
                                    {sentReports.map((r) => {
                                        const reportedName = r.reported_user?.user?.username || "Unknown User";
                                        return (
                                            <div key={`report-${r.id}`} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-widest font-black text-orange-600">
                                                            {r.reason.replace("_", " ")}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">Reported: <span className="font-semibold">{reportedName}</span></p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md border capitalize ${r.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        r.status === 'rejected' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                                            'bg-white text-orange-700 border-orange-200'
                                                        }`}>
                                                        Status: {r.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-2">{r.description}</p>
                                                {r.admin_note && (
                                                    <p className="text-sm text-gray-600 mt-3 font-medium italic border-l-2 border-yellow-400 pl-3 bg-white p-2 rounded">
                                                        Admin message: "{r.admin_note}"
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-3 text-right">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {sentReports.length === 0 && (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-500 text-sm">You haven't submitted any reports.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ALERTS TAB */}
                {activeTab === "alerts" && (
                    <section className={cardClass}>
                        <h2 className="text-xl font-bold mb-2">Safety Center</h2>
                        <p className="text-sm text-gray-500 mb-6">Review warnings and notes issued by the platform administrators regarding your account.</p>

                        <div className="space-y-4">
                            {reportsReceived.map((r) => (
                                <div key={r.id} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs uppercase tracking-widest font-black text-orange-600">
                                            {r.reason.replace("_", " ")}
                                        </p>
                                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-white border border-gray-200 capitalize">
                                            Status: {r.status}
                                        </span>
                                    </div>

                                    {r.action_taken && r.action_taken !== 'none' && (
                                        <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <p className={`text-sm font-bold ${r.action_taken === 'fine' || r.action_taken === 'suspension' ? 'text-red-500' : 'text-orange-500'
                                                }`}>
                                                Penalization: <span className="uppercase">{r.action_taken}</span>
                                                {r.action_taken === 'fine' ? ` (NPR ${r.fine_amount})` : ''}
                                            </p>
                                            {r.admin_note && (
                                                <p className="text-sm text-gray-600 mt-2 font-medium italic border-l-2 border-yellow-400 pl-3">
                                                    Admin message: "{r.admin_note}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {reportsReceived.length === 0 && (
                                <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <span className="text-2xl block mb-2">🛡️</span>
                                    <p className="text-emerald-700 font-bold text-sm">Your account standing is excellent.</p>
                                    <p className="text-emerald-600/70 text-xs mt-1">You have no warnings or safety alerts.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

            </main>

            {reviewBookingId && (
                <ReviewModal
                    bookingId={reviewBookingId}
                    onClose={() => setReviewBookingId(null)}
                    onSuccess={() => {
                        alert("Review submitted successfully!");
                    }}
                />
            )}

            <Footer />
        </div>
    );
}

export default ClientProfilePage;
