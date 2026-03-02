import React, { useState } from "react";
import ReactDOM from "react-dom";
import api from "../api/axios";
import "../styles/ApplyModal.css";

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();

    if (!resumeFile) return alert("Please upload your resume");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("resume", resumeFile);

      // ✅ Do NOT set Content-Type manually
      const response = await api.post("/applications", formData);

      alert("✅ Application submitted successfully!");
      onSuccess?.();
      onClose?.();
      setResumeFile(null);

    } catch (err) {
      console.error("Apply error:", err);
      const msg = err.response?.data?.message || "Server error while applying.";
      alert(`❌ Apply failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

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
      alert("Only PDF, DOC, DOCX, JPG, PNG allowed");
      return;
    }

    setResumeFile(file);
  };

  const modalLayout = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Apply for {job.title}</h2>
        <p className="muted">{job.companyName}</p>

        {(job.salaryMin || job.salaryMax) && (
          <p className="salary-info">
            💰 Salary:
            {job.salaryMin && ` ₹${job.salaryMin.toLocaleString()}`}
            {job.salaryMin && job.salaryMax && " - "}
            {job.salaryMax && ` ₹${job.salaryMax.toLocaleString()}`}
          </p>
        )}

        <form onSubmit={handleApply}>
          <div className="input-group">
            <label>Upload Resume</label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange}
              required
            />

            {resumeFile && (
              <p className="file-name">Selected: {resumeFile.name}</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Sending..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalLayout, document.body);
};

export default ApplyModal;
