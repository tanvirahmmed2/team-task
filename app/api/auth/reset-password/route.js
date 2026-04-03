import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request) {
  try {
    await ConnectDB();
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    // Reconstruct the hash from the token to find in DB
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Update password
    user.password = await hashPassword(newPassword);
    
    // Clear tokens
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
