const router = require("express").Router();
const {
  downloadResume,
  updateResume
} = require("../controllers/resumeController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/download", authMiddleware, downloadResume);
router.put("/update", authMiddleware, updateResume);

module.exports = router;
