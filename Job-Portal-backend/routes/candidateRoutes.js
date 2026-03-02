const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getProfile, updateProfile } = require("../controllers/candidateController");


router.get("/me", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("resume"), updateProfile);

module.exports = router;
