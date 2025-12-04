// app/api/customers/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureUniqueCustomerName,
  validateCustomerPayload,
} from "../validators";

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
    const { data, error } = validateCustomerPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const duplicateCheck = await ensureUniqueCustomerName(data.name, id);
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id },
      data,
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
