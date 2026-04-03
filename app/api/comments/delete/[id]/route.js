import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import { verifyToken } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id } = params;

    const comment = await Comment.findById(id);
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    // Only allow deletion by comment owner or admin
    if (comment.userId.toString() !== payload.userId && payload.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Comment.findByIdAndDelete(id);

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
