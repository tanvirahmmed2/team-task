import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Group from "@/models/Group";
import Notice from "@/models/Notice";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden: Managers only" }, { status: 403 });
    }

    const myStaffCount = await User.countDocuments({ managerId: payload.userId });
    const myTasksCount = await Task.countDocuments({ managerId: payload.userId });
    const pendingTasks = await Task.countDocuments({ managerId: payload.userId, status: "Pending" });
    const completedTasks = await Task.countDocuments({ managerId: payload.userId, status: "Completed" });
    const myGroupsCount = await Group.countDocuments({ managerId: payload.userId });

    return NextResponse.json({
      stats: {
        myStaffCount,
        myTasksCount,
        pendingTasks,
        completedTasks,
        myGroupsCount
      }
    });
  } catch (error) {
    console.error("Manager Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
