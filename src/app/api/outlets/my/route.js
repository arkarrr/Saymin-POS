import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

// If you're using Prisma, ensure Node runtime:
export const runtime = "nodejs";

async function getUserFromCookie() {
  const cookieStore = await cookies(); // 👈 await here
  const token = cookieStore.get("pos_session")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload; // { userId, email, roles }
  } catch {
    return null;
  }
}

export async function GET() {
  const payload = await getUserFromCookie(); // 👈 await helper
  if (!payload?.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userOutlets = await prisma.userOutlet.findMany({
    where: {
      userId: payload.userId,
      outlet: { isActive: true },
    },
    include: {
      outlet: true,
    },
  });

  const outlets = userOutlets.map((uo) => ({
    id: uo.outlet.id,
    name: uo.outlet.name,
    code: uo.outlet.code,
    address: uo.outlet.address,
    isDefault: uo.isDefault,
  }));

  return NextResponse.json({ outlets });
}