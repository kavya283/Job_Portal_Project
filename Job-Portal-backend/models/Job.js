const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    role: { type: String },
    companyName: { type: String, required: true }, // recommended required
    description: { type: String },
    qualifications: { type: String },
    responsibilities: { type: String },
    location: { type: String, required: true },
    salaryMin: { type: Number, min: 0 }, // prevent negative salaries
    salaryMax: { type: Number, min: 0 },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
  },
  { timestamps: true }
);

/* 🔍 SEARCH INDEX UPDATED */
jobSchema.index({
  title: "text",
  role: "text",
  description: "text",
  qualifications: "text",
  responsibilities: "text",
  location: "text",
});

module.exports = mongoose.model("Job", jobSchema);
