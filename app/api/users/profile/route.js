import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await User.findById(payload.userId).select("-password -resetPasswordToken -resetPasswordExpire").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { personalInfo } = await request.json();

    if (!personalInfo) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      payload.userId,
      { $set: { personalInfo } },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", personalInfo: updated.personalInfo }, { status: 200 });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
