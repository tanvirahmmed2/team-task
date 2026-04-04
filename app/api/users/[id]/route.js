import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Notice from "@/models/Notice";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const p = await params;
    const { id } = p;

    const user = await User.findById(id).select("-password").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch stats
    let stats = {};
    if (user.role === "Staff") {
      stats.completedTasks = await Task.countDocuments({ assignedTo: id, status: "Completed" });
      stats.workingOnTasks = await Task.countDocuments({ assignedTo: id, status: { $in: ["Pending", "Accepted", "In Progress", "Submitted"] } });
    } else if (user.role === "Manager") {
      stats.totalTasks = await Task.countDocuments({ managerId: id });
      stats.completedTasks = await Task.countDocuments({ managerId: id, status: "Completed" });
      stats.pendingTasks = await Task.countDocuments({ managerId: id, status: { $ne: "Completed" } });
    }

    return NextResponse.json({ user, stats });
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
    if (payload.role === "Manager") {
       // Managers can only delete their own staff
       query.managerId = payload.userId;
    } else if (payload.role === "Admin") {
       // Admin can delete Managers and Staff
       query.role = { $in: ["Manager", "Staff"] };
    }

    const userToDelete = await User.findOne(query);
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found or forbidden" }, { status: 404 });
    }

    // Unassign tasks logic: if staff, mark tasks Pending. Or just delete entirely.
    // The safest is to delete the user doc, but leave string references in some logs as Null/System.
    // For direct tasks assigned to them:
    if (userToDelete.role === "Staff") {
        await Task.updateMany({ assignedTo: id }, { $unset: { assignedTo: 1 }, $set: { status: "Pending" } });
    } else if (userToDelete.role === "Manager") {
        // If manager deleted, maybe staff get orphaned.
        await User.updateMany({ managerId: id }, { $unset: { managerId: 1 } });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "User permanently removed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
