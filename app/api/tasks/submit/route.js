import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import TaskLog from "@/models/TaskLog";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Staff") {
      return NextResponse.json({ error: "Forbidden: Staff only" }, { status: 403 });
    }

    const { taskId } = await request.json();
    if (!taskId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const oldStatus = task.status;
    task.status = "Submitted";
    await task.save();

    await TaskLog.create({
      taskId: task._id,
      actionType: "Task Submitted",
      message: `Task submitted by ${payload.name}`,
      changedBy: payload.userId
    });

    return NextResponse.json({ message: "Task submitted successfully", task }, { status: 200 });
  } catch (error) {
    console.error("Submit Task Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
