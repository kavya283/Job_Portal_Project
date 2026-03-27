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
  const [dragActive, setDragActive] = useState(false);

  /* ================= FETCH JOB ================= */
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

  /* ================= FILE VALIDATION ================= */
  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("❌ Only PDF, DOC, DOCX, JPG, PNG allowed.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File size must be less than 5MB.");
      return false;
    }

    return true;
  };

  /* ================= HANDLE FILE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    console.log("📄 Selected file:", file);
    setResumeFile(file);
  };

  /* ================= DRAG & DROP ================= */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    console.log("📄 Dropped file:", file);
    setResumeFile(file);
  };

  /* ================= APPLY ================= */
  const handleApply = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      alert("⚠ Please upload your resume first.");
      return;
    }

    if (!job?._id && !job?.id) {
      alert("Job ID missing.");
      return;
    }

    try {
      setApplying(true);

      const formData = new FormData();
      formData.append("jobId", job._id || job.id);
      formData.append("resume", resumeFile);

      console.log("📤 Sending FormData...");

      const response = await api.post("/applications", formData);

      console.log("✅ Apply Response:", response.data);

      alert("🎉 Application submitted successfully!");
      setResumeFile(null);

    } catch (err) {
      console.error("Apply error:", err.response || err);
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

        <button onClick={() => navigate(-1)} className="back-link">
          ← Back
        </button>

        <div className="job-card-large">

          <header className="job-header">
            <h1>{job.title}</h1>
            <p>at <strong>{job.companyName || job.employer?.companyName}</strong></p>
          </header>

          <div className="job-tags">
            <span>📍 {job.location}</span>
            <span>💼 {job.role || "Full-Time"}</span>
            <span>
              💰 Rs.{job.salaryMin?.toLocaleString()} - 
              {job.salaryMax ? ` Rs.${job.salaryMax.toLocaleString()}` : ' Negotiable'}
            </span>
          </div>

          <hr />

          <section>
            <h3>Description</h3>
            <p>{job.description}</p>
          </section>

          {/* ================= RESUME UPLOAD ================= */}
          <div className="resume-upload-box">
            <label>Upload Resume</label>

            <label
              className={`upload-area ${dragActive ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
                className="file-input"
              />

              {!resumeFile && (
                <p>📂 Drag & drop or click to upload your resume</p>
              )}

              {resumeFile && (
                <div className="file-preview">
                  📄 {resumeFile.name}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                  >
                    ❌
                  </button>
                </div>
              )}
            </label>
          </div>

          {/* ================= APPLY BUTTON ================= */}
          <div className="action-footer">
            <button 
              className="apply-now-btn" 
              onClick={handleApply}
              disabled={applying || job.status === 'closed'}
            >
              {applying
                ? "Submitting..."
                : job.status === 'closed'
                ? "Job Closed"
                : "Apply Now"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
