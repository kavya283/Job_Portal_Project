const Resume = require("../models/Resume");
const Candidate = require("../models/Candidate");
const { buildResumeHTML } = require("../services/resumeService");
const { generatePDF } = require("../utils/pdfGenerator");

/* ================= CREATE / GET RESUME ================= */
const getOrCreateResume = async (userId) => {
  let resume = await Resume.findOne({ userId });

  if (!resume) {
    let candidate = await Candidate.findOne({ user: userId }).lean();

    // ✅ FIX: avoid crash if no candidate profile
    if (!candidate) candidate = {};

    resume = await Resume.create({
      userId,

      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      title: candidate.title || "",
      location: candidate.location || "",
      bio: candidate.bio || "",

      skills: candidate.skills || [],
      languages: candidate.languages || [],

      education: candidate.education || [],
      experience: candidate.experience || [],
      projects: candidate.projects || [],

      // ✅ IMPORTANT DEFAULTS
      achievements: [],
      certifications: []
    });
  }

  return resume;
};


/* ================= DOWNLOAD RESUME ================= */
const downloadResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const resume = await getOrCreateResume(userId);

    // ✅ SAFE PROFILE (NO CRASH EVER)
    const profile = {
      ...resume.toObject(),

      name: resume.name || "Your Name",
      title: resume.title || "Your Role",
      bio: resume.bio || "A motivated professional seeking opportunities.",

      skills: resume.skills?.length ? resume.skills : ["Skill 1", "Skill 2"],
      languages: resume.languages || [],

      experience: resume.experience?.length
        ? resume.experience
        : [{
            company: "Company Name",
            role: "Your Role",
            duration: "Duration",
            description: "Worked on key responsibilities and contributed to success."
          }],

      education: resume.education?.length
        ? resume.education
        : [{
            degree: "Your Degree",
            college: "College Name",
            year: "Year"
          }],

      projects: resume.projects?.length
        ? resume.projects
        : [{
            name: "Project Name",
            description: "Project description and implementation details."
          }],

      // ✅ FINAL FIXES
      achievements: Array.isArray(resume.achievements) ? resume.achievements : [],
      certifications: Array.isArray(resume.certifications) ? resume.certifications : []
    };

    console.log("✅ Resume loaded:", profile.name);

    // ✅ Build HTML
    const html = await buildResumeHTML(profile);

    if (!html) {
      throw new Error("HTML generation failed");
    }

    // ✅ Generate PDF
    const pdfBuffer = await generatePDF(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");

    return res.end(pdfBuffer);

  } catch (err) {
    console.error("❌ Resume error:", err);

    res.status(500).json({
      msg: "Resume generation failed",
      error: err.message
    });
  }
};


/* ================= UPDATE RESUME ================= */
const updateResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const resume = await Resume.findOneAndUpdate(
      { userId },
      { $set: req.body },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: "Resume updated successfully",
      resume
    });

  } catch (err) {
    console.error("❌ Resume update error:", err);
    res.status(500).json({
      success: false,
      msg: "Resume update failed"
    });
  }
};


/* ================= GET RESUME ================= */
const getResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const resume = await getOrCreateResume(userId);

    res.json(resume);

  } catch (err) {
    console.error("❌ Get resume error:", err);
    res.status(500).json({ msg: "Failed to fetch resume" });
  }
};


module.exports = {
  downloadResume,
  updateResume,
  getResume
};
