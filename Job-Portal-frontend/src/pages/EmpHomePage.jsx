import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import api from "../api/axios";
import "../styles/EmpHomePage.css";

const EmpHomePage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Animated Counter ---------- */
  const useCounter = (value) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const step = Math.ceil(value / 30);
      const timer = setInterval(() => {
        start += step;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else setCount(start);
      }, 15);
      return () => clearInterval(timer);
    }, [value]);
    return count;
  };

  const jobsCount = useCounter(jobs.length);
  const appsCount = useCounter(applications.length);

  /* ---------- Fetch Dashboard ---------- */
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [jobsRes, appsRes] = await Promise.all([
        api.get("/jobs/my-jobs"),
        api.get("/jobs/applicants"),
      ]);

      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/emplogin");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();

    socket.on("jobPosted", (job) => setJobs((prev) => [job, ...prev]));
    socket.on("newApplication", (app) =>
      setApplications((prev) => [app, ...prev])
    );

    return () => {
      socket.off("jobPosted");
      socket.off("newApplication");
    };
  }, [fetchDashboard]);

  if (loading) return <p className="loading-text">Loading dashboard...</p>;

  /* ---------- Smart Greeting ---------- */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const employerName =
    JSON.parse(localStorage.getItem("user"))?.name || "Employer";
      
  const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
  });

  return (
    <div className="employer-dashboard">
      <main className="dashboard-content">

        {/* HEADER */}
        <header className="dashboard-header greeting-header">
          <div className="greeting-left">
            <h1 className="dashboard-title">
              👋 {getGreeting()}, {employerName}
            </h1>
            <p className="dashboard-sub">
              {today} • Manage jobs, track applicants, and grow your hiring pipeline.
            </p>
          </div>
        </header>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">JOBS POSTED</span>
            <p className="stat-value">{jobsCount}</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">APPLICATIONS</span>
            <p className="stat-value">{appsCount}</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <button onClick={() => navigate("/employer/post-job")}>
            ➕ Post Job
          </button>

          <button onClick={() => navigate("/employer/my-jobs")}>
            📋 Manage Jobs
          </button>
        </section>

        {/* TWO COLUMN CONTENT */}
        <div className="dashboard-columns">

          {/* JOBS */}
          <section className="data-section">
            <div className="section-header">
              <h2>My Posted Jobs</h2>
            </div>

            <div className="jobs-list">
              {jobs.length === 0 ? (
                <p className="empty-text">No jobs posted yet.</p>
              ) : (
                jobs.map((job) => (
                  <div
                    className="data-card clickable job-card"
                    key={job._id}
                    onClick={() => navigate(`/job-applicants/${job._id}`)}
                  >
                    <h4>{job.title}</h4>
                    <p className="muted">📍 {job.location || "Remote"}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* APPLICATIONS */}
          <section className="data-section">
            <h2>Recent Applications</h2>

            <div className="apps-list">
              {applications.length === 0 ? (
                <p className="empty-text">No applications yet.</p>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div className="data-card" key={app._id}>
                    <h4>{app.candidate?.name}</h4>
                    <p className="muted">
                      Applied for <strong>{app.job?.title}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* INSIGHT STRIP */}
        <section className="insight-strip">
          <div className="insight-card">
            <h4>💡 Hiring Tip</h4>
            <p>Jobs with salary ranges receive more applications.</p>
          </div>

          <div className="insight-card">
            <h4>⚡ Activity</h4>
            <p>You received {applications.length} applications recently.</p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default EmpHomePage;
