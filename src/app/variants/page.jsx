// app/variants/page.jsx
"use client";

import React from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { VariantForm } from "@/components/variants/variant-form";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function VariantsPage() {
  const [variants, setVariants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVariant, setSelectedVariant] = React.useState(null);
  const [variantToDelete, setVariantToDelete] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  async function fetchVariants() {
    setLoading(true);
    try {
      const res = await fetch("/api/variants");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast("Failed to load variants", {
          description: data.message || "Please try again in a moment.",
        });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setVariants(data);
    } catch (err) {
      console.error("Fetch variants error:", err);
      toast("Failed to load variants", {
        description: "Something went wrong while loading variants.",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchVariants();
  }, []);

  function openCreateDialog() {
    setSelectedVariant(null);
    setDialogOpen(true);
  }

  function openEditDialog(variant) {
    setSelectedVariant(variant);
    setDialogOpen(true);
  }

  function handleDialogClose(open) {
    setDialogOpen(open);
    if (!open) {
      setSelectedVariant(null);
    }
  }

  function openDeleteDialog(variant) {
    setVariantToDelete(variant);
  }

  async function handleConfirmDelete() {
    if (!variantToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/variants/${variantToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast("Failed to delete variant", {
          description: data.message || "Please try again.",
        });
        setDeleteLoading(false);
        return;
      }

      toast("Variant deleted", {
        description: `“${variantToDelete.label}” has been removed.`,
      });
      fetchVariants();
    } catch (err) {
      console.error("Delete variant error:", err);
      toast("Failed to delete variant", {
        description: "Something went wrong while deleting.",
      });
    } finally {
      setDeleteLoading(false);
      setVariantToDelete(null);
    }
  }

  function handleFormSuccess() {
    const isEdit = Boolean(selectedVariant);
    toast.success(isEdit ? "Variant updated" : "Variant created", {
      description: isEdit
        ? "The variant details have been updated."
        : "A new variant has been added.",
    });

    setDialogOpen(false);
    setSelectedVariant(null);
    fetchVariants();
  }

  const dialogTitle = selectedVariant ? "Edit variant" : "Create new variant";
  const dialogDescription = selectedVariant
    ? "Update the variant details and save your changes."
    : "Add a new product variant.";

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Variants
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Manage product variants, pricing, and stock.
                </p>
              </div>
              <Button size="sm" onClick={openCreateDialog}>
                Add variant
              </Button>
            </div>

            {/* Variants list */}
            <section className="rounded-lg border bg-background p-3 sm:p-4">
              {loading ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Loading variants...
                </p>
              ) : variants.length === 0 ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  No variants yet. Click &quot;Add variant&quot; to create one.
                </p>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="space-y-2 md:hidden">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="rounded-md border p-2 text-xs sm:p-3 sm:text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="font-medium leading-tight">
                              {v.label}
                            </div>
                            <div className="text-muted-foreground">
                              Product: {v.product?.name || "-"}
                            </div>
                            <div className="text-muted-foreground">
                              SKU: {v.sku || "-"}
                            </div>
                            <div className="text-muted-foreground">
                              Barcode: {v.barcode || "-"}
                            </div>
                            <div className="text-muted-foreground">
                              Cost: {v.costPrice}, Sell: {v.sellPrice}
                            </div>
                            <div className="text-muted-foreground">
                              Opening stock: {v.openingStock ?? 0}
                            </div>
                            {v.remarks && (
                              <div className="text-muted-foreground">
                                {v.remarks}
                              </div>
                            )}
                            <Badge
                              variant="outline"
                              className="mt-1 inline-flex w-fit gap-1 px-1.5"
                            >
                              {v.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openEditDialog(v)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-600"
                              onClick={() => openDeleteDialog(v)}
                            >
                              Del
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                            <th className="py-2 pl-3 pr-4">Label</th>
                            <th className="py-2 pr-4">Product</th>
                            <th className="py-2 pr-4">SKU</th>
                            <th className="py-2 pr-4">Barcode</th>
                            <th className="py-2 pr-4">Cost</th>
                            <th className="py-2 pr-4">Sell</th>
                            <th className="py-2 pr-4">Opening</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr
                              key={v.id}
                              className="border-b last:border-none hover:bg-muted/40"
                            >
                              <td className="py-2 pl-3 pr-4 font-medium">
                                {v.label}
                                <div className="text-xs text-muted-foreground">
                                  {v.unit}
                                  {v.sizeValue ? ` • ${v.sizeValue}` : ""}
                                </div>
                              </td>
                              <td className="py-2 pr-4">{v.product?.name || "-"}</td>
                              <td className="py-2 pr-4">{v.sku || "-"}</td>
                              <td className="py-2 pr-4">{v.barcode || "-"}</td>
                              <td className="py-2 pr-4">{v.costPrice}</td>
                              <td className="py-2 pr-4">{v.sellPrice}</td>
                              <td className="py-2 pr-4">
                                {v.openingStock ?? 0}
                              </td>
                              <td className="py-2 pr-4">
                                <Badge
                                  variant={v.isActive ? "outline" : "secondary"}
                                  className="px-1.5"
                                >
                                  {v.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-2 pr-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(v)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-600"
                                    onClick={() => openDeleteDialog(v)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>

        {/* Dialog for create/update */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-background px-4 py-4 sm:px-6 sm:py-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-base sm:text-lg">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>

            <VariantForm
              variant={selectedVariant}
              onSuccess={handleFormSuccess}
              onClose={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Confirm delete dialog */}
        <Dialog
          open={Boolean(variantToDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setVariantToDelete(null);
            }
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Delete variant?
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                This action will permanently remove{" "}
                <span className="font-semibold text-foreground">
                  {variantToDelete?.label}
                </span>{" "}
                from your variants list.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setVariantToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
