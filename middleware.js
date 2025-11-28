import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow login routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Read JWT cookie
  const token = req.cookies.get("pos_session")?.value;

  // Not logged in → redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Validate token
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Protect routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/outlets/:path*",
    "/products/:path*",
    "/pos/:path*",
    "/settings/:path*",
  ],
};