const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  createTimeLog,
  getTimeLogs,
  getMyTimeLogs,
  verifyTimeLog,
} = require("../controllers/timeController");

// simple disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create time log with optional files
router.post("/", protect, upload.array("files"), createTimeLog);

// Get org time logs (Admin/HR/Verifier)
router.get("/", protect, getTimeLogs);

// Get my timelogs (employee)
router.get("/mine", protect, getMyTimeLogs);

// Verify a time log (verifier only)
router.put("/:id/verify", protect, verifyTimeLog);

module.exports = router;
