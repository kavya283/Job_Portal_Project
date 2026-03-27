const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createAssessment,
  uploadAssessmentExcel,
  startAssessment,
  submitAssessment,
  getCandidateResult,
  getJobAssessmentResults
} = require("../controllers/assessmentController");

const { authMiddleware, employerOnly } = require("../middleware/authMiddleware");

/* ================================
   MULTER CONFIG
================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================================
   ROUTES
================================ */

router.post("/create/:jobId", authMiddleware, employerOnly, createAssessment);

/* EXCEL UPLOAD ROUTE */

router.post(
  "/upload-excel/:jobId",
  authMiddleware,
  employerOnly,
  upload.single("file"),
  uploadAssessmentExcel
);

router.get("/start/:jobId", authMiddleware, startAssessment);

router.post("/submit/:jobId", authMiddleware, submitAssessment);

router.get("/result/:jobId", authMiddleware, getCandidateResult);

router.get(
  "/job-results/:jobId",
  authMiddleware,
  employerOnly,
  getJobAssessmentResults
);

module.exports = router;
