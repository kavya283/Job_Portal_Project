const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  name: String,
  email: String,
  phone: String,
  skills: [String],

  education: [
    {
      degree: String,
      college: String,
      year: String
    }
  ],

  experience: [
    {
      role: String,
      company: String,
      duration: String
    }
  ],

  projects: [
    {
      title: String,
      description: String
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
