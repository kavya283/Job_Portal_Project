const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🔥 fast fetch for user notifications
    },

    recipientRole: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },

    candidateName: String,
    companyName: String,

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION",
        "STATUS_UPDATE",
        "NEW_JOB",
        "APPLICATION_RECEIVED",
        "APPLICATION_SUBMITTED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_ACCEPTED",
        "INTERVIEW_DECLINED",
        "OFFER_SENT",
        "OFFER_ACCEPTED",
        "OFFER_REJECTED"
      ],
      required: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔥 AUTO DELETE AFTER 30 DAYS
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// 🔥 TTL INDEX (Mongo auto-deletes expired docs)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", notificationSchema);
