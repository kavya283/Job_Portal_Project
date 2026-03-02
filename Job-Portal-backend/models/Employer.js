const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  industry: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Employer", employerSchema);
