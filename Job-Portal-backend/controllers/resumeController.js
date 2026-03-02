const Candidate = require("../models/Candidate");
const { buildResumeHTML } = require("../services/resumeService");
const { generatePDF } = require("../utils/pdfGenerator");


// ================= DOWNLOAD RESUME =================
const downloadResume = async (req, res) => {
  try {
    const userId = req.user.id;

    // ⭐ Fetch candidate profile (NOT User model)
    const profile = await Candidate.findOne({ user: userId }).lean();

    if (!profile) {
      return res.status(404).json({ msg: "Candidate profile not found" });
    }

    // ⭐ Prevent EJS crashes (important)
    profile.skills = profile.skills || [];
    profile.languages = profile.languages || [];
    profile.experience = profile.experience || [];
    profile.education = profile.education || [];
    profile.projects = profile.projects || [];
    profile.summary = profile.bio || "";

    console.log("✅ Resume profile loaded:", profile.name);

    // ⭐ Build HTML
    const html = await buildResumeHTML(profile);

    // ⭐ Generate PDF
    const pdfBuffer = await generatePDF(html);

    // ⭐ Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);

  } catch (err) {
    console.error("❌ Resume generation error:", err);

    return res.status(500).json({
      msg: "Resume generation failed",
      error: err.message
    });
  }
};


// ================= UPDATE RESUME =================
const updateResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await Candidate.findOneAndUpdate(
      { user: userId },
      { $set: req.body },
      { new: true, upsert: true } // ⭐ create profile if missing
    );

    res.json(updated);

  } catch (err) {
    console.error("❌ Resume update error:", err);
    res.status(500).json({ msg: "Resume update failed" });
  }
};


module.exports = {
  downloadResume,
  updateResume
};
