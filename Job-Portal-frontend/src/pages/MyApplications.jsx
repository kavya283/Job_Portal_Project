import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/MyApplications.css";

const MyApplications = () => {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* =============================
     VIEW RESUME
  ============================== */

  const handleViewResume = (resumePath) => {
    if (!resumePath) {
      alert("Resume not available");
      return;
    }
    window.open(`${BASE_URL}${resumePath}`, "_blank");
  };

  /* =============================
     WITHDRAW APPLICATION
  ============================== */

  const handleDelete = async (id, status) => {

    let message = "Are you sure you want to withdraw this application?";

    if (status === "interview_scheduled") {
      message = "Interview is scheduled. Are you sure you want to withdraw?";
    } else if (status === "shortlisted") {
      message = "Your application is under review. Withdraw anyway?";
    } else if (status === "interview_completed") {
      message = "Interview completed. Do you still want to withdraw?";
    } else if (status === "selected") {
      message = "You are selected! Are you sure you want to withdraw?";
    } else if (status === "rejected") {
      message = "Application already rejected. Remove from list?";
    }

    const confirmDelete = window.confirm(message);

    if (!confirmDelete) return;

    try {
      await api.delete(`/applications/${id}`);

      setApplications((prev) =>
        prev.filter((app) => app._id !== id)
      );

    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        err.response?.data?.message ||
        "Failed to withdraw application."
      );
    }
  };

  /* =============================
     STATUS STYLE
  ============================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "shortlisted":
        return "shortlisted";
      case "interview_scheduled":
        return "interview";
      case "interview_completed":
        return "completed";
      case "selected":
        return "selected";
      case "rejected":
        return "rejected";
      default:
        return "applied";
    }
  };

  /* =============================
     LOADING
  ============================== */

  if (loading)
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Loading your applications...</p>
      </div>
    );

  /* =============================
     UI
  ============================== */

  return (
    <div className="master-page-wrapper">

      <div className="applications-container">

        <h1 className="centered-title">
          My Applications
        </h1>

        {applications.length === 0 ? (

          <div className="empty-state">
            <h3>No Applications Yet</h3>
            <p>
              Start applying to jobs and they will appear here.
            </p>
          </div>

        ) : (

          <div className="applications-list">

            {applications.map((app) => (

              <div
                key={app._id}
                className="application-card"
              >

                {/* LEFT SIDE */}
                <div className="app-info-group">

                  <h3 className="job-title">
                    {app.job?.title || "Position"}
                  </h3>

                  <p className="company-name">
                    🏢 {app.job?.companyName || "Company"}
                  </p>

                  <p className="applied-date">
                    📅 Applied on{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>

                  {/* STATUS */}
                  <div className="status-row">
                    <span
                      className={`status-pill ${getStatusClass(app.status)}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* 🔥 SHOW SCORE */}
                  {app.assessmentScore !== undefined && app.assessmentScore !== null && (
                    <p className="score-label">
                      📊 Score: {app.assessmentScore}
                    </p>
                  )}

                  {/* WORKFLOW */}
                  <div className="workflow-actions">

                    {/* ✅ TAKE ASSESSMENT */}
                    {!["assessment_submitted", "completed"].includes(app.assessmentStatus) && (
                      <button
                        className="action-btn assessment"
                        onClick={() =>
                          navigate(`/assessment/start/${app.job._id}`)
                        }
                      >
                        📝 Take Assessment
                      </button>
                    )}

                    {/* ✅ VIEW RESULT */}
                    {["assessment_submitted", "completed"].includes(app.assessmentStatus) && (
                      <button
                        className="action-btn result"
                        onClick={() =>
                          navigate(`/assessment/result/${app.job._id}`)
                        }
                      >
                        📊 View Result
                      </button>
                    )}

                    {app.status === "interview_scheduled" && (
                      <button
                        className="action-btn primary"
                        onClick={() =>
                          navigate("/candidate/interviews")
                        }
                      >
                        📅 View Interview
                      </button>
                    )}

                    {app.status === "interview_completed" && (
                      <span className="info-label">
                        Interview Completed
                      </span>
                    )}

                    {app.status === "selected" && (
                      <span className="hired-label">
                        🎉 Congratulations! You are selected
                      </span>
                    )}

                    {app.status === "rejected" && (
                      <span className="rejected-label">
                        ❌ Application Rejected
                      </span>
                    )}

                  </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="app-actions-group">

                  {/* VIEW RESUME */}
                  <button
                    className="action-btn resume-btn"
                    onClick={() => handleViewResume(app.resume)}
                    disabled={!app.resume}
                  >
                    📄 View Resume
                  </button>

                  {/* WITHDRAW */}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(app._id, app.status)}
                    title="Withdraw application"
                  >
                    🗑 Withdraw
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default MyApplications;
