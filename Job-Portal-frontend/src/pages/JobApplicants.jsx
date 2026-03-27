import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/JobApplicants.css";

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/applicants/${jobId}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  /* ================= NAVIGATION ================= */

  const handleScheduleInterview = (app) => {
    navigate(`/employer/interview/${app._id}`, {
      state: { selectedApplication: app },
    });
  };

  const handleSendOffer = (app) => {
    navigate(`/employer/send-offer/${app.job?._id}`, {
      state: { application: app },
    });
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="applicants-container">

      {/* HEADER */}
      <div className="header-section">
        <button
          className="bck-btn"
          onClick={() => navigate("/employer/my-jobs")}
        >
          ← Back
        </button>

        <h2 className="page-title">Applicants</h2>
      </div>

      {applications.length === 0 ? (
        <p className="no-applicants">No applicants</p>
      ) : (
        <div className="applicants-grid">

          {applications.map((app) => {
            const status = app.status?.toLowerCase() || "";

            const isFail = app.assessmentResult === "fail";
            const isPass = app.assessmentResult === "pass";
            const isOfferSent = status === "offer_sent";
            const isHired = status === "hired";

            return (
              <motion.div
                key={app._id}
                className="applicant-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
              >

                {/* 🎉 HIRED CONFETTI */}
                {isHired && <div className="confetti"></div>}

                {/* TOP */}
                <div className="card-top">
                  <div className="avatar">
                    {app.candidate?.name?.charAt(0)}
                  </div>

                  <div>
                    <h3>{app.candidate?.name}</h3>
                    <p>{app.candidate?.email}</p>

                    <span className={`status-badge ${status}`}>
                      {status === "rejected" ? "Rejected ❌" : status}
                    </span>
                  </div>
                </div>

               {/* PIPELINE */}
                <div className="pipeline">

                  <span className={status === "applied" ? "active" : ""}>
                    Apply
                  </span>
                  <span className={status?.includes("assessment") ? "active" : ""}>
                    Assessment
                  </span>
                  <span className={app.assessmentResult === "pass" ? "active" : ""}>
                    Pass
                  </span>
                  <span className={status?.includes("interview") ? "active" : ""}>
                    Interview
                  </span>
                  <span className={status === "offer_sent" ? "active" : ""}>
                    Offer
                  </span>

                </div>

                {/* 📊 SCORE */}
                {app.assessmentScore !== undefined && (
                  <div className="score-card">
                    <p>Score: {app.assessmentScore}</p>
                    <p className={isPass ? "pass" : "fail"}>
                      {app.assessmentResult}
                    </p>
                  </div>
                )}

                {/* ❌ FAIL MESSAGE */}
                {isFail && (
                  <p className="fail-message">
                    ❌ Candidate did not meet assessment criteria
                  </p>
                )}

                {/* 📄 RESUME */}
                {app.resume && (
                  <button
                    className="resume-btn"
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${app.resume}`,
                        "_blank"
                      )
                    }
                  >
                    📄 View Resume
                  </button>
                )}

                {/* ACTIONS */}
                <div className="applicant-actions">

                  {/* 📅 SCHEDULE INTERVIEW */}
                  {!["interview_scheduled", "hired", "rejected"].includes(status) && (
                    <button
                      className="action-btn primary"
                      onClick={() => handleScheduleInterview(app)}
                    >
                      📅 Schedule Interview
                    </button>
                  )}

                  {/* 📝 ASSIGN ASSESSMENT */}
                  {status === "interview_completed" && (
                    <button
                      className="action-btn secondary"
                      onClick={() =>
                        navigate(`/assessment-upload/${app.job?._id}`)
                      }
                    >
                      📝 Assign Assessment
                    </button>
                  )}

                  {/* 💼 SEND OFFER ✅ FINAL FIX */}
                  {isPass &&
                    !isOfferSent &&
                    !isHired &&
                    status !== "rejected" &&
                    (
                      status === "interview_scheduled" ||
                      status === "interview_completed" ||
                      status === "assessment_submitted" ||
                      app.assessmentScore > 0
                    ) && (
                      <button
                        className="action-btn success pulse"
                        onClick={() => handleSendOffer(app)}
                      >
                        💼 Send Offer
                      </button>
                  )}

                  {/* ✅ OFFER SENT */}
                  {isOfferSent && (
                    <span className="status-done">✅ Offer Sent</span>
                  )}

                  {/* 🎉 HIRED */}
                  {isHired && (
                    <span className="hired-badge">🎉 Hired</span>
                  )}

                </div>

              </motion.div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default JobApplicants;
