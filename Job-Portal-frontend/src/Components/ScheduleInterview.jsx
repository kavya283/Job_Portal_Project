import { useParams, useNavigate, useLocation } from "react-router-dom";
import InterviewWizard from "../Components/InterviewWizard";
import "../styles/ScheduleInterview.css";

const ScheduleInterview = () => {

  const { applicationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ ADDED

  const candidate = location.state?.candidate; // ✅ GET DATA

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    alert("Interview scheduled successfully");
    navigate("/employer/home");
  };

  if (!applicationId) {
    return (
      <div className="error-container">
        <h3>Invalid Application</h3>
        <p>Please try scheduling the interview again.</p>
      </div>
    );
  }

  return (
    <div className="schedule-interview-page">

      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2>Schedule Interview</h2>
      </div>

      <InterviewWizard
        applicationId={applicationId}
        candidate={candidate}   // ✅ FIXED
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

    </div>
  );
};

export default ScheduleInterview;
