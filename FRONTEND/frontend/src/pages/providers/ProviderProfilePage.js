import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientNavbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import API from "../../api";

function ProviderProfilePage() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState(null); // object URL for selected file
  const [avatarKey, setAvatarKey] = useState(0); // force img refresh after save

  const profileId = localStorage.getItem("profile_id");

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;
      try {
        const res = await API.get(`/profiles/${profileId}/`);
        setProfile(res.data);
        setPhone(res.data.phone_number || "");
        setAddress(res.data.address || "");
        setBio(res.data.bio || "");
        setSkills(res.data.skills || "");
      } catch (err) {
        console.error("Failed to load provider profile", err);
        setMessage("Could not load your profile. Please try again.");
      }
    };
    loadProfile();
  }, [profileId]);

  // Clean up object URL for selected file preview when unmounting
  useEffect(() => {
    return () => {
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
    };
  }, [profilePicPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId) return;
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("phone_number", phone);
      formData.append("address", address);
      formData.append("bio", bio);
      formData.append("skills", skills);
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
      setAvatarKey(Date.now()); // so saved image URL refreshes (cache bust)
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Preview: show newly selected file before save; otherwise show server image (with cache bust after save)
  const serverAvatar =
    profile && profile.profile_pic
      ? (profile.profile_pic.startsWith("http") ? profile.profile_pic : `http://127.0.0.1:8000/media/${profile.profile_pic}`)
      : null;
  const currentAvatar = profilePicPreview || (serverAvatar ? `${serverAvatar}?t=${avatarKey}` : null);

  return (
    <div style={{ background: "#050816", minHeight: "100vh", color: "white" }}>
      <ClientNavbar />
      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "0 20px 40px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <Link
            to="/dashboard"
            style={{ fontSize: "12px", color: "#a5b4fc", marginBottom: "8px", display: "inline-block", textDecoration: "none" }}
          >
            ← Back to dashboard
          </Link>
          <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>
            Provider Profile
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: 0 }}>
            Update your contact details, story, and profile picture. These
            details help clients trust and understand you.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div>
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Profile"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    objectFit: "cover",
                    border: "2px solid rgba(129,140,248,0.8)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.6), rgba(236,72,153,0.6))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {profile?.user?.username?.[0]?.toUpperCase() || "P"}
                </div>
              )}
            </div>
            <div style={{ fontSize: "13px" }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                <span style={{ display: "block", marginBottom: 4 }}>
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
                  style={{ fontSize: "12px" }}
                />
              </label>
              <p style={{ opacity: 0.6 }}>
                Square images (1:1) look best in the app.
              </p>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
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
              Short Bio / About You
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="Tell clients what kind of companion you are, your vibe, languages, experience..."
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              Skills / Services (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
              }}
              placeholder="e.g. movie nights, city tours, gaming, study buddy"
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
              Address / City
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="e.g. Kathmandu, Patan, Bhaktapur"
            />
          </div>

          {/* ADD OVERVIEW INFO */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{
              background: "rgba(79, 70, 229, 0.1)",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "#818cf8", marginBottom: "4px" }}>Account Info</span>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
                Username: <span style={{ color: "#a5b4fc" }}>@{profile?.user?.username}</span>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                User ID: #{profile?.user?.id} <br />
                Joined: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: "#34d399", marginBottom: "4px" }}>KYC Verification</span>
              {profile?.kyc_id ? (
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#34d399" }}>✓</span> Document Uploaded
                  </div>
                  <a
                    href={profile.kyc_id.startsWith('http') ? profile.kyc_id : `http://127.0.0.1:8000${profile.kyc_id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      marginTop: "12px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      position: "relative"
                    }}
                    title="Click to view full size"
                  >
                    <img
                      src={profile.kyc_id.startsWith('http') ? profile.kyc_id : `http://127.0.0.1:8000${profile.kyc_id}`}
                      alt="KYC Registration Document"
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        opacity: 0.8,
                        transition: "opacity 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = 1}
                      onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                    />
                  </a>
                </div>
              ) : (
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>No KYC Document Found</div>
              )}
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                Status: <strong style={{ color: profile?.is_verified ? "#34d399" : "#fbbf24" }}>
                  {profile?.is_verified ? "Verified" : "Pending Approval"}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 4,
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, rgba(129,140,248,1), rgba(236,72,153,1))",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
              alignSelf: "flex-start",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontSize: "13px", color: "#a5b4fc" }}>
            {message}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProviderProfilePage;

