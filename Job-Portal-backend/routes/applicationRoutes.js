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
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, function (err) {
      if (err) {
        console.error("Multer Error:", err.message);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const { jobId } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: "Job ID required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const job = await Job.findById(jobId).populate(
        "employer",
        "email companyName"
      );

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const resumePath = `/uploads/resumes/${req.file.filename}`;

      const newApp = await Application.create({
        job: jobId,
        candidate: req.user.id,
        employer: job.employer._id,
        resume: resumePath,
      });

      /* ================= 🔥 FIXED EMAIL + NOTIFICATION ================= */
      const io = req.app.get("socketio");

      console.log("📧 Employer Email:", job.employer.email);

      await createAndSendNotification(io, {
        recipientId: job.employer._id,
        recipientEmail: job.employer.email,
        senderId: req.user.id,
        jobId: job._id,

        // ✅ FIXED TYPE (IMPORTANT)
        type: "APPLICATION_RECEIVED",

        message: "📩 New application received",

        sendEmail: true,

        // ✅ SUBJECT
        subject: "📩 New Application Received",

        // ✅ USE YOUR EXISTING TEMPLATE
        template: "applicationReceived",

        // ✅ DATA FOR TEMPLATE
        name: job.employer.companyName || "Employer",
        candidateName: req.user.name || "Candidate",
        jobTitle: job.title,
        companyName: job.companyName,

        portalLink: "http://localhost:3000/employer/dashboard",
      });

      res.status(201).json(newApp);

    } catch (err) {
      console.error("Application Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

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
   GET APPLICATION BY ID
   ====================== */
router.get("/:id", authMiddleware, async (req, res) => {
  try {

    const application = await Application.findById(req.params.id)
      .populate("candidate", "name email")
      .populate("job", "title")
      .populate("employer", "email companyName name")

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);

  } catch (err) {

    console.error("Application Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch application" });

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
