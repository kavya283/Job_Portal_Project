import { useState } from "react";
import api from "../api/axios";

const ResumeButton = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleGenerateResume = async () => {
    try {
      setLoading(true);

      const res = await api.get("/resume/download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setPreviewUrl(url);
      setShowPreview(true);

    } catch (err) {
      alert("Error generating resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleGenerateResume} className="resume-btn">
        📄 Generate Resume
      </button>

      {/* LOADER */}
      {loading && (
        <div className="resume-loader">
          <div className="spinner"></div>
          <p>Generating your resume...</p>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="resume-modal">
          <div className="resume-modal-content">

            <div className="modal-header">
              <h3>Resume Preview</h3>
              <button onClick={() => setShowPreview(false)}>✖</button>
            </div>

            <iframe
              src={previewUrl}
              title="Resume Preview"
              className="resume-frame"
            />

            <div className="modal-actions">
              <a href={previewUrl} download="resume.pdf" className="download-btn">
                Download PDF
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ResumeButton;
