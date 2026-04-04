import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
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
    const { status } = await request.json();

    if (!["Active", "Blocked"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const query = { _id: id };
    if (payload.role === "Manager") {
       // Managers can only block their own staff
       query.managerId = payload.userId;
    } else if (payload.role === "Admin") {
       // Admin can block Managers and Staff
       query.role = { $in: ["Manager", "Staff"] };
    }

    const updated = await User.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ message: `User marked as ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
