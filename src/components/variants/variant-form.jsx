// components/variants/variant-form.jsx
"use client";

import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function VariantForm({ variant, onSuccess, onClose }) {
  const isEdit = Boolean(variant);

  const [products, setProducts] = React.useState([]);
  const [productLoading, setProductLoading] = React.useState(true);

  const [productId, setProductId] = React.useState(
    variant?.product?.id ?? variant?.productId ?? ""
  );
  const [label, setLabel] = React.useState(variant?.label ?? "");
  const [unit, setUnit] = React.useState(variant?.unit ?? "");
  const [sizeValue, setSizeValue] = React.useState(
    variant?.sizeValue ?? ""
  );
  const [sku, setSku] = React.useState(variant?.sku ?? "");
  const [barcode, setBarcode] = React.useState(variant?.barcode ?? "");
  const [costPrice, setCostPrice] = React.useState(
    variant?.costPrice ?? ""
  );
  const [sellPrice, setSellPrice] = React.useState(
    variant?.sellPrice ?? ""
  );
  const [openingStock, setOpeningStock] = React.useState(
    variant?.openingStock ?? 0
  );
  const [remarks, setRemarks] = React.useState(variant?.remarks ?? "");
  const [isActive, setIsActive] = React.useState(
    typeof variant?.isActive === "boolean" ? variant.isActive : true
  );
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadProducts() {
      setProductLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Load products error:", err);
        toast("Failed to load products", {
          description: err.message || "Please try again shortly.",
        });
      } finally {
        setProductLoading(false);
      }
    }

    loadProducts();
  }, []);

  React.useEffect(() => {
    setProductId(variant?.product?.id ?? variant?.productId ?? "");
    setLabel(variant?.label ?? "");
    setUnit(variant?.unit ?? "");
    setSizeValue(variant?.sizeValue ?? "");
    setSku(variant?.sku ?? "");
    setBarcode(variant?.barcode ?? "");
    setCostPrice(variant?.costPrice ?? "");
    setSellPrice(variant?.sellPrice ?? "");
    setOpeningStock(variant?.openingStock ?? 0);
    setRemarks(variant?.remarks ?? "");
    setIsActive(
      typeof variant?.isActive === "boolean" ? variant.isActive : true
    );
    setError("");
  }, [variant]);

  function validateInputs() {
    if (!productId) return "Please select a product.";
    const trimmedLabel = label.trim();
    const trimmedUnit = unit.trim();
    const trimmedRemarks = remarks.trim();
    const trimmedSku = sku.trim();
    const trimmedBarcode = barcode.trim();

    if (trimmedLabel.length < 2) return "Label must be at least 2 characters.";
    if (trimmedLabel.length > 120) return "Label must be 120 characters or less.";
    if (!trimmedUnit) return "Unit is required.";
    if (trimmedUnit.length > 20) return "Unit must be 20 characters or less.";
    if (trimmedSku.length > 80) return "SKU must be 80 characters or less.";
    if (trimmedBarcode.length > 80) return "Barcode must be 80 characters or less.";
    if (trimmedRemarks.length > 200) return "Remarks must be 200 characters or less.";

    const cost = Number(costPrice);
    const sell = Number(sellPrice);
    if (!Number.isFinite(cost)) return "Cost price must be a valid number.";
    if (!Number.isFinite(sell)) return "Sell price must be a valid number.";

    if (openingStock !== "" && (Number(openingStock) < 0 || !Number.isFinite(Number(openingStock)))) {
      return "Opening stock must be zero or a positive number.";
    }

    if (sizeValue !== "" && !Number.isFinite(Number(sizeValue))) {
      return "Size must be a valid number.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        productId: Number(productId),
        label: label.trim(),
        unit: unit.trim(),
        sizeValue: sizeValue === "" ? null : Number(sizeValue),
        sku: sku.trim() || null,
        barcode: barcode.trim() || null,
        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        openingStock:
          openingStock === "" ? 0 : Math.max(0, Math.trunc(Number(openingStock))),
        remarks: remarks.trim() || null,
        isActive,
      };

      const url = isEdit ? `/api/variants/${variant.id}` : "/api/variants";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to save variant");
        setIsLoading(false);
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("VariantForm submit error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        {error && (
          <FieldDescription className="mb-1 text-xs text-red-500 sm:text-sm">
            {error}
          </FieldDescription>
        )}

        <Field>
          <FieldLabel>Product</FieldLabel>
          <Select
            value={productId ? String(productId) : ""}
            onValueChange={(value) => setProductId(Number(value))}
            disabled={isLoading || productLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={productLoading ? "Loading..." : "Select product"} />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-label">Label</FieldLabel>
          <Input
            id="variant-label"
            placeholder="e.g. 1 L bottle"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-unit">Unit</FieldLabel>
          <Input
            id="variant-unit"
            placeholder="e.g. kg, L, pack"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-size">Size value</FieldLabel>
          <Input
            id="variant-size"
            type="number"
            step="0.01"
            placeholder="Optional numeric size"
            value={sizeValue}
            onChange={(e) => setSizeValue(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-sku">SKU</FieldLabel>
          <Input
            id="variant-sku"
            placeholder="Optional SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-barcode">Barcode</FieldLabel>
          <Input
            id="variant-barcode"
            placeholder="Optional barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-cost">Cost price</FieldLabel>
          <Input
            id="variant-cost"
            type="number"
            step="0.01"
            placeholder="Cost price"
            required
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-sell">Sell price</FieldLabel>
          <Input
            id="variant-sell"
            type="number"
            step="0.01"
            placeholder="Sell price"
            required
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-opening">Opening stock</FieldLabel>
          <Input
            id="variant-opening"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={openingStock}
            onChange={(e) => setOpeningStock(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="variant-remarks">Remarks</FieldLabel>
          <Input
            id="variant-remarks"
            placeholder="Optional notes"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id="variant-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            disabled={isLoading}
          />
          <label
            htmlFor="variant-active"
            className="text-sm font-medium text-foreground"
          >
            Active variant
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save changes"
              : "Create variant"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
