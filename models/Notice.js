import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ["Normal", "Urgent"], default: "Normal" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  target: { type: String, enum: ["all", "team"], required: true }
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
