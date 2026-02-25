const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  getMyTasks,
  updateTaskStatus,
  completeTask,
  verifyTask,
  getProductivity,
  deleteTask,
} = require("../controllers/taskController.js");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");

// simple disk storage for task attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Admin routes
router.post("/", protect, adminOnly, createTask);
router.get("/", protect, adminOnly, getTasks);

// Employee routes (specific routes must come before parameterized routes)
router.get("/my-tasks", protect, getMyTasks);
router.get("/productivity", protect, getProductivity);

// Parameterized routes
router.get("/:id", protect, getTaskById);
router.put("/:id/status", protect, updateTaskStatus);
// Employee completes task by uploading supporting files
router.put("/:id/complete", protect, upload.array("files"), completeTask);
// HR/Admin verifies task after on-chain transfer
router.put("/:id/verify", protect, verifyTask);
router.delete("/:id", protect, adminOnly, deleteTask);

module.exports = router;
