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

    const { groupId, userId } = await request.json();
    if (!groupId || !userId) return NextResponse.json({ error: "Group ID and User ID required" }, { status: 400 });

    const group = await Group.findById(groupId);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    if (group.managerId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized to modify this group" }, { status: 403 });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    return NextResponse.json({ message: "Member added directly", group }, { status: 200 });
  } catch (error) {
    console.error("Add Member Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
