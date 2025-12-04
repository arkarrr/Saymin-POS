// components/brands/brand-form.jsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function BrandForm({ brand, onSuccess, onClose }) {
  const isEdit = Boolean(brand);

  const [name, setName] = React.useState(brand?.name ?? "");
  const [remarks, setRemarks] = React.useState(brand?.remarks ?? "");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setName(brand?.name ?? "");
    setRemarks(brand?.remarks ?? "");
    setError("");
  }, [brand]);

  function validateInputs() {
    const trimmedName = name.trim();
    const trimmedRemarks = remarks.trim();

    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters long.";
    }

    if (trimmedName.length > 100) {
      return "Name must be 100 characters or less.";
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
      const trimmedName = name.trim();
      const trimmedRemarks = remarks.trim();
      const payload = {
        name: trimmedName,
        remarks: trimmedRemarks || null,
      };

      const url = isEdit ? `/api/brands/${brand.id}` : "/api/brands";
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
        setError(data.message || "Failed to save brand");
        setIsLoading(false);
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("BrandForm submit error:", err);
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
          <FieldLabel htmlFor="brand-name">Name</FieldLabel>
          <Input
            id="brand-name"
            placeholder="Brand name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="brand-remarks">Remarks</FieldLabel>
          <Input
            id="brand-remarks"
            placeholder="Optional notes for this brand"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
          />
        </Field>

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
              : "Create brand"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
