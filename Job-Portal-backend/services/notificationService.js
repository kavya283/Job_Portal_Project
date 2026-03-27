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

    // ===== 1️⃣ Allowed notification types =====
    const allowedTypes = [
      "APPLICATION",
      "STATUS_UPDATE",
      "NEW_JOB",
      "APPLICATION_RECEIVED",
      "APPLICATION_SUBMITTED",
      "OFFER_SENT"
    ];

    let notifType = (data.type || "APPLICATION").toUpperCase();

    if (!allowedTypes.includes(notifType)) {
      console.log("⚠ Invalid type:", data.type, "→ default APPLICATION");
      notifType = "APPLICATION";
    }

    // ===== 2️⃣ Recipient role mapping =====
    const roleMap = {
      NEW_JOB: "candidate",
      APPLICATION: "employer",
      STATUS_UPDATE: "candidate",
      APPLICATION_RECEIVED: "employer",
      APPLICATION_SUBMITTED: "candidate",
      OFFER_SENT: "candidate"
    };

    const recipientRole = (
      data.recipientRole ||
      roleMap[notifType] ||
      "candidate"
    ).toLowerCase();

    // ===== 3️⃣ Normalize recipients =====
    const recipients = Array.isArray(data.recipientId)
      ? data.recipientId
      : [data.recipientId];

    // ===== 4️⃣ Fetch job info =====
    let jobInfo = {};
    if (data.jobId && mongoose.Types.ObjectId.isValid(data.jobId)) {
      const job = await Job.findById(data.jobId);
      if (job) {
        jobInfo = {
          jobTitle: job.title,
          companyName: job.companyName,
          location: job.location
        };
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
      console.log("❌ No valid recipients");
      return null;
    }

    console.log("📦 Saving notifications:", notifications.length);

    // ===== 6️⃣ Save notifications =====
    const newNotifications = await Notification.insertMany(notifications, {
      ordered: false,
    });

    console.log("✅ Notifications saved:", newNotifications.length);

    // ===== 7️⃣ Realtime emit =====
    if (io) {
      newNotifications.forEach((notif) => {
        io.to(notif.recipient.toString()).emit("receive_notification", notif);
      });
    }

    // ===== 8️⃣ EMAIL HANDLING (FINAL FIX) =====

    const emailAllowedTypes = [
      "STATUS_UPDATE",
      "APPLICATION_RECEIVED",
      "APPLICATION_SUBMITTED",
      "OFFER_SENT",
      "NEW_JOB"
    ];

    const templateMap = {
      NEW_JOB: "newJob",

      // ✅ CORRECT MAPPING
      APPLICATION_RECEIVED: "applicationReceived",
      APPLICATION_SUBMITTED: "applicationSubmitted",
      STATUS_UPDATE: "applicationStatus",
      OFFER_SENT: "offerLetter",
    };

    // Normalize email list
    const emailList = Array.isArray(data.recipientEmail)
      ? data.recipientEmail
      : data.recipientEmail
      ? [data.recipientEmail]
      : [];

    console.log("📧 Email Condition Check:", {
      sendEmail: data.sendEmail,
      emailList,
      notifType,
      allowed: emailAllowedTypes.includes(notifType)
    });

    if (!emailList.length) {
      console.log("❌ No recipient email provided");
    }

    if (
      data.sendEmail &&
      emailList.length &&
      emailAllowedTypes.includes(notifType)
    ) {
      const emailData = {
        name: data.name || data.candidateName || "User",
        message: data.message || "",

        jobTitle: data.jobTitle || jobInfo.jobTitle || "",
        companyName: data.companyName || jobInfo.companyName || "",
        location: data.location || jobInfo.location || "",

        portalLink: data.portalLink || "",
        jobLink: data.jobLink || "",

        candidateName: data.candidateName || "",
        status: data.status || ""
      };

      console.log("📧 Sending emails to:", emailList);

      try {
        await Promise.all(
          emailList.map((email) =>
            sendEmail(
              email,
              data.subject || "Job Portal Notification",
              data.template || templateMap[notifType] || "applicationSubmitted",
              emailData
            )
          )
        );

        console.log("✅ All emails sent successfully");
      } catch (err) {
        console.error("❌ Email sending failed:", err);
      }

    } else {
      console.log("📧 Email skipped", {
        sendEmail: data.sendEmail,
        emailCount: emailList.length,
        type: notifType
      });
    }

    return newNotifications.length === 1
      ? newNotifications[0]
      : newNotifications;

  } catch (error) {
    console.error("❌ Notification Error:", error);
    return null;
  }
};
