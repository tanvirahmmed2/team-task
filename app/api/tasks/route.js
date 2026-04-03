import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    let filter = {};
    if (payload.role === "Manager") {
      filter = { managerId: payload.userId };
    } else if (payload.role === "Staff") {
      filter = {
        $or: [
          { assignedTo: payload.userId },
          // A bit complex: if assigned to group, we need to find groups where staff is member.
          // For now, let's keep it simple or require passing groupIds.
          // Real apps would query groups first and map IDs.
        ]
      };
      // We'll find groups where user is member to augment filter
      const Group = (await import("@/models/Group")).default;
      const userGroups = await Group.find({ members: payload.userId }).select("_id").lean();
      const groupIds = userGroups.map(g => g._id);
      if (groupIds.length > 0) {
        filter.$or.push({ groupId: { $in: groupIds } });
      }
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name")
      .populate("managerId", "name")
      .populate("groupId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
