import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Admins see all groups, Managers see their groups, Staff see groups they're in.
    let filter = {};
    if (payload.role === "Manager") filter = { managerId: payload.userId };
    else if (payload.role === "Staff") filter = { members: payload.userId };

    const groups = await Group.find(filter).populate("members", "name email").populate("managerId", "name email").lean();
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Get Groups Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
