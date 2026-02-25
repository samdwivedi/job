import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import Task from "./models/Task.js";
import Transaction from "./models/Transaction.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Mongo
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hr_demo";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error("Mongo error", err));

// ---------- Routes ----------

// List users
app.get("/api/users", async (req,res)=>{
  const users = await User.find({});
  res.json(users);
});

// Create a user (quick)
app.post("/api/users", async (req,res)=>{
  const { name, role, coins } = req.body;
  const user = await User.create({ name, role, coins: coins || 0 });
  res.json(user);
});

// Create task (HR/Admin)
app.post("/api/tasks", async (req,res)=>{
  const { title, assignedBy, assignedTo, verifier, coins } = req.body;
  try {
    const task = await Task.create({ title, assignedBy, assignedTo, verifier, coins });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List tasks (with populate)
app.get("/api/tasks", async (req,res)=>{
  const tasks = await Task.find({}).populate("assignedBy assignedTo verifier");
  res.json(tasks);
});

// Get tasks for a user (role-specific)
app.get("/api/tasks/user/:userId", async (req,res)=>{
  const { userId } = req.params;
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ error: "User not found" });

  let tasks;
  if(user.role === "employee") {
    tasks = await Task.find({ assignedTo: userId }).populate("assignedBy assignedTo verifier");
  } else if(user.role === "verifier") {
    tasks = await Task.find({ verifier: userId }).populate("assignedBy assignedTo verifier");
  } else if(user.role === "hr" || user.role === "admin") {
    tasks = await Task.find({ assignedBy: userId }).populate("assignedBy assignedTo verifier");
  } else {
    tasks = await Task.find({}).populate("assignedBy assignedTo verifier");
  }
  res.json(tasks);
});

// Upload document for a task (employee)
app.post("/api/tasks/:taskId/upload", upload.single("file"), async (req,res)=>{
  try {
    const { taskId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file provided. Please select a file to upload." });
    }

    const task = await Task.findById(taskId);
    if(!task) return res.status(404).json({ error: "Task not found" });

    const f = req.file;
    const filePath = `/uploads/${path.basename(f.path)}`;
    
    // Verify file was actually written to disk
    if (!fs.existsSync(f.path)) {
      return res.status(500).json({ error: "File upload failed - file not saved to server" });
    }
    
    task.file = { originalName: f.originalname, path: filePath, mimeType: f.mimetype };
    task.status = "uploaded";
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Employee marks task as completed (clicked Complete)
app.post("/api/tasks/:taskId/complete", async (req,res)=>{
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if(!task) return res.status(404).json({ error: "Task not found" });
    
    if(task.status !== "uploaded") {
      return res.status(400).json({ error: "File must be uploaded before marking as complete" });
    }
    
    if(!task.file || !task.file.path) {
      return res.status(400).json({ error: "No file associated with this task" });
    }

    task.status = "completed";
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks/:taskId/verify", async (req,res)=>{
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("assignedBy assignedTo");
    if(!task) return res.status(404).json({ error: "Task not found" });
    if(task.status !== "completed" && task.status !== "uploaded") {
      return res.status(400).json({ error: "Task not ready to verify" });
    }
    const from = await User.findById(task.assignedBy._id);
    const to = await User.findById(task.assignedTo._id);
    const amount = task.coins || 0;

    if(from.coins < amount) return res.status(400).json({ error: "Insufficient coins in assigner account" });

    from.coins -= amount;
    to.coins += amount;
    await from.save();
    await to.save();

    const tx = await Transaction.create({ from: from._id, to: to._id, amount, task: task._id });

    task.status = "verified";
    await task.save();

    res.json({ task, tx, from, to });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/transactions", async (req,res)=>{
  const txs = await Transaction.find({}).populate("from to task");
  res.json(txs);
});

app.get("/", (req,res)=> res.send("HR demo backend up"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));