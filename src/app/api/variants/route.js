// app/api/variants/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureProductExists,
  validateVariantPayload,
} from "./validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, brandId: true },
        },
      },
    });

    return NextResponse.json(variants);
  } catch (err) {
    console.error("GET /api/variants error:", err);
    return NextResponse.json(
      { message: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = validateVariantPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const productCheck = await ensureProductExists(data.productId);
    if (productCheck.error) {
      return NextResponse.json(
        { message: productCheck.error },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data,
      include: {
        product: { select: { id: true, name: true, brandId: true } },
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (err) {
    console.error("POST /api/variants error:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "SKU or barcode already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create variant" },
      { status: 500 }
    );
  }
}
