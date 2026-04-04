import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import Notice from "@/models/Notice";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role === "Staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const p = await params;
    const { id } = p;

    const body = await request.json();
    const { title, message, priority, target } = body;

    const query = { _id: id };
    if (payload.role !== "Admin") {
       // Managers can only edit their own
       query.createdBy = payload.userId;
    }

    const updated = await Notice.findOneAndUpdate(
      query,
      { $set: { title, message, priority, target } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Notice not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notice updated", notice: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role === "Staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const p = await params;
    const { id } = p;

    const query = { _id: id };
    if (payload.role !== "Admin") {
       query.createdBy = payload.userId;
    }

    const deleted = await Notice.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json({ error: "Notice not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notice deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
