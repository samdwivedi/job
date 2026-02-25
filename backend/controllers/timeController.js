const TimeLog = require("../models/TimeLog");
const Employee = require("../models/Employee");

// Create time log (employee or user) and allow file uploads
const createTimeLog = async (req, res) => {
  try {
    // allow both EMPLOYEE and USER to upload time logs/files
    if (!(req.role === "EMPLOYEE" || req.role === "USER")) {
      return res.status(403).json({ error: "Only employee or user can create time logs" });
    }

    const { hours, date } = req.body;
    const parsedHours = Number(hours) || 0;

    if (parsedHours <= 0) {
      return res.status(400).json({ error: "hours is required and must be > 0" });
    }

    // compute coins due (simple rate: 10 coins per hour)
    const coinsDue = parsedHours * 10;

    const files = (req.files || []).map((f) => f.path);

    const timeLog = await TimeLog.create({
      employeeId: req.user.id,
      organizationId: req.organizationId,
      hours: parsedHours,
      date: date || undefined,
      files,
      coinsDue,
    });

    // Assign small commissions to admin and hr on creation (optional)
    // Admin: 10% commission, HR: 5% commission
    const orgId = req.organizationId;
    const admin = await Employee.findOne({ organizationId: orgId, role: { $regex: /^admin$/i } });
    const hr = await Employee.findOne({ organizationId: orgId, role: { $regex: /^hr$/i } });

    if (admin) {
      admin.balance = (admin.balance || 0) + coinsDue * 0.1;
      await admin.save();
    }
    if (hr) {
      hr.balance = (hr.balance || 0) + coinsDue * 0.05;
      await hr.save();
    }

    return res.status(201).json(timeLog);
  } catch (err) {
    console.error("createTimeLog error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get time logs (Admin, HR, Verifier) - returns org logs
const getTimeLogs = async (req, res) => {
  try {
    if (!(req.role === "ADMIN" || req.role === "HR" || req.role === "VERIFIER")) {
      return res.status(403).json({ error: "Admin/HR/Verifier access only" });
    }

    const logs = await TimeLog.find({ organizationId: req.organizationId }).sort({ createdAt: -1 }).populate("employeeId", "name email role");
    return res.json(logs);
  } catch (err) {
    console.error("getTimeLogs error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Employee can view their own timelogs
const getMyTimeLogs = async (req, res) => {
  try {
    const logs = await TimeLog.find({ employeeId: req.user.id, organizationId: req.organizationId }).sort({ createdAt: -1 });
    return res.json(logs);
  } catch (err) {
    console.error("getMyTimeLogs error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Verifier verifies a time log and triggers transfer from HR to user
const verifyTimeLog = async (req, res) => {
  try {
    if (req.role !== "VERIFIER") {
      return res.status(403).json({ error: "Verifier access only" });
    }

    const { id } = req.params;
    const timeLog = await TimeLog.findById(id);
    if (!timeLog) return res.status(404).json({ error: "TimeLog not found" });
    if (timeLog.organizationId.toString() !== req.organizationId.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    if (timeLog.status === "Verified") {
      return res.status(400).json({ error: "Already verified" });
    }

    // find an HR in the organization to deduct funds from
    const hr = await Employee.findOne({ organizationId: req.organizationId, role: { $regex: /^hr$/i } });
    const user = await Employee.findById(timeLog.employeeId);

    if (!hr) return res.status(400).json({ error: "No HR found to pay from" });
    if (!user) return res.status(400).json({ error: "Employee not found" });

    const amount = timeLog.coinsDue || 0;

    if ((hr.balance || 0) < amount) {
      return res.status(400).json({ error: "HR has insufficient balance" });
    }

    hr.balance -= amount;
    user.balance = (user.balance || 0) + amount;

    timeLog.status = "Verified";
    timeLog.verifiedBy = req.user.id;
    timeLog.verifiedAt = new Date();

    await hr.save();
    await user.save();
    await timeLog.save();

    return res.json({ message: "TimeLog verified and funds transferred", timeLog });
  } catch (err) {
    console.error("verifyTimeLog error:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTimeLog,
  getTimeLogs,
  getMyTimeLogs,
  verifyTimeLog,
};
