import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import "../styles/offerLetter.css";

const OfferLetterPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successId, setSuccessId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        if (!user?._id) {
          setLoading(false);
          return;
        }
        console.log("🔍 Fetching offers for:", user._id);

        const res = await api.get(`/offers/candidate/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ FIX
          },
        });

        console.log("📦 Offers API response:", res.data);

        setOffers(Array.isArray(res.data) ? res.data : []); // ✅ SAFE FIX

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
      console.error(err);
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
      console.error(err);
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
              whileHover={{ scale: 1.05 }}
            >
              {/* SUCCESS */}
              {successId === o._id && (
                <motion.div
                  className="success-overlay"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  🎉 Accepted!
                </motion.div>
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
                <p>💰 ₹{o.salary || "N/A"}</p>
                <p>
                  📅{" "}
                  {o.joiningDate
                    ? new Date(o.joiningDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* ACTIONS */}
              {["sent", "pending"].includes(o.status) && (
                <div className="offer-actions">
                  <button
                    className="accept-btn"
                    onClick={() => handleAccept(o._id)}
                  >
                    ✅ Accept
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => handleReject(o._id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {/* DOWNLOAD */}
              <a
                href={`http://localhost:5000/api/offers/generate/${o._id}`}
                target="_blank"
                rel="noreferrer"
                className="download-btn"
              >
                📄 Download
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferLetterPage;
