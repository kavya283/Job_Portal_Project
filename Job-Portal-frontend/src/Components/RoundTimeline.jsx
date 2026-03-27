const RoundTimeline = ({ round, date }) => {
  return (
    <div className="preview-card">

      <h3>⏳ Timeline</h3>

      <p><strong>Round:</strong> {round || "Not set"}</p>

      <p>
        <strong>Date:</strong>{" "}
        {date ? new Date(date).toLocaleString() : "Not selected"}
      </p>

    </div>
  );
};

export default RoundTimeline;
