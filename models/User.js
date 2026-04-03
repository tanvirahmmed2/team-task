import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "Staff"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin for Manager, Manager for Staff
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Associated Manager
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
