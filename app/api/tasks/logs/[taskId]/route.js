import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TaskLog from "@/models/TaskLog";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const p = await params;
    const { taskId } = p;

    const logs = await TaskLog.find({ taskId })
      .populate("changedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Get Task Logs Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
