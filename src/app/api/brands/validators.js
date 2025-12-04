import prisma from "@/lib/db";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_REMARKS_LENGTH = 200;

export function validateBrandPayload(body = {}) {
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const rawRemarks =
    typeof body.remarks === "string" ? body.remarks.trim() : "";

  if (!rawName || rawName.length < MIN_NAME_LENGTH) {
    return { error: "Name must be at least 2 characters long" };
  }

  if (rawName.length > MAX_NAME_LENGTH) {
    return { error: "Name must be 100 characters or less" };
  }

  if (rawRemarks.length > MAX_REMARKS_LENGTH) {
    return { error: "Remarks must be 200 characters or less" };
  }

  return {
    data: {
      name: rawName,
      remarks: rawRemarks || null,
    },
  };
}

export async function ensureUniqueBrandName(name, excludeId) {
  const existing = await prisma.brand.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return { error: "A brand with this name already exists" };
  }

  return { ok: true };
}
