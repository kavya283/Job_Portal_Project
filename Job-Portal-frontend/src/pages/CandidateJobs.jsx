import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/CandidateJobs.css";

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/search"); 
        setJobs(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading jobs...</p>;
  }
  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <div className="candidate-jobs-page">
      <h1>💼 Available Jobs</h1>
      {jobs.length === 0 ? (
        <p>No jobs available at the moment</p>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.companyName || "N/A"}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Description:</strong></p>
              <p className="job-desc">
                {job.description?.slice(0, 120)}...
              </p>
              <button className="apply-btn">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
