// app/api/customers/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (err) {
    console.error("GET /api/customers error:", err);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, address, phone, remarks } = body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        address: address || null,
        phone: phone || null,
        remarks: remarks || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    console.error("POST /api/customers error:", err);
    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}