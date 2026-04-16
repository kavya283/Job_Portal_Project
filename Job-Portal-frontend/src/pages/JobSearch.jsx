import { useEffect, useState } from "react";
import api from "../api/axios";
import JobCard from "../Components/JobCard";
import "../styles/JobSearch.css";

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    minSalary: "",
    maxSalary: "",
  });

  // Dark Mode Toggle
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = {};

      if (filters.keyword.trim()) {
        queryParams.keyword = filters.keyword.trim();
      }

      if (filters.location.trim()) {
        queryParams.location = filters.location.trim();
      }

      const min = parseInt(filters.minSalary, 10);
      const max = parseInt(filters.maxSalary, 10);

      if (!isNaN(min)) queryParams.minSalary = min;
      if (!isNaN(max)) queryParams.maxSalary = max;

      const res = await api.get("/jobs/search", { params: queryParams });

      let filteredJobs = res.data || [];

      // Frontend overlap filtering (handles inconsistent backend data)
      filteredJobs = filteredJobs.filter(job => {
        const jobMin = job.salaryMin || 0;
        const jobMax = job.salaryMax || 0;

        if (!isNaN(min) && jobMax < min) return false;
        if (!isNaN(max) && jobMin > max) return false;

        return true;
      });

      setJobs(filteredJobs);
    } catch (err) {
      console.error("Search failed:", err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(fetchJobs, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="job-search-page">
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="search-header-bg">
        <h1>Find Your Next Career Move</h1>
        <p>Discover opportunities from top companies worldwide</p>

        <div className="search-filter-card">

          {/* Keyword */}
          <div className="input-with-icon">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Job title or role"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
          </div>

          <div className="v-divider"></div>

          {/* Location */}
          <div className="input-with-icon">
            <span className="icon">📍</span>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          <div className="v-divider"></div>

          {/* 💰 Min Salary */}
          <div className="input-with-icon">
            <span className="icon">💰</span>
            <input
              type="number"
              placeholder="Min Salary"
              value={filters.minSalary}
              onChange={(e) =>
                setFilters({ ...filters, minSalary: e.target.value })
              }
            />
          </div>

          {/* 💰 Max Salary */}
          <div className="input-with-icon">
            <span className="icon">💰</span>
            <input
              type="number"
              placeholder="Max Salary"
              value={filters.maxSalary}
              onChange={(e) =>
                setFilters({ ...filters, maxSalary: e.target.value })
              }
            />
          </div>

          <button className="search-action-btn" onClick={fetchJobs}>
            Search
          </button>
        </div>
      </div>

      <div className="results-container">
        {loading ? (
          <div className="loading-spinner">Searching for jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="no-results">
            <h3>No jobs found matching your criteria</h3>
            <p>Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="job-results-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
