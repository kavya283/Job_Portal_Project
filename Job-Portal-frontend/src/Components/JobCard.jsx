import { useState } from "react";
import ApplyModal from "./ApplyModal";
import "../styles/JobCard.css";

const JobCard = ({ job }) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : "Just now";

  // ✅ Format salary range
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) {
      return `₹${job.salaryMin.toLocaleString()}+`;
    }
    if (job.salaryMax) {
      return `Up to ₹${job.salaryMax.toLocaleString()}`;
    }
    return "Competitive";
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3>{job.title}</h3>
        <span className="company-info">🏢 {job.companyName || "Tech Corp"}</span>

        {/* ✅ Salary Badge Updated */}
        <div className="salary-badge-container">
          <span className="salary-badge">💰 {formatSalary()}</span>
        </div>
      </div>

      <div className="job-card-meta">
        <div className="meta-left">
          <span className="location-tag">📍 {job.location}</span>
          <span className="date-tag">🕒 {postedDate}</span>
        </div>
        <span className={`status-pill ${job.status || "open"}`}>
          {job.status || "open"}
        </span>
      </div>

      <div className="job-card-actions">
        <button className="apply-btn" type="button" onClick={toggleModal}>
          Quick Apply
        </button>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={toggleModal}
          onSuccess={() => alert("Application sent!")}
        />
      )}
    </div>
  );
};

export default JobCard;
