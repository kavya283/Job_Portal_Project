const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    salary: String,
    joiningDate: Date,
    offerPDF: String,

    status: {
      type: String,
      enum: ["sent", "accepted", "rejected"],
      default: "sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfferLetter", offerSchema);
