import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from "../api/axios"; 
import "../styles/JobDetails.css"; 

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Could not load job details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    if (!job || !job._id) return;
    try {
      setApplying(true);
      const applicationData = { jobId: job._id, resume: "Placeholder Resume Link" };
      const response = await api.post("/applications", applicationData);
      if (response.status === 201) alert("✅ Application submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Server error while applying.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-container"><h2>Loading Job Details...</h2></div>;
  if (error || !job) return <div className="error-container"><h3>{error || "Job not found"}</h3></div>;

  return (
    <div className="job-details-wrapper">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-link">← Back</button>

        <div className="job-card-large">
          <header className="job-header">
            <div className="header-main">
              <h1>{job.title}</h1>
              <p className="company-tagline">
                at <strong>{job.companyName || job.employer?.companyName || "Our Company"}</strong>
              </p>
            </div>
            <span className={`status-pill ${job.status}`}>{job.status}</span>
          </header>
          <div className="job-tags">
            <span>📍 {job.location}</span>
            <span>💼 {job.role || "Full-Time"}</span>
            <span>💰 Rs.{job.salaryMin?.toLocaleString()} - {job.salaryMax ? `Rs.${job.salaryMax.toLocaleString()}` : 'Negotiable'}</span>
          </div>
          <hr className="divider" />
          <section className="detail-section">
            <h3>Description</h3>
            <p className="description-text">{job.description}</p>
          </section>
          {job.responsibilities && (
            <section className="detail-section">
              <h3>Key Responsibilities</h3>
              <ul className="detail-list">
                {job.responsibilities.split('\n').map((point, i) => (
                  point.trim() && <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}
          {job.qualifications && (
            <section className="detail-section">
              <h3>What We're Looking For</h3>
              <ul className="detail-list">
                {job.qualifications.split('\n').map((point, i) => (
                  point.trim() && <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}
          <div className="action-footer">
            <button 
              className="apply-now-btn" 
              onClick={handleApply}
              disabled={applying || job.status === 'closed'} >
              {applying ? "Submitting..." : job.status === 'closed' ? "Job Closed" : "Apply for this Position"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;