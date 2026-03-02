const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,

  bio: String,
  title: String,
  location: String,

  // ⭐ change from String → Array
  skills: [String],
  languages: [String],

  // ⭐ structured resume sections
  experience: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    }
  ],

  education: [
    {
      degree: String,
      college: String,
      year: String,
    }
  ],

  projects: [
    {
      name: String,
      description: String,
    }
  ],

  // ⭐ optional uploaded file
  resumePath: String,

}, { timestamps: true });

module.exports = mongoose.model("Candidate", CandidateSchema);
