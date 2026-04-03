import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Notice from "@/models/Notice";
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

    const totalManagers = await User.countDocuments({ role: "Manager" });
    const totalStaff = await User.countDocuments({ role: "Staff" });
    const totalTasks = await Task.countDocuments();
    const totalNotices = await Notice.countDocuments();

    // Very basic stats logic
    return NextResponse.json({
      stats: {
        totalTotalUsers: totalManagers + totalStaff,
        totalManagers,
        totalStaff,
        totalTasks,
        totalNotices
      }
    });
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
