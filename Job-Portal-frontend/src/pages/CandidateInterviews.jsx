import { useEffect, useState } from "react";
import api from "../api/axios";
import InterviewCard from "../Components/InterviewCard";
import "../styles/CandidateInterviews.css";

const CandidateInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await api.get("/interviews/candidate");

      const updated = res.data.map((interview) => {
        const interviewTime = new Date(interview.date);
        const now = new Date();

        if (interviewTime < now && interview.status !== "completed") {
          return { ...interview, status: "expired" };
        }

        return interview;
      });

      setInterviews(updated);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleRespond = async (id, response) => {
  try {
    console.log("📤 Sending response:", response);

    // ✅ FIXED: send status (not response)
    await api.put(`/interviews/${id}/respond`, {
      status: response,
    });

    // ✅ Update UI
    setInterviews((prev) =>
      prev.map((interview) =>
        interview._id === id
          ? {
              ...interview,
              candidateResponse:
                response.charAt(0).toUpperCase() + response.slice(1),
            }
          : interview
      )
    );

  } catch (err) {
    console.error("❌ Respond interview error:", err.response?.data || err);
  }
};

  return (
    <div className="interview-page">

      {/* HEADER */}
      <div className="interview-header">
        <h2>🎯 Your Scheduled Interviews</h2>
        <p>
          Manage and track all your upcoming interviews here.
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading interviews...</p>
        </div>
      ) : interviews.length === 0 ? (

        /* EMPTY STATE */
        <div className="no-interviews">
          <div className="empty-icon">📭</div>
          <h3>No Interviews Scheduled</h3>
          <p>
            Once recruiters schedule interviews, they will appear here.
          </p>
        </div>

      ) : (

        /* GRID */
        <div className="interview-grid">
          {interviews.map((item) => (
            <InterviewCard
              key={item._id}
              interview={item}
              onRespond={handleRespond}
            />
          ))}
        </div>

      )}
    </div>
  );
};

export default CandidateInterviews;
