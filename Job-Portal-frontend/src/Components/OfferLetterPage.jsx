import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import "../styles/OfferLetter.css";

const OfferLetterPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successId, setSuccessId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  /* ================= FETCH OFFERS ================= */
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("❌ No token found");
          setLoading(false);
          return;
        }

        const res = await api.get("/offers/candidate/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📦 Offers:", res.data);

        setOffers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Fetch offers error:", err);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  /* ================= ACCEPT ================= */
  const handleAccept = async (id) => {
    try {
      await api.put(`/offers/${id}/accept`);

      setSuccessId(id);

      setOffers((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: "accepted" } : o
        )
      );

      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      console.error("❌ Accept error:", err);
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (id) => {
    try {
      await api.put(`/offers/${id}/reject`);

      setOffers((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: "rejected" } : o
        )
      );
    } catch (err) {
      console.error("❌ Reject error:", err);
    }
  };
 const handleDownload = async (offerId, jobTitle) => {
  try {
    setDownloadingId(offerId);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ You are not logged in");
      setDownloadingId(null);
      return;
    }

    const res = await fetch(`http://localhost:5000/api/offers/generate/${offerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) alert("❌ PDF not found. Please contact admin.");
      else alert("❌ Failed to download PDF.");
      setDownloadingId(null);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${jobTitle || "OfferLetter"}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("❌ Download error:", err);
    alert("❌ Something went wrong while downloading PDF.");
  } finally {
    setDownloadingId(null);
  }
};

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="offer-container">
        <div className="loader"></div>
        <p className="offer-loading">Loading offers...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="offer-container">

      {/* 🔙 BACK BUTTON */}
      <button className="bck-btn" onClick={() => window.history.back()}>
        ← Back
      </button>

      <h2 className="offer-title">🎉 Your Offer Letters</h2>

      {offers.length === 0 ? (
        <div className="offer-empty">
          <div className="empty-icon">📭</div>
          <h3>No Offers Yet</h3>
          <p>Your offers will appear here</p>
        </div>
      ) : (
        <div className="offer-grid">
          {offers.map((o, index) => (
            <motion.div
              key={o._id}
              className="offer-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {successId === o._id && (
                <div className="success-overlay">🎉 Accepted!</div>
              )}

              {/* HEADER */}
              <div className="offer-header">
                <h3>{o.job?.title || "Job Role"}</h3>
                <span className={`status-badge ${o.status}`}>
                  {o.status}
                </span>
              </div>

              {/* DETAILS */}
              <div className="offer-details">
                <p>💰 <strong>₹{o.salary || "N/A"}</strong></p>
                <p>
                  📅{" "}
                  {o.joiningDate
                    ? new Date(o.joiningDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="offer-footer">
                {["sent", "pending"].includes(o.status) && (
                  <div className="offer-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAccept(o._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleReject(o._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                <button
                  className="download-btn"
                  onClick={() => handleDownload(o._id, o.job?.title)}
                  disabled={downloadingId === o._id} >
                  {downloadingId === o._id ? "Downloading..." : "Download Offer"}
                </button>

              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferLetterPage;
