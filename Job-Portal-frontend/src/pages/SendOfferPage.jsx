import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "../styles/SendOffer.css";

const SendOfferPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const application = state?.application;

  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerExists, setOfferExists] = useState(false);

  /* ================= VALIDATE ================= */
  useEffect(() => {
    if (!application) {
      toast.error("Application not found");
      navigate("/employer/home");
    }
  }, [application, navigate]);

  /* ================= SAFE DATA ================= */
  const candidateId = application?.candidate?._id;

  const jobId =
    typeof application?.job === "object"
      ? application.job?._id
      : application?.job;

  const jobTitle =
    typeof application?.job === "object"
      ? application.job?.title
      : "Loading...";

  const companyName =
    typeof application?.job === "object"
      ? application.job?.companyName
      : "";

  /* ================= CHECK EXISTING OFFER ================= */
  useEffect(() => {
    const checkExistingOffer = async () => {
      try {
        if (!candidateId || !jobId) return;

        const res = await api.get(`/offers/candidate/${candidateId}`);

        const exists = res.data.some(
          (offer) => offer.job?._id === jobId
        );

        setOfferExists(exists);

        if (exists) {
          toast("⚠️ Offer already sent to this candidate", {
            icon: "⚠️",
          });
        }

      } catch (err) {
        console.log("Check Offer Error:", err);
      }
    };

    checkExistingOffer();
  }, [candidateId, jobId]);

  /* ================= SEND OFFER ================= */
  const handleSend = async () => {
    if (!salary || !joiningDate) {
      toast.error("Please fill all fields");
      return;
    }

    if (!candidateId || !jobId) {
      toast.error("Invalid candidate or job data");
      return;
    }

    if (offerExists) {
      toast.error("Offer already sent");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        candidate: candidateId,
        job: jobId,
        salary: Number(salary),
        joiningDate,
      };

      console.log("📦 Payload:", payload);

      const res = await api.post("/offers", payload);

      console.log("✅ Response:", res.data);

      toast.success("🎉 Offer Sent Successfully!");

      setTimeout(() => {
        navigate(`/job-applicants/${jobId}`, {
          state: { refresh: true },
        });
      }, 1200);

    } catch (err) {
      const message = err.response?.data?.message;

      console.log("❌ ERROR:", err.response?.data);

      if (message === "Missing data") {
        toast.error("❌ Missing candidate or job");
      } else if (message === "Application not found") {
        toast.error("❌ Application not found in database");
      } else if (message === "Offer already exists") {
        toast.error("⚠️ Offer already sent to this candidate");
        setOfferExists(true); // 🔥 auto update UI
      } else {
        toast.error(message || "Failed to send offer");
      }

    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  return (
    <div className="offer-page">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="offer-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Send Offer</h2>
      </div>

      {/* LAYOUT */}
      <div className="offer-layout">

        {/* FORM */}
        <div className="glass offer-form">
          <h3>Offer Details</h3>

          <p className="candidate-name">
            Candidate: <strong>{application.candidate?.name}</strong>
          </p>

          <p className="job-name">
            Job: <strong>{jobTitle}</strong>
          </p>

          {/* 🔥 STATUS */}
          {offerExists && (
            <p style={{ color: "#f59e0b", marginBottom: "10px" }}>
              ⚠️ Offer already sent
            </p>
          )}

          <input
            type="number"
            placeholder="Enter Salary (₹)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || offerExists}
          >
            {offerExists
              ? "Offer Already Sent"
              : loading
              ? "Sending..."
              : "Send Offer"}
          </button>
        </div>

        {/* PREVIEW */}
        <div className="glass offer-preview">
          <h3>Offer Preview</h3>

          <div className="preview-card">
            <h4>Offer Letter</h4>

            <p>Dear {application.candidate?.name},</p>

            <p>
              We are pleased to offer you the position of{" "}
              <strong>{jobTitle}</strong>{" "}
              {companyName && <>at <strong>{companyName}</strong></>}
            </p>

            <p>
              <strong>Salary:</strong>{" "}
              {salary
                ? `₹${Number(salary).toLocaleString()}`
                : "Not specified"}
            </p>

            <p>
              <strong>Joining Date:</strong>{" "}
              {joiningDate || "Not selected"}
            </p>

            <p>We look forward to working with you!</p>

            <p className="signature">— HR Team</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SendOfferPage;
