const Candidate = require("../models/Candidate");
const fs = require("fs");
const path = require("path");

/* =========================
   GET PROFILE
   ========================= */
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const userId = req.user.id || req.user._id;
    const profile = await Candidate.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* =========================
   CREATE or UPDATE PROFILE
   ========================= */
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const { name, email, phone, skills, bio } = req.body;
    const userId = req.user.id || req.user._id;

    let profileFields = {
      user: userId,
      name,
      email,
      phone,
      skills,
      bio,
    };

    // Find existing profile (for old resume deletion)
    let profile = await Candidate.findOne({ user: userId });

    if (req.file) {
      // Delete old resume if exists
      if (profile && profile.resumePath) {
        const oldPath = path.join(__dirname, "..", profile.resumePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      profileFields.resumePath = `/uploads/resumes/${req.file.filename}`;
    }

    // Create or update profile
    profile = await Candidate.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ msg: "Profile updated successfully", profile });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Export functions correctly as object
module.exports = {
  getProfile,
  updateProfile,
};
