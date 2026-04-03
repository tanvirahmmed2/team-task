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
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden: Managers only" }, { status: 403 });
    }

    const { title, description, type, assignedTo, groupId, deadline, priority } = await request.json();

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    const taskData = {
      title,
      description,
      type,
      managerId: payload.userId,
      deadline,
      priority
    };

    if (type === "direct") taskData.assignedTo = assignedTo;
    if (type === "group") taskData.groupId = groupId;

    const newTask = await Task.create(taskData);

    // Activity Log
    await TaskLog.create({
      taskId: newTask._id,
      actionType: "Task Created",
      message: `Task "${title}" was created by ${payload.name}`,
      changedBy: payload.userId
    });

    return NextResponse.json({ message: "Task created", task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Create Task Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
