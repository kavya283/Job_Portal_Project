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
    achievements: "",
    certifications: "",

    experience: [],
    education: [],
    projects: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/resume");
        const r = res.data;

        setForm({
          name: r.name || "",
          title: r.title || "",
          email: r.email || "",
          phone: r.phone || "",
          location: r.location || "",
          bio: r.bio || "",
          skills: (r.skills || []).join(", "),
          languages: (r.languages || []).join(", "),
          achievements: (r.achievements || []).join(", "),
          certifications: (r.certifications || []).map(c => c.title).join(", "),
          experience: r.experience || [],
          education: r.education || [],
          projects: r.projects || []
        });

      } catch (err) {
        console.log("No data");
      }
      setLoading(false);
    };

    load();
  }, []);

  /* ================= GENERIC ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= DOWNLOAD (NEW) ================= */
  const handleDownload = async () => {
    try {
      const res = await api.get("/resume/download", {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/resume/update", {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()),
        languages: form.languages.split(",").map(l => l.trim()),
        achievements: form.achievements.split(",").map(a => a.trim()),
        certifications: form.certifications.split(",").map(c => ({
          title: c.trim(),
          issuer: "",
          year: ""
        }))
      });

      alert("Saved!");
    } catch {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  /* ================= EXPERIENCE ================= */
  const addExperience = () => {
    setForm({
      ...form,
      experience: [...form.experience, { company: "", role: "", duration: "", description: "" }]
    });
  };

  const updateExperience = (i, field, value) => {
    const updated = [...form.experience];
    updated[i][field] = value;
    setForm({ ...form, experience: updated });
  };

  const removeExperience = (i) => {
    setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) });
  };

  /* ================= EDUCATION ================= */
  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { degree: "", college: "", year: "" }]
    });
  };

  const updateEducation = (i, field, value) => {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm({ ...form, education: updated });
  };

  const removeEducation = (i) => {
    setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });
  };

  /* ================= PROJECTS ================= */
  const addProject = () => {
    setForm({
      ...form,
      projects: [...form.projects, { name: "", description: "" }]
    });
  };

  const updateProject = (i, field, value) => {
    const updated = [...form.projects];
    updated[i][field] = value;
    setForm({ ...form, projects: updated });
  };

  const removeProject = (i) => {
    setForm({ ...form, projects: form.projects.filter((_, idx) => idx !== i) });
  };

  if (loading) return <h2 style={{ padding: 80 }}>Loading...</h2>;

  return (
    <div className="resume-editor">
      <div className="editor-card">

        <h1>Resume Builder</h1>

        {/* BASIC INFO */}
        <div className="form-grid">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Summary" />

          <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills" />
          <input name="languages" value={form.languages} onChange={handleChange} placeholder="Languages" />
          <input name="achievements" value={form.achievements} onChange={handleChange} placeholder="Achievements" />
          <input name="certifications" value={form.certifications} onChange={handleChange} placeholder="Certifications" />
        </div>

        {/* EXPERIENCE */}
        <h3>Experience</h3>
        {form.experience.map((exp, i) => (
          <div key={i}>
            <input placeholder="Company" value={exp.company}
              onChange={e => updateExperience(i, "company", e.target.value)} />
            <input placeholder="Role" value={exp.role}
              onChange={e => updateExperience(i, "role", e.target.value)} />
            <input placeholder="Duration" value={exp.duration}
              onChange={e => updateExperience(i, "duration", e.target.value)} />
            <textarea placeholder="Description" value={exp.description}
              onChange={e => updateExperience(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeExperience(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addExperience}>+ Add Experience</button>

        {/* EDUCATION */}
        <h3>Education</h3>
        {form.education.map((edu, i) => (
          <div key={i}>
            <input placeholder="Degree" value={edu.degree}
              onChange={e => updateEducation(i, "degree", e.target.value)} />
            <input placeholder="College" value={edu.college}
              onChange={e => updateEducation(i, "college", e.target.value)} />
            <input placeholder="Year" value={edu.year}
              onChange={e => updateEducation(i, "year", e.target.value)} />
            <button type="button" onClick={() => removeEducation(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addEducation}>+ Add Education</button>

        {/* PROJECTS */}
        <h3>Projects</h3>
        {form.projects.map((p, i) => (
          <div key={i}>
            <input placeholder="Project Name" value={p.name}
              onChange={e => updateProject(i, "name", e.target.value)} />
            <textarea placeholder="Description" value={p.description}
              onChange={e => updateProject(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeProject(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addProject}>+ Add Project</button>

        {/* ACTIONS */}
        <div className="editor-actions">
          <button className="save-btn" onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            className="download-btn"
            type="button"
            onClick={handleDownload}
          >
            Download
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
