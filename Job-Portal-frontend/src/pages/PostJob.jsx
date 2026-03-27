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
    companyName: "",
    location: "",
    jobType: "full-time",
    experienceRequired: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    qualifications: "",
    responsibilities: "",
    skills: "",
    status: "open",
    hasAssessment: false,
    assessmentDuration: 30,
    assessmentPassingScore: 60,
    interviewRequired: true,
    expiryDate: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingJob) {
      setJob({
        ...editingJob,
        skills: editingJob.skills ? editingJob.skills.join(", ") : "",
        salaryMin: editingJob.salaryMin || "",
        salaryMax: editingJob.salaryMax || "",
        experienceRequired: editingJob.experienceRequired || "",
        expiryDate: editingJob.expiryDate
          ? editingJob.expiryDate.substring(0, 10)
          : ""
      });
    }
  }, [editingJob]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setJob((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...job,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      experienceRequired: job.experienceRequired
        ? Number(job.experienceRequired)
        : 0,
      skills: job.skills
        ? job.skills.split(",").map((s) => s.trim())
        : []
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

        <div className="form-header">
          <h2>{editingJob ? "Edit Job Listing" : "Create New Job Listing"}</h2>
          <p>Fill the details below to publish a job opportunity</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">

          {/* BASIC INFO */}
          <div className="form-section">
            <h3 className="section-title">📋 Basic Information</h3>

            <div className="form-group">
              <label>Position Title</label>
              <input
                name="title"
                value={job.title}
                onChange={handleChange}
                placeholder="MERN Stack Developer"
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                name="companyName"
                value={job.companyName}
                onChange={handleChange}
                placeholder="e.g. Infosys"
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
                  placeholder="Development"
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
          </div>

          {/* JOB DETAILS */}
          <div className="form-section">
            <h3 className="section-title">💼 Job Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Job Type</label>
                <select
                  name="jobType"
                  value={job.jobType}
                  onChange={handleChange}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label>Experience Required</label>
                <input
                  type="number"
                  name="experienceRequired"
                  value={job.experienceRequired}
                  onChange={handleChange}
                  placeholder="Years"
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
                />
              </div>

              <div className="form-group">
                <label>Max Salary</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={job.salaryMax}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Required Skills</label>
              <input
                name="skills"
                value={job.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-section">
            <h3 className="section-title">📝 Job Description</h3>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={job.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Responsibilities</label>
              <textarea
                name="responsibilities"
                value={job.responsibilities}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Qualifications</label>
              <textarea
                name="qualifications"
                value={job.qualifications}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          {/* ASSESSMENT */}
          <div className="form-section">
            <h3 className="section-title">🧠 Assessment Settings</h3>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasAssessment"
                  checked={job.hasAssessment}
                  onChange={handleChange}
                />
                Enable Online Assessment
              </label>
            </div>

            {job.hasAssessment && (
              <div className="form-row assessment-settings">
                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    name="assessmentDuration"
                    value={job.assessmentDuration}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Passing Score (%)</label>
                  <input
                    type="number"
                    name="assessmentPassingScore"
                    value={job.assessmentPassingScore}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* INTERVIEW */}
          <div className="form-section">
            <h3 className="section-title">🎤 Interview</h3>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="interviewRequired"
                  checked={job.interviewRequired}
                  onChange={handleChange}
                />
                Interview Required
              </label>
            </div>
          </div>

          {/* ADVANCED */}
          <div className="form-section">
            <h3 className="section-title">⚙ Advanced Settings</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={job.expiryDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={job.status}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : editingJob
              ? "Update Listing"
              : "Post Opportunity"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default PostJob;
