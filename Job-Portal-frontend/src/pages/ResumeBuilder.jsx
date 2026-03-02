import { useState } from "react";
import axios from "axios";

export default function ResumeBuilder() {

  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);

  const uploadExcel = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "/api/resume/upload",
      formData,
      { withCredentials: true }
    );

    setProfile(res.data);
  };

  const downloadResume = () => {
    window.open(`/api/resume/generate/${profile.userId}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Resume Builder</h2>

      <input
        type="file"
        onChange={e => setFile(e.target.files[0])}
      />

      <button onClick={uploadExcel}>
        Upload Excel
      </button>

      {profile && (
        <>
          <h3>Preview</h3>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>

          <button onClick={downloadResume}>
            Download Resume PDF
          </button>
        </>
      )}
    </div>
  );
}
