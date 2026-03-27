const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const { createAndSendNotification } = require("../services/notificationService");
const Notification = require("../models/Notification");

/* ======================
    CREATE JOB
   ====================== */
exports.createJob = async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;

    // 🔹 fetch employer info
    const employer = await User.findById(employerId).select("companyName");

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // 🔹 attach company name automatically
    const jobData = {
      ...req.body,
      employer: employerId,
      companyName: employer.companyName || "Company"
    };

    const newJob = await Job.create(jobData);

    const io = req.app.get("socketio");

    // 🔹 Find all candidates with valid emails
    const candidates = await User.find({
      role: "candidate",
      email: { $exists: true, $ne: "" }
    }).select("_id email name");

    const candidateIds = candidates.map(c => c._id);
    const candidateEmails = candidates.map(c => c.email);

    // 🔥 SEND NOTIFICATION + EMAIL (NON-BLOCKING)
    if (candidateIds.length > 0) {
      await createAndSendNotification(io, {
        recipientId: candidateIds,
        recipientEmail: candidateEmails,
        recipientRole: "candidate",
        senderId: employerId,
        jobId: newJob._id,
        message: `New job posted: ${newJob.title}`,
        type: "NEW_JOB",
        sendEmail: true,
        subject: "🚀 New Job Opportunity!",

        // 🔥 REQUIRED FOR EMAIL TEMPLATE
        jobTitle: newJob.title,
        companyName: newJob.companyName,
        location: newJob.location,
        jobLink: `http://localhost:5173/jobs/${newJob._id}`,
        portalLink: `http://localhost:5173/dashboard`
      });
    }

    res.status(201).json(newJob);

  } catch (err) {
    console.error("Create Job Error:", err); // ✅ full error log
    res.status(500).json({ message: err.message || "Error posting job" });
  }
};

/* ======================
    READ ALL JOBS (Public)
   ====================== */
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "companyName")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("GetAllJobs Error:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

/* ======================
    GET JOB BY ID
   ====================== */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "companyName");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    console.error("GetJobById Error:", err);
    res.status(500).json({ message: "Invalid Job ID format" });
  }
};

/* ======================
    GET MY JOBS
   ====================== */
exports.getMyJobs = async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;

    const jobs = await Job.find({ employer: employerId })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("GetMyJobs Error:", err);
    res.status(500).json({ message: "Error fetching your jobs" });
  }
};

/* ======================
    GET APPLICANTS
   ====================== */
exports.getJobApplicants = async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;

    const myJobs = await Job.find({ employer: employerId }).select("_id");
    const jobIds = myJobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("candidate", "name email")
      .populate("job", "title")
      .select("candidate resume status assessmentScore assessmentStatus")
      .sort({ createdAt: -1 });

    const validApplications = applications.filter(app => app.job !== null);

    res.json(validApplications);
  } catch (err) {
    console.error("Dashboard Applicants Error:", err);
    res.status(500).json({
      message: "Internal Server Error fetching applicants"
    });
  }
};

/* ======================
    UPDATE JOB
   ====================== */
exports.updateJob = async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: employerId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found or unauthorized"
      });
    }

    const io = req.app.get("socketio");
    if (io) io.emit("jobUpdated", job);

    res.json(job);

  } catch (err) {
    console.error("UpdateJob Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================
    DELETE JOB
   ====================== */
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    await Job.findByIdAndDelete(jobId);
    await Application.deleteMany({ job: jobId });
    await Notification.deleteMany({ job: jobId });

    res.json({ success: true, message: "Job deleted" });

  } catch (err) {
    console.error("DeleteJob Error:", err);
    res.status(500).json({ message: "Delete job failed" });
  }
};
