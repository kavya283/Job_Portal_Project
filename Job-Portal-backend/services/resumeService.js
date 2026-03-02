const path = require("path");
const ejs = require("ejs");

exports.buildResumeHTML = async (profile) => {
  const templatePath = path.join(__dirname, "../templates/resumeTemplate.ejs");

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").map(v => v.trim());
  };

  return await ejs.renderFile(templatePath, {
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    title: profile.title || "",
    summary: profile.bio || profile.summary || "",

    skills: normalizeArray(profile.skills),
    languages: normalizeArray(profile.languages),

    experience: profile.experience || [],
    education: profile.education || [],
    projects: profile.projects || [],
  });
};
