import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/ResumeEditor.css";

const ResumeEditor = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    languages: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/candidate/me");
        const p = res.data;

        setForm({
          name: p.name || "",
          title: p.title || "",
          email: p.email || "",
          phone: p.phone || "",
          location: p.location || "",
          bio: p.bio || "",
          skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills || "",
          languages: Array.isArray(p.languages) ? p.languages.join(", ") : p.languages || "",
        });
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE RESUME ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/resume/update", {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()),
        languages: form.languages.split(",").map(l => l.trim()),
      });

      alert("✅ Resume updated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update resume");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async () => {
    try {
      const res = await api.get("/resume/download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("❌ Resume download failed");
    }
  };

  if (loading) return <h2 style={{ padding: 80 }}>Loading resume...</h2>;

  return (
    <div className="resume-editor">
      <div className="editor-card">

        <h1>Edit Resume</h1>

        <div className="form-grid">

          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange}/>
          <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange}/>
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange}/>
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange}/>
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange}/>

          <textarea name="bio" placeholder="Professional Summary" value={form.bio} onChange={handleChange}/>

          <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange}/>
          <input name="languages" placeholder="Languages (comma separated)" value={form.languages} onChange={handleChange}/>

        </div>

        <div className="editor-actions">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Resume"}
          </button>

          <button className="download-btn" onClick={handleDownload}>
            Download PDF
          </button>

          <button className="back-btn" onClick={() => navigate("/candidate/home")}>
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResumeEditor;
