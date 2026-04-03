import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id } = params;

    const task = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("managerId", "name")
      .populate("groupId", "name members")
      .lean();

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // In a real app we'd verify payload.role and if they are allowed to see it.
    // E.g., if staff, check if assigned to them or their group.
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error("Get Task Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
