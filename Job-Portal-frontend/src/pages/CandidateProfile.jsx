import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/CandidateProfile.css";
import ResumeButton from "../Components/ResumeButton";

const CandidateProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    bio: "",
    resumePath: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/candidate/me");
        if (res.data) {
          setProfile({
            ...res.data,
            skills: Array.isArray(res.data.skills)
              ? res.data.skills.join(", ")
              : res.data.skills,
            resumePath: res.data.resumePath || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle resume selection
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size cannot exceed 5MB.");
      return;
    }

    setResumeFile(file);
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profile.name || !profile.skills) {
      alert("Please fill in at least Name and Skills.");
      return;
    }

    try {
      const formData = new FormData();
      ["name", "email", "phone", "skills", "bio"].forEach((key) => {
        formData.append(key, profile[key] || "");
      });

      if (resumeFile) {
        formData.append("resume", resumeFile); // must match backend multer field
      }

      const res = await api.put("/candidate/profile", formData);
      const updated = res.data.profile || res.data;

      setProfile({
        ...updated,
        skills: Array.isArray(updated.skills)
          ? updated.skills.join(", ")
          : updated.skills,
        resumePath: updated.resumePath || "",
      });

      setIsEditing(false);
      setResumeFile(null);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Error updating profile.");
    }
  };
  

  return (
    <div className="candidate-profile-container">
      <div className="profile-card">
        <h1>👤 My Profile</h1>
        <p className="subtitle">Manage your personal and professional presence</p>

        {/* Personal Details */}
        <div className="form-section">
          <h3>Personal Details</h3>
          <div className="two-column">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="form-section">
          <h3>Professional Profile</h3>
          <div className="form-group">
            <label>Skills (Comma Separated)</label>
            <input
              name="skills"
              value={profile.skills || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="React, Node, MongoDB"
            />
            <div className="skills-container">
              {profile.skills
                ? profile.skills.split(",").map(
                    (skill, idx) =>
                      skill.trim() && (
                        <span key={idx} className="skill-tag">
                          {skill.trim()}
                        </span>
                      )
                  )
                : <p className="text-muted" style={{ fontSize: "12px" }}>
                    No skills added yet
                  </p>}
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Write a short bio about yourself"
            />
          </div>

          {/* Resume */}
          <div className="form-group">
            <label>Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
              disabled={!isEditing}
            />
            {(profile.resumePath || resumeFile) && !isEditing && (
              <a
                href={
                  resumeFile
                    ? URL.createObjectURL(resumeFile)
                    : `http://localhost:5000${profile.resumePath}`
                }
                target="_blank"
                rel="noreferrer"
                className="view-resume-link"
              >
                📄 {resumeFile ? "Preview Resume" : "View Current Resume"}
              </a>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <div className="left-actions">
            <button
              className="edit-btn"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setResumeFile(null);
                } else setIsEditing(true);
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>

            {isEditing && (
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>
          {/* Resume button fixed right */}
          {!isEditing && (
            <button
              className="resume-btn"
              onClick={() => window.open("/api/resume/download")}
            >
              📄 Download Resume
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CandidateProfile;
