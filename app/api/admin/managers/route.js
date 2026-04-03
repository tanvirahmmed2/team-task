import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const managers = await User.find({ role: "Manager" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ managers });
  } catch (error) {
    console.error("Get Managers Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
