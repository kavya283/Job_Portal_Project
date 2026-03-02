// routes/employerRoutes.js
const express = require("express");
const router = express.Router();

// ✅ FIX: Add curly braces to extract the function correctly
const { authMiddleware } = require("../middleware/authMiddleware"); 
const { getProfile, updateProfile } = require("../controllers/employerController");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

module.exports = router;