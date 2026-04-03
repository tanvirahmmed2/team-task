import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/Notice";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role === "Staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, message, priority, target } = await request.json();

    if (!title || !message || !target) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newNotice = await Notice.create({
      title,
      message,
      priority: priority || "Normal",
      target,
      createdBy: payload.userId
    });

    return NextResponse.json({ message: "Notice created", notice: newNotice }, { status: 201 });
  } catch (error) {
    console.error("Create Notice Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Admin sees all. Managers/Staff see 'all' and their team notices (where target is 'team' and createdBy Manager/Admin for that flow, handled by frontend/backend constraints).
    // For simplicity, we fetch all notices for Admin. For others, we might want to filter more specifically.
    const notices = await Notice.find().sort({ createdAt: -1 }).populate("createdBy", "name role").lean();
    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Get Notices Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
