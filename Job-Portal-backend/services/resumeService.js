const path = require("path");
const ejs = require("ejs");

exports.buildResumeHTML = async (profile) => {
  const templatePath = path.join(__dirname, "../templates/resumeTemplate.ejs");

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").map(v => v.trim());
  };

  const data = {
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    title: profile.title || "",

    // ✅ CRITICAL FIX
    bio: profile.bio || "",

    skills: normalizeArray(profile.skills),
    languages: normalizeArray(profile.languages),

    experience: profile.experience || [],
    education: profile.education || [],
    projects: profile.projects || [],

    achievements: profile.achievements || [],
    certifications: profile.certifications || []
  };

  console.log("🔥 DATA SENT TO EJS:", data); // DEBUG

  return await ejs.renderFile(templatePath, data);
};
