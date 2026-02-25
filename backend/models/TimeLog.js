const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    hours: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    files: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    coinsDue: {
      type: Number,
      default: 0,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeLog", timeLogSchema);
