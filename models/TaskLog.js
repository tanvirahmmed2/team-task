import mongoose from "mongoose";

const taskLogSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  actionType: { type: String, required: true },
  message: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.models.TaskLog || mongoose.model("TaskLog", taskLogSchema);
