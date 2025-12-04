// components/customers/customer-form.jsx
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

export function CustomerForm({ customer, onSuccess, onClose }) {
  const isEdit = Boolean(customer);

  const [name, setName] = React.useState(customer?.name ?? "");
  const [address, setAddress] = React.useState(customer?.address ?? "");
  const [phone, setPhone] = React.useState(customer?.phone ?? "");
  const [remarks, setRemarks] = React.useState(customer?.remarks ?? "");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setName(customer?.name ?? "");
    setAddress(customer?.address ?? "");
    setPhone(customer?.phone ?? "");
    setRemarks(customer?.remarks ?? "");
    setError("");
  }, [customer]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        name,
        address: address || null,
        phone: phone || null,
        remarks: remarks || null,
      };

      const url = isEdit ? `/api/customers/${customer.id}` : "/api/customers";
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
        setError(data.message || "Failed to save customer");
        setIsLoading(false);
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("CustomerForm submit error:", err);
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
          <FieldLabel htmlFor="customer-name">Name</FieldLabel>
          <Input
            id="customer-name"
            placeholder="Customer name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
          <Input
            id="customer-phone"
            placeholder="Optional phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customer-address">Address</FieldLabel>
          <Input
            id="customer-address"
            placeholder="Optional address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customer-remarks">Remarks</FieldLabel>
          <Input
            id="customer-remarks"
            placeholder="Notes about this customer"
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
              : "Create customer"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}