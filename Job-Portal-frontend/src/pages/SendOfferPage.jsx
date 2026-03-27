import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "../styles/sendOffer.css";

const SendOfferPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const application = state?.application;

  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!application) {
      toast.error("Application not found");
      navigate("/employer/home");
    }
  }, [application, navigate]);

  const handleSend = async () => {
  if (!salary || !joiningDate) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      candidate: application?.candidate?._id,
      job: application?.job?._id || application?.job,
      salary,
      joiningDate,
    };

    console.log("🚀 Sending Offer Payload:", payload); // DEBUG

    if (!payload.candidate || !payload.job) {
      toast.error("Invalid application data ❌");
      return;
    }

    await api.post("/offers", payload);

    toast.success("🎉 Offer Sent Successfully!");

    setTimeout(() => {
      navigate(`/job-applicants/${payload.job}`);
    }, 1200);

  } catch (err) {
    console.error("❌ Offer Error:", err.response?.data || err);
    toast.error(err.response?.data?.message || "Failed to send offer ❌");
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
        <h2>Send Offer Letter</h2>
      </div>

      <div className="offer-layout">

        {/* LEFT FORM */}
        <motion.div
          className="offer-form glass"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >

          <h3>Candidate Info</h3>

          <p><strong>Name:</strong> {application.candidate?.name}</p>
          <p><strong>Email:</strong> {application.candidate?.email}</p>
          <p><strong>Job:</strong> {application.job?.title || "N/A"}</p>

          <input
            type="number"
            placeholder="Salary (₹)"
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
            disabled={loading}
          >
            {loading ? "Sending..." : "💼 Send Offer"}
          </button>

        </motion.div>

        {/* RIGHT PREVIEW */}
        <motion.div
          className="offer-preview glass"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h3>📄 Offer Preview</h3>

          <div className="preview-card">
            <h2>Offer Letter</h2>

            <p>Dear {application.candidate?.name},</p>

            <p>
              We are pleased to offer you the position of{" "}
              <b>{application.job?.title || "Job Role"}</b>
            </p>

            <p><strong>Salary:</strong> ₹{salary || "_____"}</p>
            <p>
              <strong>Joining Date:</strong>{" "}
              {joiningDate || "____"}
            </p>

            <p>
              We are excited to have you join our team.
            </p>

            <br />
            <p>Best Regards,</p>
            <p>{application.companyName || "Company"}</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SendOfferPage;
