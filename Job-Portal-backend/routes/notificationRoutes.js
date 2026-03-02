const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createAndSendNotification } = require("../services/notificationService");


router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      recipientRole: req.user.role.toLowerCase(), // 🔥 fix here
    })
      .sort({ createdAt: -1 })
      .populate("job sender", "title name companyName");

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});



/* ======================================================
   MARK NOTIFICATION AS READ
====================================================== */
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Mark Notification Read Error:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

/* ======================================================
   SEND TEST NOTIFICATION
====================================================== */
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const io = req.app.get("socketio");

    const notification = await createAndSendNotification(io, req.body);

    res.json({
      success: true,
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Send Notification Route Error:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

router.get("/test-mail", async (req, res) => {
  const { sendEmail } = require("../services/emailService");

  await sendEmail(
    "your_personal_email@gmail.com",
    "Test Email",
    "applicationStatus",
    { message: "This is a test email from your job portal." }
  );

  res.send("Mail triggered");
});


module.exports = router;
