const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: String
    },

    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview_scheduled",
        "interview_completed",
        "assessment_assigned",
        "assessment_submitted",
        "offer_sent",
        "hired",
        "rejected"
      ],
      default: "applied",
    },

    assessmentStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started"
    },

    assessmentScore: {
      type: Number,
      default: 0
    },

    assessmentResult: {
      type: String,
      enum: ["pending", "pass", "fail"],
      default: "pending"
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
