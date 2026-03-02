import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/PostJob.css";

const PostJob = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingJob = state?.editJob || state?.job;
  const [job, setJob] = useState({
    title: "",
    role: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    qualifications: "",
    responsibilities: "",
    status: "open" 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (editingJob) {
      setJob({
        ...editingJob,
        salaryMin: editingJob.salaryMin || "",
        salaryMax: editingJob.salaryMax || "",
      });
    }
  }, [editingJob]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...job,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
    };

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        alert("Job updated successfully!");
      } else {
        await api.post("/jobs", payload);
        alert("Job posted successfully!");
      }
      navigate("/employer/home"); 
    } catch (err) {
      console.error("Submission Error:", err);
      const message = err.response?.data?.message || "Operation failed.";
      alert("Error: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-job-wrapper">
      <div className="post-job-card">
        <h2 className="form-title">
          {editingJob ? "Edit Job Details" : "Create New Job Listing"}
        </h2>
        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label>Position Title</label>
            <input 
              name="title" 
              value={job.title} 
              onChange={handleChange} 
              placeholder="e.g. Senior Product Designer" 
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role Category</label>
              <input 
                name="role" 
                value={job.role} 
                onChange={handleChange} 
                placeholder="e.g. Design" 
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                name="location" 
                value={job.location} 
                onChange={handleChange} 
                placeholder="City or Remote" 
                required 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min Salary</label>
              <input 
                type="number" 
                name="salaryMin" 
                value={job.salaryMin} 
                onChange={handleChange} 
                placeholder="0" 
              />
            </div>
            <div className="form-group">
              <label>Max Salary</label>
              <input 
                type="number" 
                name="salaryMax" 
                value={job.salaryMax} 
                onChange={handleChange} 
                placeholder="0" 
              />
            </div>
          </div>
          <div className="form-group">
            <label>General Description</label>
            <textarea 
              name="description" 
              value={job.description} 
              onChange={handleChange} 
              placeholder="Brief summary..." 
              required 
            />
          </div>
          <div className="form-group">
            <label>Key Responsibilities</label>
            <textarea 
              name="responsibilities" 
              value={job.responsibilities} 
              onChange={handleChange} 
              placeholder="What will they do?" 
              rows="4" 
            />
          </div>
          <div className="form-group">
            <label>Required Qualifications</label>
            <textarea 
              name="qualifications" 
              value={job.qualifications} 
              onChange={handleChange} 
              placeholder="Skills and experience..." 
              rows="4" 
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : editingJob ? "Update Listing" : "Post Opportunity"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;