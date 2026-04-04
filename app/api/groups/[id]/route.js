import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import Group from "@/models/Group";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const group = await Group.findOneAndUpdate(
      { _id: id, managerId: payload.userId },
      { $set: { name } },
      { new: true }
    );

    if (!group) return NextResponse.json({ error: "Group not found or access denied" }, { status: 404 });

    return NextResponse.json({ message: "Group updated", group });
  } catch (error) {
    console.error("Update Group Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const group = await Group.findOneAndDelete({ _id: id, managerId: payload.userId });
    if (!group) return NextResponse.json({ error: "Group not found or access denied" }, { status: 404 });

    return NextResponse.json({ message: "Group deleted" });
  } catch (error) {
    console.error("Delete Group Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
