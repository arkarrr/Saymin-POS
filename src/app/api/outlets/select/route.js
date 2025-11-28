// src/app/api/outlets/select/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get("pos_session")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req) {
  const payload = getUserFromCookie();
  if (!payload?.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { outletId } = await req.json();

  if (!outletId) {
    return NextResponse.json(
      { message: "outletId is required" },
      { status: 400 }
    );
  }

  // Verify that this outlet belongs to the user
  const userOutlet = await prisma.userOutlet.findUnique({
    where: {
      userId_outletId: {
        userId: payload.userId,
        outletId: Number(outletId),
      },
    },
    include: {
      outlet: true,
    },
  });

  if (!userOutlet) {
    return NextResponse.json(
      { message: "You do not have access to this outlet" },
      { status: 403 }
    );
  }

  const res = NextResponse.json(
    {
      message: "Outlet selected",
      outlet: {
        id: userOutlet.outlet.id,
        name: userOutlet.outlet.name,
        code: userOutlet.outlet.code,
      },
    },
    { status: 200 }
  );

  // store selected outlet in cookie
  res.cookies.set("pos_outlet", String(userOutlet.outlet.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  });

  return res;
}