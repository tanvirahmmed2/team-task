import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { taskId, message, parentCommentId } = await request.json();
    if (!taskId || !message) {
      return NextResponse.json({ error: "Task ID and message required" }, { status: 400 });
    }

    const newComment = await Comment.create({
      taskId,
      userId: payload.userId,
      message,
      parentCommentId: parentCommentId || null
    });

    return NextResponse.json({ message: "Comment added", comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
