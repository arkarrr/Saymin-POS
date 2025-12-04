// app/api/brands/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureUniqueBrandName,
  validateBrandPayload,
} from "./validators";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(brands);
  } catch (err) {
    console.error("GET /api/brands error:", err);
    return NextResponse.json(
      { message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = validateBrandPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const duplicateCheck = await ensureUniqueBrandName(data.name);
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (err) {
    console.error("POST /api/brands error:", err);
    return NextResponse.json(
      { message: "Failed to create brand" },
      { status: 500 }
    );
  }
}
