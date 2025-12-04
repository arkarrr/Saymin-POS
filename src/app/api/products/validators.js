import prisma from "@/lib/db";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 120;
const MAX_REMARKS_LENGTH = 200;

export function validateProductPayload(body = {}) {
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const rawRemarks =
    typeof body.remarks === "string" ? body.remarks.trim() : "";
  const brandId =
    typeof body.brandId === "number"
      ? body.brandId
      : Number.parseInt(body.brandId, 10);
  const isActive =
    typeof body.isActive === "boolean" ? body.isActive : true;

  if (!rawName || rawName.length < MIN_NAME_LENGTH) {
    return { error: "Name must be at least 2 characters long" };
  }

  if (rawName.length > MAX_NAME_LENGTH) {
    return { error: "Name must be 120 characters or less" };
  }

  if (!Number.isInteger(brandId) || brandId <= 0) {
    return { error: "brandId must be a valid brand id" };
  }

  if (rawRemarks.length > MAX_REMARKS_LENGTH) {
    return { error: "Remarks must be 200 characters or less" };
  }

  return {
    data: {
      name: rawName,
      brandId,
      remarks: rawRemarks || null,
      isActive,
    },
  };
}

export async function ensureBrandExists(brandId) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true, name: true },
  });

  if (!brand) {
    return { error: "Brand not found" };
  }

  return { brand };
}

export async function ensureUniqueProductName(name, brandId, excludeId) {
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      brandId,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return {
      error: "A product with this name already exists for the selected brand",
    };
  }

  return { ok: true };
}
