import React, { useState } from "react";

const REASONS = [
  { value: "fake_profile", label: "Fake profile" },
  { value: "harassment", label: "Harassment / abusive behavior" },
  { value: "scam", label: "Scam or fraud attempt" },
  { value: "unsafe_behavior", label: "Unsafe or threatening behavior" },
  { value: "no_show", label: "No-show / did not arrive" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "other", label: "Other" },
];

function ReportModal({ open, onClose, onSubmit, targetLabel }) {
  const [reason, setReason] = useState("fake_profile");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ reason, description });
      setReason("fake_profile");
      setDescription("");
    } catch (err) {
      setError("Could not submit report. Please try again.");
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
        <h2 style={{ marginBottom: "4px" }}>Report safety issue</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          This alert will be sent to the safety team. Please only report serious,
          real issues.
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
            You are reporting: <strong>{targetLabel}</strong>
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
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
              }}
            >
              {REASONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
              What happened? (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                resize: "vertical",
              }}
              placeholder="Describe the situation briefly so the admin can understand."
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
                background: "#ef4444",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Sending..." : "Send alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;

