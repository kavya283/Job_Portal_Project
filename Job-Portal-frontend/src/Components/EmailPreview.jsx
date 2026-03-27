const EmailPreview = ({ formData, candidate, company }) => {
  return (
    <div className="preview-card email-preview">

      {/* HEADER */}
      <div className="email-header">
        <h3>{company || "Your Company"}</h3>
        <span>Interview Invitation</span>
      </div>

      {/* BODY */}
      <div className="email-body">

        <p>
          Dear <b>{candidate?.name || "Candidate"}</b>,
        </p>

        <p>
          We are pleased to invite you to attend the{" "}
          <b>{formData.roundName || "Interview Round"}</b>.
        </p>

        {/* DETAILS */}
        <div className="email-details">

          <p>
            <strong>📅 Date & Time:</strong><br />
            {formData.date
              ? new Date(formData.date).toLocaleString()
              : "Not selected"}
          </p>

          <p>
            <strong>📍 Mode:</strong> {formData.mode}
          </p>

          <p>
            <strong>
              {formData.mode === "Online"
                ? "🔗 Meeting Link:"
                : "📍 Location:"}
            </strong><br />
            {formData.mode === "Online"
              ? formData.meetingLink || "Pending"
              : formData.location || "Pending"}
          </p>

        </div>

        {/* MESSAGE */}
        <p className="email-message">
          {formData.message ||
            "Please be available on time. We look forward to your participation."}
        </p>

        <p>
          Best regards,<br />
          <b>{company || "HR Team"}</b>
        </p>

      </div>

    </div>
  );
};

export default EmailPreview;
