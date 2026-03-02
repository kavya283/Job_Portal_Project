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
  const [resumeFile, setResumeFile] = useState(null);

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

  // 📌 Handle resume selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, JPG, PNG allowed.");
      return;
    }

    setResumeFile(file);
  };

  // 📌 Apply with resume upload
  const handleApply = async () => {
    if (!resumeFile) {
      alert("Please upload your resume first.");
      return;
    }

    if (!job?._id && !job?.id) {
      alert("Job ID not found. Cannot apply.");
      return;
    }
    try {
      setApplying(true);

      const formData = new FormData();
      formData.append("jobId", job._id || job.id); // use _id or id
      formData.append("resume", resumeFile); // must match backend field

      console.log("📤 Sending Application FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post("/applications", formData); // no Content-Type header!

      console.log("✅ Apply Response:", response.data);
      alert("Application submitted successfully!");
      setResumeFile(null);

    } catch (err) {
      console.error("Apply error:", err);
      const msg = err.response?.data?.message || "Server error while applying.";
      alert(`❌ Apply failed: ${msg}`);
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
            <span>
              💰 Rs.{job.salaryMin?.toLocaleString()} - 
              {job.salaryMax ? ` Rs.${job.salaryMax.toLocaleString()}` : ' Negotiable'}
            </span>
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

          {/* 📌 Resume Upload Section */}
          <div className="resume-upload-box">
            <label className="upload-label">Upload Resume</label>

            <div className="upload-area">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
                className="file-input"
              />

              {!resumeFile && (
                <p className="upload-hint">
                  Drag & drop or click to upload your resume
                </p>
              )}

              {resumeFile && (
                <div className="file-preview">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{resumeFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="action-footer">
            <button 
              className="apply-now-btn" 
              onClick={handleApply}
              disabled={applying || job.status === 'closed'}>

              {applying
                ? "Submitting..."
                : job.status === 'closed'
                ? "Job Closed"
                : "Apply for this Position"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
