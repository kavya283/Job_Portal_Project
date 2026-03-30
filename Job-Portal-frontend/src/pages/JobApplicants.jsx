import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/JobApplicants.css";

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/applicants/${jobId}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("❌ Fetch applicants error:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();

    if (location.state?.refresh) {
      fetchApplicants();
    }
  }, [location.state]);

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

      <div className="header-section">
        <button className="bck-btn" onClick={() => navigate("/employer/my-jobs")}>
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

            const isPass = app.assessmentResult === "pass";
            const isOfferSent = status === "offer_sent";
            const isHired = status === "hired";

            return (
              <motion.div
                key={app._id}
                className="applicant-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
              >

                <div className="card-top">
                  <div className="avatar">
                    {app.candidate?.name?.charAt(0)}
                  </div>

                  <div>
                    <h3>{app.candidate?.name}</h3>
                    <p>{app.candidate?.email}</p>

                    <span className={`status-badge ${status}`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="applicant-actions">

                  {!["interview_scheduled", "hired", "rejected"].includes(status) && (
                    <button
                      className="action-btn primary"
                      onClick={() => handleScheduleInterview(app)}
                    >
                      📅 Schedule Interview
                    </button>
                  )}

                  {/* ✅ FINAL OFFER BUTTON FIX */}
                  {isPass && !isOfferSent && !isHired && (
                    <button
                      className="action-btn success"
                      onClick={() => handleSendOffer(app)}
                    >
                      💼 Send Offer
                    </button>
                  )}

                  {isOfferSent && (
                    <span className="status-done">✅ Offer Sent</span>
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
