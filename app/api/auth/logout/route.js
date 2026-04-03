import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  
  response.cookies.set({
    name: "team_task_token",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/"
  });

  return response;
}
