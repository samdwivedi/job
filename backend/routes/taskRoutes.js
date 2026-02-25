const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  getMyTasks,
  updateTaskStatus,
  submitTask,
  verifyTask,
  getProductivity,
  deleteTask,
} = require("../controllers/taskController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Admin routes
router.post("/", protect, adminOnly, createTask);
router.get("/", protect, adminOnly, getTasks);

// Employee routes (specific routes must come before parameterized routes)
router.get("/my-tasks", protect, getMyTasks);
router.get("/productivity", protect, getProductivity);

// Parameterized routes
router.get("/:id", protect, getTaskById);
// Allow patch for status updates (frontend uses PATCH)
router.patch("/:id", protect, updateTaskStatus);
// Employee submits a PDF for their task
router.post("/:id/submit", protect, upload.single("file"), submitTask);
// Admin verifies a submitted task
router.patch("/:id/verify", protect, adminOnly, verifyTask);
router.delete("/:id", protect, adminOnly, deleteTask);

module.exports = router;
