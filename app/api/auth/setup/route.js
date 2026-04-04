import { NextResponse } from "next/server";
import ConnectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await ConnectDB();
    
    // Check if any admin already exists
    const adminCount = await User.countDocuments({ role: "Admin" });
    
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Setup locked. An Admin already exists." }, 
        { status: 403 }
      );
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Create the master admin account
    const masterAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Admin"
    });

    // Automatically log them in
    const token = await signToken({
      userId: masterAdmin._id.toString(),
      role: masterAdmin.role,
      email: masterAdmin.email,
      name: masterAdmin.name
    });

    const response = NextResponse.json({
      message: "Master Admin created successfully!",
      user: {
        id: masterAdmin._id,
        name: masterAdmin.name,
        email: masterAdmin.email,
        role: masterAdmin.role
      }
    }, { status: 201 });

    response.cookies.set({
      name: "team_task_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax"
    });

    return response;

  } catch (error) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
