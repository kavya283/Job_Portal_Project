const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs"); // ✅ added

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: false, // ✅ prevents Gmail TLS issues
  tls: { rejectUnauthorized: false }, // ✅ prevents cert issues
});

// Verify transporter once at startup
transporter.verify((err) => {
  if (err) console.log("❌ Mail error:", err.message);
  else console.log("✅ Mail server ready");
});

/**
 * Send an email using a template
 */
const sendEmail = async (to, subject, templateName, data = {}) => {
  try {
    const templatePath = path.join(
      __dirname,
      `../templates/emails/${templateName}.ejs`
    );

    // ✅ Check template exists before rendering
    if (!fs.existsSync(templatePath)) {
      console.log("⚠ Email template not found:", templateName);
      return;
    }

    const templateData = {
      logoUrl: process.env.LOGO_URL || "https://yourwebsite.com/logo.png",
      portalLink: process.env.PORTAL_LINK || "https://yourwebsite.com",
      name: data.name || "User",
      message: data.message || "",
      jobTitle: data.jobTitle || "",
      candidateName: data.candidateName || "",
      companyName: data.companyName || "",
      location: data.location || "",
      jobLink: data.jobLink || "",
      status: data.status || "",
      ...data,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("Email Error:", error.message);
  }
};

module.exports = { sendEmail };
