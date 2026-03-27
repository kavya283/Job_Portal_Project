const express = require("express");
const router = express.Router();

const {
  scheduleInterview,
  getEmployerInterviews,
  getCandidateInterviews,
  respondInterview,
  completeInterview,
  deleteInterview,
} = require("../controllers/interviewController");

const {
  authMiddleware,
  employerOnly,
  candidateOnly,
} = require("../middleware/authMiddleware");


// 👔 Employer Routes
router.post("/schedule", authMiddleware, employerOnly, scheduleInterview);
router.get("/employer", authMiddleware, employerOnly, getEmployerInterviews);
router.put("/:id/complete", authMiddleware, employerOnly, completeInterview);
router.delete("/:id", authMiddleware, employerOnly, deleteInterview);


// 👤 Candidate Routes
router.get("/candidate", authMiddleware, candidateOnly, getCandidateInterviews);
router.put("/:id/respond", authMiddleware, candidateOnly, respondInterview);

module.exports = router;
