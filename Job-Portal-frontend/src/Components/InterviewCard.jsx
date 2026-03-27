import { useEffect, useState } from "react";
import "../styles/InterviewCard.css";

const InterviewCard = ({ interview, onRespond }) => {

  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {

    const updateTimer = () => {

      const now = new Date().getTime();
      const interviewTime = new Date(interview.date).getTime();
      const difference = interviewTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Interview Completed");
        return;
      }

      if (difference <= 15 * 60 * 1000) {
        setCanJoin(true);
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);

    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);

    return () => clearInterval(interval);

  }, [interview.date]);


  const getStatusColor = () => {
    if (isExpired) return "#6c757d";
    if (interview.candidateResponse === "accepted") return "#28a745";
    if (interview.candidateResponse === "declined") return "#dc3545";
    return "#f39c12";
  };


  const getStatusText = () => {
    if (isExpired) return "Completed";
    if (interview.candidateResponse === "accepted") return "Accepted";
    if (interview.candidateResponse === "declined") return "Declined";
    return "Pending";
  };


  return (
    <div className="interview-card">

      <div className="card-header">

        <h3>{interview.roundName}</h3>

        <span
          className="status-badge"
          style={{ background: getStatusColor() }}
        >
          {getStatusText()}
        </span>

      </div>


      <div className="interview-info">

        <p>
          <strong>🏢 Company:</strong>{" "}
          {interview.application?.job?.companyName}
        </p>

        <p>
          <strong>💼 Job:</strong>{" "}
          {interview.application?.job?.title}
        </p>

        <p>
          <strong>📅 Date:</strong>{" "}
          {new Date(interview.date).toLocaleString()}
        </p>

        <p>
          <strong>🎥 Mode:</strong> {interview.mode}
        </p>

      </div>


      {interview.mode === "Online" && (
        <div className="meeting-section">

          <strong>🔗 Meeting Link:</strong>

          {canJoin ? (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="join-btn"
            >
              Join Interview
            </a>
          ) : (
            <span className="waiting-text">
              Available 15 minutes before interview
            </span>
          )}

        </div>
      )}


      {interview.mode === "Offline" && (
        <p>
          <strong>📍 Location:</strong> {interview.location}
        </p>
      )}


      {interview.message && (
        <div className="message-box">
          {interview.message}
        </div>
      )}


      <div className="countdown">

        {isExpired
          ? "✅ Interview Completed"
          : `⏳ Starts In: ${timeLeft}`}

      </div>


      {interview.candidateResponse === "pending" && !isExpired && (
        <div className="action-buttons">

          <button
            className="accept-btn"
            onClick={() => onRespond(interview._id, "accepted")}
          >
            Accept
          </button>

          <button
            className="decline-btn"
            onClick={() => onRespond(interview._id, "declined")}
          >
            Decline
          </button>

        </div>
      )}

    </div>
  );
};

export default InterviewCard;
