import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Define protected paths
  const authRoutes = ["/admin", "/manager", "/staff"];
  const isProtectedRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("team_task_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  const { role } = payload; // 'Admin', 'Manager', 'Staff'

  if (pathname.startsWith("/admin") && role !== "Admin") {
    // Instead of unauthorized, redirect to their respective dashboard
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
  }

  if (pathname.startsWith("/manager") && role !== "Manager") {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
  }

  if (pathname.startsWith("/staff") && role !== "Staff") {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/staff/:path*"
  ]
};
