import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/MyApplications.css";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const handleViewResume = (resumePath) => {
    if (!resumePath) return alert("Resume not available");
    window.open(`${BASE_URL}${resumePath}`, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to withdraw this application?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to withdraw application.");
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "applied";
    const s = status.toLowerCase();
    if (s.includes("reject")) return "rejected";
    if (s.includes("short")) return "shortlisted";
    if (s.includes("interview")) return "interview";
    if (s.includes("offer")) return "offer";
    return "applied";
  };

  if (loading)
    return (
      <div className="loading-state">
        <div className="loader" />
        <p>Loading your applications...</p>
      </div>
    );

  return (
    <div className="master-page-wrapper">
      <div className="applications-container">
        <h1 className="centered-title">My Applications</h1>

        {applications.length === 0 ? (
          <div className="empty-state">
            <h3>No Applications Yet</h3>
            <p>Start applying to jobs and they will appear here.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app._id} className="application-card">

                {/* LEFT INFO */}
                <div className="app-info-group">
                  <h3 className="job-title">
                    {app.job?.title || "Position Title"}
                  </h3>

                  <p className="company-name">
                    🏢 {app.job?.companyName || "Company not shown"}
                  </p>

                  <p className="applied-date">
                    📅 Applied on{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>

                  <div className="status-row">
                    <span className={`status-pill ${getStatusClass(app.status)}`}>
                      {app.status || "Applied"}
                    </span>

                    <span
                      className={`email-pill ${
                        app.emailSent ? "sent" : "pending"
                      }`}
                    >
                      {app.emailSent ? "📧 Email Sent" : "📧 Pending"}
                    </span>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="app-actions-group">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewResume(app.resume)}
                    disabled={!app.resume}
                  >
                    📄 Resume
                  </button>

                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(app._id)}
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
