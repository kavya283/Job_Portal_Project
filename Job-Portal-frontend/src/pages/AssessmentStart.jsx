import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "../styles/assessment.css";

const AssessmentStart = () => {

  const navigate = useNavigate();
  const { jobId } = useParams();

  const startAssessment = async () => {

    try {

      const res = await axios.get(`/assessment/start/${jobId}`);

      navigate(`/assessment/test/${jobId}`, {
        state: { questions: res.data.questions }
      });

    } catch (err) {
      alert(err.response?.data?.message);
    }

  };

  return (
    <div className="assessment-bg">
      <div className="start-card">
        <h1>Skill Assessment</h1>

        <p>Complete this test to get shortlisted.</p>

        <button className="primary-btn" onClick={startAssessment}>
          Start Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentStart;
