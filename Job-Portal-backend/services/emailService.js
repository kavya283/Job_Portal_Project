const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

// ===== 1️⃣ CREATE TRANSPORTER (FIXED) =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ⚠ MUST be App Password
  },
});

// ===== 2️⃣ VERIFY CONNECTION =====
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mail server error:", err);
  } else {
    console.log("✅ Mail server ready");
  }
});

/**
 * Send an email using a template
 */
const sendEmail = async (to, subject, templateName, data = {}) => {
  try {
    // ===== 3️⃣ VALIDATE INPUT =====
    if (!to) {
      console.log("⚠ No recipient email provided");
      return;
    }

    const templatePath = path.join(
      __dirname,
      `../templates/emails/${templateName}.ejs`
    );

    // ===== 4️⃣ CHECK TEMPLATE =====
    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template not found:", templatePath);
      return;
    }

    // ===== 5️⃣ TEMPLATE DATA =====
    const templateData = {
      logoUrl: process.env.LOGO_URL || "",
      portalLink: process.env.PORTAL_LINK || "",
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

    // ===== 6️⃣ RENDER HTML =====
    const html = await ejs.renderFile(templatePath, templateData);

    // ===== 7️⃣ HANDLE MULTIPLE EMAILS =====
    const recipients = Array.isArray(to) ? to.join(",") : to;

    // ===== 8️⃣ SEND EMAIL =====
   const info = await transporter.sendMail({
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject,
    html,
    attachments: data.attachments || [], // ✅ FIX
  });

    console.log("📧 Email sent:", info.response);

  } catch (error) {
    console.error("❌ Email Error FULL:", error); // ✅ FULL ERROR
  }
};

module.exports = { sendEmail };
