const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Number of coins assigned for completing the task
    coins: {
      type: Number,
      default: 0,
    },

    // Submission information (employee upload)
    submissionUrl: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // Verification info (set by HR/admin)
    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Task lifecycle status
    status: {
      type: String,
      enum: ["Assigned", "Submitted", "Verified"],
      default: "Assigned",
    },

    deadline: {
      type: Date,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
