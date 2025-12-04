// app/api/customers/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ensureUniqueCustomerName,
  validateCustomerPayload,
} from "./validators";

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
    const { data, error } = validateCustomerPayload(body);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const duplicateCheck = await ensureUniqueCustomerName(data.name);
    if (duplicateCheck.error) {
      return NextResponse.json(
        { message: duplicateCheck.error },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data,
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
