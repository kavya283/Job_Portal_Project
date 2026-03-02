const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const { authMiddleware } = require("../middleware/authMiddleware");
const Job = require("../models/Job");
const { createAndSendNotification } = require("../services/notificationService");
const Notification = require("../models/Notification");
const uploadResume = require("../middleware/uploadMiddleware");

/* ======================
   APPLY TO JOB
   ====================== */
router.post("/", authMiddleware, uploadResume.single("resume"), async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId || !req.file) {
      return res.status(400).json({ message: "Job ID and resume required" });
    }

    const job = await Job.findById(jobId).populate("employer", "email companyName");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const resumePath = `/uploads/resumes/${req.file.filename}`;

    const newApp = await Application.create({
      job: jobId,
      candidate: req.user.id,
      resume: resumePath,
    });

    const io = req.app.get("socketio");

    // Notify Employer
    await createAndSendNotification(io, {
      recipientId: job.employer._id,
      recipientRole: "employer",
      recipientEmail: job.employer.email,
      message: `New candidate applied for ${job.title}`,
      type: "APPLICATION_RECEIVED",
      jobId: job._id,
      senderId: req.user.id,
      jobTitle: job.title,
      companyName: job.employer.companyName,
    });

    // Notify Candidate
    await createAndSendNotification(io, {
      recipientId: req.user.id,
      recipientRole: "candidate",
      recipientEmail: req.user.email,
      message: `You successfully applied for ${job.title}`,
      type: "APPLICATION_SUBMITTED",
      jobId: job._id,
      senderId: job.employer._id,
      jobTitle: job.title,
      companyName: job.employer.companyName,
    });

    res.status(201).json(newApp);
  } catch (err) {
    console.error("Application Error:", err);
    res.status(500).json({ message: err.message });
  }
});


/* ======================
   GET MY APPLICATIONS
   ====================== */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const apps = await Application.find({ candidate: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});


/* ======================
   DELETE APPLICATION
   ====================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.candidate.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔥 delete notifications of this job
    await Notification.deleteMany({ job: application.job });

    await application.deleteOne();

    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Delete Route Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
