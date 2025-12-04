// app/api/variants/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureProductExists,
  validateVariantPayload,
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
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, brandId: true } },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { message: "Variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(variant);
  } catch (err) {
    console.error(`GET /api/variants/${id} error:`, err);
    return NextResponse.json(
      { message: "Failed to fetch variant" },
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

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true, brandId: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/variants/${id} error:`, err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "SKU or barcode already exists" },
        { status: 400 }
      );
    }

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update variant" },
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
    await prisma.productVariant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Variant deleted" });
  } catch (err) {
    console.error(`DELETE /api/variants/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
