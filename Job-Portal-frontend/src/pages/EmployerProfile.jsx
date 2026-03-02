import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/EmployerProfile.css";

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api
      .get("/employer/profile")
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err.message);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // --------------------
    // VALIDATION
    // --------------------
    if (!profile.companyName.trim() || !profile.email.trim()) {
      alert("Company Name and Email are required!");
      return;
    }

    try {
      const res = await api.put("/employer/profile", profile);
      setProfile(res.data); // Update profile with returned data
      setIsEditing(false);
      alert("Profile updated successfully! ✅");
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="employer-profile-page">
      <div className="profile-card">
        <h1>🏢 Employer Profile</h1>
        <p className="subtitle">
          Manage your company information visible to candidates
        </p>

        {/* -------------------- COMPANY DETAILS -------------------- */}
        <div className="form-section">
          <h3>Company Details</h3>

          <div className="form-group">
            <label>Company Name</label>
            <input
              name="companyName"
              placeholder="e.g. Google Inc."
              value={profile.companyName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Industry</label>
            <input
              name="industry"
              placeholder="e.g. IT Services, Healthcare"
              value={profile.industry}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* -------------------- CONTACT INFO -------------------- */}
        <div className="form-section">
          <h3>Contact Information</h3>

          <div className="two-column">
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="company@email.com"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              name="website"
              placeholder="https://www.company.com"
              value={profile.website}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* -------------------- ABOUT COMPANY -------------------- */}
        <div className="form-section">
          <h3>About Company</h3>
          <div className="form-group">
            <label>Company Description</label>
            <textarea
              name="description"
              placeholder="Describe your company, culture, and mission..."
              rows="5"
              value={profile.description}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* -------------------- ACTION BUTTONS -------------------- */}
        <div className="profile-actions">
          <button
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>

          {isEditing && (
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
