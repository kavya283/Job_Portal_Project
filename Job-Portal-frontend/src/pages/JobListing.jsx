import { useEffect, useState } from "react";
import api from "../api/axios";
import JobCard from "../components/JobCard";
import "../styles/JobListing.css";

const JobListing = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="job-listing-page">
      <h1>Available Jobs</h1>

      {jobs.length === 0 ? (
        <p className="empty-text">No jobs available</p>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListing;
