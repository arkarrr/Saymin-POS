// components/products/product-form.jsx
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

export function ProductForm({ product, onSuccess, onClose }) {
  const isEdit = Boolean(product);
  const [name, setName] = React.useState(product?.name ?? "");
  const [brandId, setBrandId] = React.useState(
    product?.brand?.id ?? product?.brandId ?? ""
  );
  const [remarks, setRemarks] = React.useState(product?.remarks ?? "");
  const [isActive, setIsActive] = React.useState(
    typeof product?.isActive === "boolean" ? product.isActive : true
  );
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [brands, setBrands] = React.useState([]);
  const [brandLoading, setBrandLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadBrands() {
      setBrandLoading(true);
      try {
        const res = await fetch("/api/brands");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load brands");
        }
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error("Load brands error:", err);
        toast("Failed to load brands", {
          description: err.message || "Please try again shortly.",
        });
      } finally {
        setBrandLoading(false);
      }
    }

    loadBrands();
  }, []);

  React.useEffect(() => {
    setName(product?.name ?? "");
    setBrandId(product?.brand?.id ?? product?.brandId ?? "");
    setRemarks(product?.remarks ?? "");
    setIsActive(
      typeof product?.isActive === "boolean" ? product.isActive : true
    );
    setError("");
  }, [product]);

  function validateInputs() {
    const trimmedName = name.trim();
    const trimmedRemarks = remarks.trim();

    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters long.";
    }

    if (trimmedName.length > 120) {
      return "Name must be 120 characters or less.";
    }

    if (!brandId) {
      return "Please select a brand.";
    }

    if (trimmedRemarks.length > 200) {
      return "Remarks must be 200 characters or less.";
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
        name: name.trim(),
        brandId: Number(brandId),
        remarks: remarks.trim() || null,
        isActive,
      };

      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
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
        setError(data.message || "Failed to save product");
        setIsLoading(false);
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("ProductForm submit error:", err);
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
          <FieldLabel htmlFor="product-name">Name</FieldLabel>
          <Input
            id="product-name"
            placeholder="Product name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel>Brand</FieldLabel>
          <Select
            value={brandId ? String(brandId) : ""}
            onValueChange={(value) => setBrandId(Number(value))}
            disabled={isLoading || brandLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={brandLoading ? "Loading..." : "Select brand"} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-remarks">Remarks</FieldLabel>
          <Input
            id="product-remarks"
            placeholder="Optional notes for this product"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id="product-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            disabled={isLoading}
          />
          <label
            htmlFor="product-active"
            className="text-sm font-medium text-foreground"
          >
            Active product
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
              : "Create product"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
