const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    roundName: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    candidateResponse: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
