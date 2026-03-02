const Notification = require("../models/Notification");
const Job = require("../models/Job");
const { sendEmail } = require("./emailService");
const mongoose = require("mongoose");

exports.createAndSendNotification = async (io, data) => {
  try {
    // ===== 0️⃣ Validate recipient =====
    if (!data.recipientId) {
      console.log("❌ Notification skipped: recipientId missing");
      return null;
    }

    // ===== 1️⃣ Normalize & validate notification type =====
    const allowedTypes = [
      "APPLICATION",
      "STATUS_UPDATE",
      "NEW_JOB",
      "APPLICATION_RECEIVED",
      "APPLICATION_SUBMITTED"
    ];

    let notifType = (data.type || "APPLICATION").toUpperCase();

    if (!allowedTypes.includes(notifType)) {
      console.log("⚠ Invalid type received:", data.type, "→ defaulting to APPLICATION");
      notifType = "APPLICATION";
    }

    // ===== 2️⃣ Determine recipient role =====
    const roleMap = {
      NEW_JOB: "candidate",
      APPLICATION: "employer",
      STATUS_UPDATE: "candidate",
      APPLICATION_RECEIVED: "employer",
      APPLICATION_SUBMITTED: "candidate",
    };

    const recipientRole = (
      data.recipientRole ||
      roleMap[notifType] ||
      "candidate"
    ).toLowerCase();

    // ===== 3️⃣ Ensure recipients array =====
    const recipients = Array.isArray(data.recipientId)
      ? data.recipientId
      : [data.recipientId];

    // ===== 4️⃣ Fetch job info if jobId provided =====
    let jobInfo = {};
    if (data.jobId && mongoose.Types.ObjectId.isValid(data.jobId)) {
      const job = await Job.findById(data.jobId);
      if (job) {
        jobInfo.jobTitle = job.title;
        jobInfo.companyName = job.companyName;
        jobInfo.location = job.location;
      }
    }

    // ===== 5️⃣ Prepare notifications =====
    const notifications = recipients
      .map((recipientId) => {
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
          console.log("❌ Invalid recipientId:", recipientId);
          return null;
        }

        return {
          recipient: new mongoose.Types.ObjectId(recipientId),
          recipientRole,
          sender:
            data.senderId && mongoose.Types.ObjectId.isValid(data.senderId)
              ? new mongoose.Types.ObjectId(data.senderId)
              : null,
          job:
            data.jobId && mongoose.Types.ObjectId.isValid(data.jobId)
              ? new mongoose.Types.ObjectId(data.jobId)
              : null,
          candidateName: data.candidateName || "",
          companyName: jobInfo.companyName || data.companyName || "",
          message: data.message || "You have a new notification",
          type: notifType,
        };
      })
      .filter(Boolean);

    if (!notifications.length) {
      console.log("❌ Notification skipped: no valid recipients");
      return null;
    }

    // 🔍 Debug log before saving
    console.log("📦 Notifications to save:", notifications);

    // ===== 6️⃣ Save notifications =====
    const newNotifications = await Notification.insertMany(notifications, {
      ordered: false,
    });

    console.log("✅ Notifications saved:", newNotifications.length);

    // ===== 7️⃣ Emit realtime =====
    if (io) {
      newNotifications.forEach((notif) => {
        io.to(notif.recipient.toString()).emit("receive_notification", notif);
      });
    }

    // ===== 8️⃣ Send email =====
    if (data.recipientEmail) {
      const templateMap = {
        NEW_JOB: "newjob",
        APPLICATION: "applicationSubmitted",
        STATUS_UPDATE: "applicationStatus",
        APPLICATION_RECEIVED: "applicationSubmitted",
        APPLICATION_SUBMITTED: "applicationSubmitted",
      };

      const emailData = {
        name: data.name || data.candidateName || "User",
        message: data.message || "",
        jobTitle: jobInfo.jobTitle || data.jobTitle || "",
        candidateName: data.candidateName || "",
        companyName: jobInfo.companyName || data.companyName || "",
        location: jobInfo.location || data.location || "",
        jobLink: data.jobLink || "",
        status: data.status || "",
      };

      try {
        await sendEmail(
          data.recipientEmail,
          data.subject || "Job Portal Notification",
          data.template || templateMap[notifType] || "defaultTemplate",
          emailData
        );
      } catch (emailErr) {
        console.log("⚠ Email skipped:", emailErr.message);
      }
    }

    return newNotifications.length === 1
      ? newNotifications[0]
      : newNotifications;

  } catch (error) {
    console.error("❌ Notification Error:", error);
    return null;
  }
};
