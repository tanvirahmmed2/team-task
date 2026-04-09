import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken, hashPassword } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    await ConnectDB();
    const token = request.cookies.get("team_task_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
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

    const newManager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Manager",
      createdBy: payload.userId
    });

    const loginUrl = `${request.headers.get("origin")}`;
    // Fire and forget email
    sendWelcomeEmail(email, name, password, loginUrl);

    return NextResponse.json({
      message: "Manager created successfully",
      manager: { id: newManager._id, name: newManager.name, email: newManager.email }
    }, { status: 201 });

  } catch (error) {
    console.error("Create Manager Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
