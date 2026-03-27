import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "../styles/EmployerInterviewPage.css";

const EmployerInterviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId } = useParams(); // ✅ ADDED

  const selectedApplication = location.state?.selectedApplication;

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    roundName: "",
    mode: "Online",
    meetingLink: "",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  /* ================= SAFETY ================= */
  useEffect(() => {
    if (!selectedApplication) {
      toast.error("Application not found");
      navigate("/employer/home"); // ✅ FIXED
    }
  }, [selectedApplication, navigate]);

  /* ================= HANDLER ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= VALIDATION ================= */
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.roundName) newErrors.roundName = "Required";
      if (!date) newErrors.date = "Required";
    }

    if (step === 2) {
      if (formData.mode === "Online" && !formData.meetingLink) {
        newErrors.meetingLink = "Required";
      }
      if (formData.mode === "Offline" && !formData.location) {
        newErrors.location = "Required";
      }
    }

    if (step === 3) {
      if (!formData.message) newErrors.message = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= NAVIGATION ================= */
  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
    else toast.error("Please fill all required fields");
  };

  const prevStep = () => setStep(step - 1);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);

      const finalData = {
        ...formData,
        date,
        applicationId: applicationId, // ✅ USING PARAM
      };

      console.log("Submitting:", finalData);

      await api.post("/interviews/schedule", finalData);

      toast.success("Interview Scheduled 🎉");

      setTimeout(() => {
        // ✅ REDIRECT BACK TO APPLICANTS PAGE
        navigate(`/job-applicants/${selectedApplication.job}`);
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule interview ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedApplication) return null;

  return (
    <div className="interview-page glass-bg">

      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Schedule Interview</h2>
      </div>

      <div className="layout">

        {/* LEFT PANEL */}
        <div className="left-panel glass">

          <div className="candidate-card">
            <img
              src={
                selectedApplication.candidate?.avatar ||
                "https://i.pravatar.cc/100"
              }
              alt=""
            />
            <div>
              <h3>{selectedApplication.candidate?.name}</h3>
              <p>{selectedApplication.candidate?.email}</p>
            </div>
          </div>

          <div className="stepper">
            {[1, 2, 3].map((s) => (
              <div key={s} className={step >= s ? "step active" : "step"}>
                {s}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="form"
          >

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <input
                  name="roundName"
                  placeholder="Round Name"
                  onChange={handleChange}
                />
                {errors.roundName && (
                  <span className="error">{errors.roundName}</span>
                )}

                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Select Date & Time"
                  className="date-picker"
                />
                {errors.date && (
                  <span className="error">{errors.date}</span>
                )}

                <button onClick={nextStep}>Next →</button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <select name="mode" onChange={handleChange}>
                  <option>Online</option>
                  <option>Offline</option>
                </select>

                {formData.mode === "Online" && (
                  <>
                    <input
                      name="meetingLink"
                      placeholder="Meeting Link"
                      onChange={handleChange}
                    />
                    {errors.meetingLink && (
                      <span className="error">{errors.meetingLink}</span>
                    )}
                  </>
                )}

                {formData.mode === "Offline" && (
                  <>
                    <input
                      name="location"
                      placeholder="Location"
                      onChange={handleChange}
                    />
                    {errors.location && (
                      <span className="error">{errors.location}</span>
                    )}
                  </>
                )}

                <div className="btn-group">
                  <button onClick={prevStep}>← Back</button>
                  <button onClick={nextStep}>Next →</button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <textarea
                  name="message"
                  placeholder="Write message..."
                  onChange={handleChange}
                />
                {errors.message && (
                  <span className="error">{errors.message}</span>
                )}

                <div className="btn-group">
                  <button onClick={prevStep}>← Back</button>
                  <button
                    className="primary-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Scheduling..." : "Schedule"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          <div className="preview-card glass">
            <h3>📩 Email Preview</h3>
            <div className="email-template">
              <p>Dear {selectedApplication.candidate?.name},</p>
              <p>
                You are invited for{" "}
                <b>{formData.roundName || "Interview"}</b>
              </p>
              <p>{date ? date.toLocaleString() : "Date not selected"}</p>
              <p>
                {formData.mode === "Online"
                  ? formData.meetingLink || "Meeting link pending"
                  : formData.location || "Location pending"}
              </p>
              <p>{formData.message || "Message will appear here"}</p>
              <br />
              <p>Best Regards,</p>
              <p>{selectedApplication.employer?.companyName}</p>
            </div>
          </div>

          <div className="preview-card glass">
            <h3>📊 Progress</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployerInterviewPage;
