import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/assessment.css";

const AssessmentResult = () => {

  const { jobId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {

    const fetchResult = async () => {

      const res = await axios.get(`/assessment/result/${jobId}`);

      setResult(res.data);

    };

    fetchResult();

  }, [jobId]);

  if (!result) return <p>Loading...</p>;

  const total = result.totalQuestions || 0;
  const score = result.assessmentScore || 0;
  const percentage = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="assessment-bg">

      <div className="result-card">

        <h1>Result</h1>

        <h2>{score} / {total}</h2>

        <h3>{percentage}%</h3>

        <div className={result.assessmentResult}>
          {result.assessmentResult.toUpperCase()}
        </div>

        <button onClick={() => navigate("/my-applications")}>
          Back to My Applications
        </button>

      </div>

    </div>
  );
};

export default AssessmentResult;
