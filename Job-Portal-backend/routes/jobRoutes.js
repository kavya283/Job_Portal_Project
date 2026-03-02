const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { authMiddleware, employerOnly } = require("../middleware/authMiddleware");
const { createJob } = require("../controllers/jobController");
const router = express.Router();



// SEARCH JOBS (Public) - Updated for AND operation and Salary filtering
router.get("/search", async (req, res) => {
  const { keyword, location, role, minSalary } = req.query;

  try {
    let query = { status: "open" };

    // Keyword search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // Location search
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Role search
    if (role) {
      query.role = { $regex: role, $options: "i" };
    }

    // ✅ Correct Salary Filtering Logic
    // Show jobs where max salary is >= user expectation
    if (minSalary) {
      query.salaryMax = { $gte: Number(minSalary) };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Search failed" });
  }
});


// GET LATEST JOBS (Public)
router.get("/latest", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(jobs || []);
  } catch (err) {
    console.error("Latest Jobs Fetch Error:", err.message);
    res.status(500).json({ message: "Failed to fetch latest opportunities" });
  }
});

// GET EMPLOYER'S JOBS
router.get("/my-jobs", authMiddleware, employerOnly, async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;
    const jobs = await Job.find({ employer: employerId }).sort({ createdAt: -1 });
    res.json(jobs || []);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET ALL APPLICANTS
router.get("/applicants", authMiddleware, employerOnly, async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;
    const myJobs = await Job.find({ employer: employerId }).select("_id");
    const jobIds = myJobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("candidate", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

// GET APPLICANTS FOR SPECIFIC JOB
router.get("/applicants/:jobId", authMiddleware, employerOnly, async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;
    const job = await Job.findOne({ _id: req.params.jobId, employer: employerId });
    if (!job) return res.status(403).json({ message: "Unauthorized access" });

    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ======================================================
    2. GENERAL RESOURCE ROUTES
   ====================================================== */
router.post("/", authMiddleware, employerOnly, createJob);

/* ======================================================
    3. DYNAMIC ID ROUTES
   ====================================================== */

// GET SINGLE JOB
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "companyName");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job details" });
  }
});

// UPDATE JOB
router.put("/:id", authMiddleware, employerOnly, async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: employerId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
});

// DELETE JOB
router.delete("/:id", authMiddleware, employerOnly, async (req, res) => {
  try {
    const employerId = req.user.id || req.user._id;
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: employerId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    await Application.deleteMany({ job: req.params.id });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
