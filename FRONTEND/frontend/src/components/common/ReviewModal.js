import React, { useState } from "react";

function ReviewModal({ open, onClose, onSubmit, targetLabel }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await onSubmit({ rating, comment });
            setRating(5);
            setComment("");
        } catch (err) {
            if (err.response && err.response.data && Array.isArray(err.response.data)) {
                setError(err.response.data[0]);
            } else {
                setError(err.response?.data?.detail || "Could not submit review. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    maxWidth: "480px",
                    width: "100%",
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                }}
            >
                <h2 style={{ marginBottom: "4px" }}>Leave a Review</h2>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                    Share your experience to help others.
                </p>
                {targetLabel && (
                    <p
                        style={{
                            fontSize: "13px",
                            color: "#374151",
                            marginBottom: "12px",
                            fontWeight: 500,
                        }}
                    >
                        Reviewing: <strong>{targetLabel}</strong>
                    </p>
                )}

                {error && (
                    <p style={{ color: "red", fontSize: "13px", marginBottom: "8px" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "4px",
                                fontSize: "13px",
                                fontWeight: 500,
                            }}
                        >
                            Rating
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "24px",
                                        cursor: "pointer",
                                        color: star <= rating ? "#fbbf24" : "#e5e7eb",
                                        padding: 0,
                                    }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "4px",
                                fontSize: "13px",
                                fontWeight: 500,
                            }}
                        >
                            Comment (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                resize: "vertical",
                            }}
                            placeholder="How was your experience?"
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                            marginTop: "4px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "8px 14px",
                                borderRadius: "999px",
                                border: "1px solid #d1d5db",
                                background: "white",
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "999px",
                                border: "none",
                                background: "#7c3aed",
                                color: "white",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                opacity: submitting ? 0.7 : 1,
                            }}
                        >
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewModal;
