const router = require("express").Router();
const {
  downloadResume,
  updateResume,
  getResume // ✅ ADD THIS
} = require("../controllers/resumeController");

const { authMiddleware } = require("../middleware/authMiddleware");

// ✅ ADD THIS ROUTE (VERY IMPORTANT)
router.get("/", authMiddleware, getResume);

router.get("/download", authMiddleware, downloadResume);
router.put("/update", authMiddleware, updateResume);

module.exports = router;
