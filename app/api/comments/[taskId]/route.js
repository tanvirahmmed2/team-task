import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { taskId } = params;

    const comments = await Comment.find({ taskId })
      .populate("userId", "name role")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get Comments Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Wait wait, DELETE endpoint usually receives `id` in dynamic route, but this file is `[taskId]/route.js`
    // Actually the prompt says DELETE /api/comments/:id. I should create another folder `app/api/comments/[id]/route.js` 
    // And use `app/api/comments/task/[taskId]/route.js`?
    // Let me just handle it simply here based on assumption, but to be exact I'll make a separate file.
    
    return NextResponse.json({ error: "Not implemented here" }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
