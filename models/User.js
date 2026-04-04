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
  status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
  personalInfo: {
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContact: { type: String, default: "" }
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
