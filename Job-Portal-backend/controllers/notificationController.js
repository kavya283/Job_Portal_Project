const { createAndSendNotification } = require("../services/notificationService");

exports.sendNotification = async (req, res) => {
  try {
    const io = req.app.get("socketio");

    const notification = await createAndSendNotification(io, req.body);

    res.json({ success: true, notification });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
};
