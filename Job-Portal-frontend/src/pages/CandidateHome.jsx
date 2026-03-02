import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";
import api from "../api/axios";
import "../styles/CandidateHome.css";

const CandidateHome = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isProfileComplete = (prof) => {
    return !!(prof && prof.name && prof.email && prof.skills);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profRes, jobsRes] = await Promise.all([
          api.get("/candidate/me"),
          api.get("/jobs/latest"), // Ensure this matches your route
        ]);

        setProfile(profRes.data);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/candidate/login");
          return;
        }
        console.error("Dashboard failed to load:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // ✅ Sync with backend: Listen for "receive_notification"
    socket.off("receive_notification");
    socket.on("receive_notification", (data) => {
      if (data.type === 'NEW_JOB') {
        setJobs((prev) => {
          const exists = prev.find((j) => j._id === data._id);
          if (exists) return prev;
          // Add the new job data to the top of the list
          return [data, ...prev].slice(0, 5);
        });
      }
    });

    return () => socket.off("receive_notification");
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-state">
        <h2 style={{ padding: "100px", textAlign: "center" }}>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-container">
        <main className="dashboard-content">
          <header className="content-header dashboard-header">
            <div>
              <h1>Candidate Dashboard</h1>
              <p className="header-sub">Welcome back! Track jobs & manage your profile.</p>
            </div>

            <button
              className="resume-btn"
              onClick={() => navigate("/candidate/resume-editor")}
            >
              📄Create Resume
            </button>
          </header>


          <div className="stats-grid">
            <div className="stat-card">
              <h3>Profile Status</h3>
              <p className={`status-badge ${isProfileComplete(profile) ? "complete" : "incomplete"}`}>
                {isProfileComplete(profile) ? "✅ Complete" : "❌ Incomplete"}
              </p>
            </div>
            <div className="stat-card">
              <h3>Available Jobs</h3>
              <p className="stat-number">{jobs.length}</p>
            </div>
          </div>

          <section className="data-section">
            <div className="section-header">
              <h2>Latest Opportunities</h2>
              <button className="text-link" onClick={() => navigate("/candidate/jobs")}>
                View all
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state-card">
                <p>No new jobs posted recently.</p>
              </div>
            ) : (
              <div className="job-list-container">
                {jobs.map((job) => (
                  <div className="job-row" key={job._id}>
                    <div className="job-info-main">
                      <div className="job-info-header">
                        <h4>{job.title}</h4>
                      </div>
                      <p>
                        <span>{job.companyName || "Private Employer"}</span>
                        {" • "} {job.location}
                      </p>
                      <p>
                        {job.skills?.slice(0, 4).map((skill, i) => (
                          <span className="skill-badge" key={i}>{skill}</span>
                        ))}
                      </p>
                    </div>
                    <button
                      className="apply-btn-sm"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default CandidateHome;