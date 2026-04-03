import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request) {
  try {
    await ConnectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: "If an account exists, a reset link was sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token to save in DB
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Expire in 1 hour
    const resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `${request.headers.get("origin") || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
