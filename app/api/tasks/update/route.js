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
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden: Managers only" }, { status: 403 });
    }

    const { taskId, title, description, deadline, priority, assignedTo, status } = await request.json();

    if (!taskId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    const task = await Task.findById({ _id: taskId });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Track what changed
    let updates = [];
    if (title && title !== task.title) updates.push("Title updated");
    if (description && description !== task.description) updates.push("Description updated");
    if (priority && priority !== task.priority) updates.push("Priority updated");
    if (status && status !== task.status) updates.push(`Status changed to ${status}`);

    if (title) task.title = title;
    if (description) task.description = description;
    if (deadline) task.deadline = deadline;
    if (priority) task.priority = priority;
    if (assignedTo) task.assignedTo = assignedTo;
    if (status) task.status = status;

    await task.save();

    if (updates.length > 0) {
      await TaskLog.create({
        taskId: task._id,
        actionType: "Task Updated",
        message: updates.join(", "),
        changedBy: payload.userId
      });
    }

    return NextResponse.json({ message: "Task updated", task }, { status: 200 });
  } catch (error) {
    console.error("Update Task Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
