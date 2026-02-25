import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User" }, // HR/Admin who assigned
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // employee
  verifier: { type: Schema.Types.ObjectId, ref: "User" }, // verifier
  coins: { type: Number, default: 0 },
  status: { type: String, enum: ["assigned","uploaded","completed","verified"], default: "assigned" },
  file: {
    originalName: String,
    path: String,
    mimeType: String
  }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);