const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // 🔹 Basic Info
  name: String,
  email: String,
  phone: String,
  title: String,          // ⭐ Job role (e.g. MERN Developer)
  location: String,
  bio: String,            // ⭐ summary

  // 🔹 Skills & Languages
  skills: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: []
  },

  // 🔹 Education
  education: [
    {
      degree: String,
      college: String,
      year: String
    }
  ],

  // 🔹 Experience
  experience: [
    {
      role: String,
      company: String,
      duration: String,
      description: String   // ⭐ IMPORTANT (fills empty space)
    }
  ],

  // 🔹 Projects
  projects: [
    {
      name: String,
      description: String
    }
  ],

  // 🔹 Extra Sections (🔥 makes resume look full always)
  certifications: [
    {
      title: String,
      issuer: String,
      year: String
    }
  ],

  achievements: [String],

  // 🔹 UI Customization
  template: {
    type: String,
    default: "modern"
  }

}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
