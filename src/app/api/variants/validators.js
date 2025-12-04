import prisma from "@/lib/db";

const MIN_LABEL_LENGTH = 2;
const MAX_LABEL_LENGTH = 120;
const MAX_UNIT_LENGTH = 20;
const MAX_REMARKS_LENGTH = 200;
const MAX_SKU_LENGTH = 80;
const MAX_BARCODE_LENGTH = 80;

function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function validateVariantPayload(body = {}) {
  const rawLabel = typeof body.label === "string" ? body.label.trim() : "";
  const rawUnit = typeof body.unit === "string" ? body.unit.trim() : "";
  const rawSku = typeof body.sku === "string" ? body.sku.trim() : "";
  const rawBarcode =
    typeof body.barcode === "string" ? body.barcode.trim() : "";
  const rawRemarks =
    typeof body.remarks === "string" ? body.remarks.trim() : "";

  const productId =
    typeof body.productId === "number"
      ? body.productId
      : Number.parseInt(body.productId, 10);

  const sizeValue = parseNumber(body.sizeValue);
  const costPrice = parseNumber(body.costPrice);
  const sellPrice = parseNumber(body.sellPrice);
  const openingStock = parseNumber(body.openingStock);

  const isActive =
    typeof body.isActive === "boolean" ? body.isActive : true;

  if (!Number.isInteger(productId) || productId <= 0) {
    return { error: "productId must be a valid product id" };
  }

  if (!rawLabel || rawLabel.length < MIN_LABEL_LENGTH) {
    return { error: "Label must be at least 2 characters long" };
  }

  if (rawLabel.length > MAX_LABEL_LENGTH) {
    return { error: "Label must be 120 characters or less" };
  }

  if (!rawUnit) {
    return { error: "Unit is required" };
  }

  if (rawUnit.length > MAX_UNIT_LENGTH) {
    return { error: "Unit must be 20 characters or less" };
  }

  if (rawSku.length > MAX_SKU_LENGTH) {
    return { error: "SKU must be 80 characters or less" };
  }

  if (rawBarcode.length > MAX_BARCODE_LENGTH) {
    return { error: "Barcode must be 80 characters or less" };
  }

  if (rawRemarks.length > MAX_REMARKS_LENGTH) {
    return { error: "Remarks must be 200 characters or less" };
  }

  if (sizeValue != null && !Number.isFinite(sizeValue)) {
    return { error: "Size must be a valid number" };
  }

  if (costPrice == null || !Number.isFinite(costPrice)) {
    return { error: "Cost price is required and must be a valid number" };
  }

  if (sellPrice == null || !Number.isFinite(sellPrice)) {
    return { error: "Sell price is required and must be a valid number" };
  }

  if (openingStock != null && (!Number.isFinite(openingStock) || openingStock < 0)) {
    return { error: "Opening stock must be zero or a positive number" };
  }

  return {
    data: {
      productId,
      label: rawLabel,
      unit: rawUnit,
      sizeValue: sizeValue ?? null,
      sku: rawSku || null,
      barcode: rawBarcode || null,
      costPrice,
      sellPrice,
      openingStock: openingStock != null ? Math.trunc(openingStock) : 0,
      remarks: rawRemarks || null,
      isActive,
    },
  };
}

export async function ensureProductExists(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    return { error: "Product not found" };
  }

  return { product };
}
