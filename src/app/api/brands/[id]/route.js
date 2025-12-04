// app/api/brands/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureUniqueBrandName,
  validateBrandPayload,
} from "../validators";

export async function GET(_req, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (err) {
    console.error(`GET /api/brands/${id} error:`, err);
    return NextResponse.json(
      { message: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { data, error } = validateBrandPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const duplicateCheck = await ensureUniqueBrandName(data.name, id);
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const updated = await prisma.brand.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/brands/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Brand deleted" });
  } catch (err) {
    console.error(`DELETE /api/brands/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
