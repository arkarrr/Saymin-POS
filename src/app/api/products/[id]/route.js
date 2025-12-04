// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureBrandExists,
  ensureUniqueProductName,
  validateProductPayload,
} from "../validators";

export const runtime = "nodejs";

function parseId(param) {
  const id = Number(param);
  if (Number.isNaN(id)) return null;
  return id;
}

export async function GET(_req, { params }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);

  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        _count: { select: { variants: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error(`GET /api/products/${id} error:`, err);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);

  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

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
      data.brandId,
      id
    );
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        brand: { select: { id: true, name: true } },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/products/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);

  if (!id) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({
        where: { productId: id },
      }),
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    console.error(`DELETE /api/products/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
