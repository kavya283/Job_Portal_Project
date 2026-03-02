import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/JobApplicants.css"; // new dedicated CSS

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/applicants/${jobId}`);
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchApplicants();
  }, [jobId]);

  if (loading) return <p className="loading">Loading applicants...</p>;

  return (
    <div className="applicants-container">
      <h2 className="page-title">Applicants for this Position</h2>

      {applications.length === 0 ? (
        <p className="no-applicants">No applications received yet.</p>
      ) : (
        applications.map((app) => (
          <div key={app._id} className="applicant-card">
            <div className="applicant-info">
              <p>
                <strong>Name:</strong> {app.candidate?.name || "Anonymous"}
              </p>
              <p>
                <strong>Email:</strong> {app.candidate?.email || "Not provided"}
              </p>
            </div>

            {app.resume && (
              <a
                href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${app.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-link"
              >
                📄 View Resume
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default JobApplicants;
