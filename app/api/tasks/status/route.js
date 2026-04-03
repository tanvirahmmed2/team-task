import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import TaskLog from "@/models/TaskLog";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { taskId, status } = await request.json();

    if (!taskId || !status) return NextResponse.json({ error: "Task ID and status required" }, { status: 400 });

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await TaskLog.create({
      taskId: task._id,
      actionType: "Status Changed",
      message: `Status changed from ${oldStatus} to ${status}`,
      changedBy: payload.userId
    });

    return NextResponse.json({ message: "Task status updated", task }, { status: 200 });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
