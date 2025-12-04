// app/api/customers/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_req, { params }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (err) {
    console.error(`GET /api/customers/${id} error:`, err);
    return NextResponse.json(
      { message: "Failed to fetch customer" },
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
    const { name, address, phone, remarks } = body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: name.trim(),
        address: address || null,
        phone: phone || null,
        remarks: remarks || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/customers/${id} error:`, err);

    // Prisma "record not found" code is P2025
    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update customer" },
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

  if (id === 1) {
    // protect walk-in
    return NextResponse.json(
      { message: "Cannot delete the default Walk-in Customer" },
      { status: 400 }
    );
  }

  try {
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(`DELETE /api/customers/${id} error:`, err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
