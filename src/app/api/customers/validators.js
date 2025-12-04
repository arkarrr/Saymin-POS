import prisma from "@/lib/db";

const PHONE_PATTERN = /^[+0-9().\s-]{6,20}$/;
const MAX_PHONE_LENGTH = 20;
const MAX_TEXT_LENGTH = 200;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

export function validateCustomerPayload(body = {}) {
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const rawAddress =
    typeof body.address === "string" ? body.address.trim() : "";
  const rawRemarks =
    typeof body.remarks === "string" ? body.remarks.trim() : "";

  if (!rawName || rawName.length < MIN_NAME_LENGTH) {
    return { error: "Name must be at least 2 characters long" };
  }

  if (rawName.length > MAX_NAME_LENGTH) {
    return { error: "Name must be 100 characters or less" };
  }

  if (rawPhone && !PHONE_PATTERN.test(rawPhone)) {
    return { error: "Phone can only include numbers, spaces, +, -, ( ) or ." };
  }

  if (rawPhone.length > MAX_PHONE_LENGTH) {
    return { error: "Phone must be 20 characters or less" };
  }

  if (rawAddress.length > MAX_TEXT_LENGTH) {
    return { error: "Address must be 200 characters or less" };
  }

  if (rawRemarks.length > MAX_TEXT_LENGTH) {
    return { error: "Remarks must be 200 characters or less" };
  }

  return {
    data: {
      name: rawName,
      phone: rawPhone || null,
      address: rawAddress || null,
      remarks: rawRemarks || null,
    },
  };
}

export async function ensureUniqueCustomerName(name, excludeId) {
  const existing = await prisma.customer.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return { error: "A customer with this name already exists" };
  }

  return { ok: true };
}
