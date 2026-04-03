import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Manager") {
      return NextResponse.json({ error: "Forbidden: Managers only" }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Staff",
      createdBy: payload.userId,
      managerId: payload.userId
    });

    return NextResponse.json({
      message: "Staff created successfully",
      staff: { id: newStaff._id, name: newStaff.name, email: newStaff.email }
    }, { status: 201 });

  } catch (error) {
    console.error("Create Staff Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
