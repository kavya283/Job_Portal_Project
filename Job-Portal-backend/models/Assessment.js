const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({

  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },

  questions: [
    {
      question: {
        type: String,
        required: true
      },

      options: {
        type: [String],
        required: true
      },

      correctAnswer: {
        type: String,
        required: true
      }
    }
  ],

  totalQuestions: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
