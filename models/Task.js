import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["direct", "group"], required: true },
  status: { type: String, enum: ["Pending", "Accepted", "In Progress", "Submitted", "Completed"], default: "Pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deadline: { type: Date, default: null },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
