import { useState } from "react";
import EmailPreview from "../Components/EmailPreview";
import RoundTimeline from "./RoundTimeline";
import ProgressTracker from "./ProgressTracker";

const InterviewWizard = ({ applicationId, onClose, onSuccess, candidate }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    roundName: "",
    date: "",
    mode: "Online",
    meetingLink: "",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  /* HANDLE CHANGE (✅ FIXED: clears error instantly) */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ✅ remove error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* VALIDATION */
  const validateStep = () => {
    let err = {};

    if (step === 1) {
      if (!formData.roundName) err.roundName = "Required";
      if (!formData.date) err.date = "Required";
    }

    if (step === 2) {
      if (formData.mode === "Online" && !formData.meetingLink) {
        err.meetingLink = "Required";
      }
      if (formData.mode === "Offline" && !formData.location) {
        err.location = "Required";
      }
    }

    if (step === 3) {
      if (!formData.message) err.message = "Required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* NAVIGATION */
  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  /* SUBMIT */
  const handleSubmit = () => {
    if (!validateStep()) return;

    console.log("Final Interview Data:", formData);

    onSuccess(); // ✅ correct flow
  };

  return (
    <div className="wizard-container glass-bg">

      {/* LEFT PANEL */}
      <div className="wizard-left glass">

        {/* Candidate */}
        <div className="wizard-header">
          <img
            src={candidate?.avatar || "https://i.pravatar.cc/100"}
            alt="avatar"
            className="avatar"
          />
          <div>
            <h3>{candidate?.name || "Candidate"}</h3>
            <p>{candidate?.email}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step ${step >= s ? "active" : ""}`}>
              {s}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="step-content fade">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3>Basic Info</h3>

              <input
                name="roundName"
                placeholder="Round Name"
                value={formData.roundName}
                onChange={handleChange}
                className={errors.roundName ? "input-error" : ""}
              />
              {errors.roundName && <span className="error">{errors.roundName}</span>}

              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? "input-error" : ""}
              />
              {errors.date && <span className="error">{errors.date}</span>}

              <button onClick={nextStep}>Next →</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h3>Mode</h3>

              <select name="mode" value={formData.mode} onChange={handleChange}>
                <option>Online</option>
                <option>Offline</option>
              </select>

              {formData.mode === "Online" && (
                <>
                  <input
                    name="meetingLink"
                    placeholder="Meeting Link"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className={errors.meetingLink ? "input-error" : ""}
                  />
                  {errors.meetingLink && <span className="error">{errors.meetingLink}</span>}
                </>
              )}

              {formData.mode === "Offline" && (
                <>
                  <input
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className={errors.location ? "input-error" : ""}
                  />
                  {errors.location && <span className="error">{errors.location}</span>}
                </>
              )}

              <div className="step-buttons">
                <button onClick={prevStep}>← Back</button>
                <button onClick={nextStep}>Next →</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h3>Message</h3>

              <textarea
                name="message"
                placeholder="Write message..."
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? "input-error" : ""}
              />
              {errors.message && <span className="error">{errors.message}</span>}

              <div className="step-buttons">
                <button onClick={prevStep}>← Back</button>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                >
                  Schedule
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="wizard-right">

        <div className="brand-card glass">
          <h3>🏢 Your Company</h3>
          <p>Interview Invitation</p>
        </div>

        {/* ✅ THIS WILL NOW UPDATE PROPERLY */}
        <EmailPreview formData={formData} candidate={candidate} />

        <RoundTimeline round={formData.roundName} date={formData.date} />
        <ProgressTracker step={step} />

      </div>
    </div>
  );
};

export default InterviewWizard;
