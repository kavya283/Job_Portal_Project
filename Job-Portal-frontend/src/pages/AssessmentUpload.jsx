import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import "../styles/AssessmentUpload.css";

const AssessmentUpload = () => {

  const { jobId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  /* =========================
     HANDLE FILE SELECT
  ========================= */

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      alert("⚠️ Only Excel files allowed");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  /* =========================
     HANDLE UPLOAD
  ========================= */

  const handleUpload = async () => {

    if (!file) {
      alert("⚠️ Please select file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `/assessment/upload-excel/${jobId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert(`✅ ${res.data.message}`);

      setTimeout(() => {
        navigate("/employer/my-jobs");
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-upload-wrapper">

      <div className="upload-card">

        <h2 className="upload-title">
          Upload Assessment Questions
        </h2>

        <p className="upload-info">
          Select Excel file and click upload
        </p>

        {/* ✅ FIX: WRAP INPUT PROPERLY */}
        <label className="file-upload-box">

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
          />

          <span className="upload-text">
            {fileName ? `📄 ${fileName}` : "Click to choose file"}
          </span>

        </label>

        {/* BUTTONS */}
        <div className="upload-actions">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/employer/my-jobs")}
          >
            ← Back
          </button>

          {/* ✅ IMPORTANT: type="button" prevents form/file trigger */}
          <button
            type="button"
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Excel"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AssessmentUpload;
