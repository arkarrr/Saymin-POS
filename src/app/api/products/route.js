// app/api/products/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureBrandExists,
  ensureUniqueProductName,
  validateProductPayload,
} from "./validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { id: true, name: true } },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = validateProductPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const brandCheck = await ensureBrandExists(data.brandId);
    if (brandCheck.error) {
      return NextResponse.json({ message: brandCheck.error }, { status: 400 });
    }

    const duplicateCheck = await ensureUniqueProductName(
      data.name,
      data.brandId
    );
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data,
      include: {
        brand: { select: { id: true, name: true } },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
