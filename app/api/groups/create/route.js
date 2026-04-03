import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
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

    const { name, members } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const newGroup = await Group.create({
      name,
      managerId: payload.userId,
      members: members || []
    });

    return NextResponse.json({ message: "Group created", group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("Create Group Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
