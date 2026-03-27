import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axios";
import "../styles/assessment.css";

const AssessmentTest = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { jobId } = useParams();

  const questions = location.state?.questions || [];

  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  /* ================= TIMER ================= */

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ================= SELECT ANSWER ================= */

  const selectAnswer = (index, option) => {
    const updated = [...answers];
    updated[index] = {
      questionIndex: index,
      selectedOption: option
    };
    setAnswers(updated);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

  if (answers.length !== questions.length) {
    alert("⚠ Please answer all questions");
    return;
  }

  try {
    await axios.post(`/assessment/submit/${jobId}`, { answers });
    navigate(`/assessment/result/${jobId}`);
  } catch {
    alert("Submission failed");
  }
};

  /* ================= TIMER FORMAT ================= */

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  /* ================= PROGRESS ================= */

  const progress = ((answers.filter(Boolean).length / questions.length) * 100).toFixed(0);

  return (
    <div className="assessment-bg">

      <div className="test-container">

        {/* HEADER */}
        <div className="test-header">
          <h2>Assessment Test</h2>
          <div className="timer">{formatTime()}</div>
        </div>

        {/* PROGRESS */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* QUESTION */}
        <div className="question-card">
          <h3>
            {currentQ + 1}. {questions[currentQ]?.question}
          </h3>

          <div className="options">
            {questions[currentQ]?.options.map((opt, i) => {

              const isSelected =
                answers[currentQ]?.selectedOption === opt;

              return (
                <div
                  key={i}
                  className={`option ${isSelected ? "selected" : ""}`}
                  onClick={() => selectAnswer(currentQ, opt)}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="nav-buttons">

          <button
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(prev => prev - 1)}
          >
            Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(prev => prev + 1)}>
              Next
            </button>
          ) : (
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          )}

        </div>

        {/* QUESTION DOTS */}
        <div className="question-dots">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`dot 
                ${answers[i] ? "answered" : ""}
                ${currentQ === i ? "active" : ""}
              `}
              onClick={() => setCurrentQ(i)}
            />
          ))}
        </div>

      </div>

    </div>
  );
};

export default AssessmentTest;
