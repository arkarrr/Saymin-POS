// app/brands/page.jsx
"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

import { BrandForm } from "@/components/brands/brand-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BrandsPage() {
  const [brands, setBrands] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState(null);

  async function fetchBrands() {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast("Failed to load brands", {
          description: data.message || "Please try again in a moment.",
        });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Fetch brands error:", err);
      toast("Failed to load brands", {
        description: "Something went wrong while loading brands.",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchBrands();
  }, []);

  function openCreateDialog() {
    setSelectedBrand(null);
    setDialogOpen(true);
  }

  function openEditDialog(brand) {
    setSelectedBrand(brand);
    setDialogOpen(true);
  }

  function handleDialogClose(open) {
    setDialogOpen(open);
    if (!open) {
      setSelectedBrand(null);
    }
  }

  async function handleDelete(brand) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${brand.name}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast("Failed to delete brand", {
          description: data.message || "Please try again.",
        });
        return;
      }

      toast("Brand deleted", {
        description: `“${brand.name}” has been removed.`,
      });
      fetchBrands();
    } catch (err) {
      console.error("Delete brand error:", err);
      toast("Failed to delete brand", {
        description: "Something went wrong while deleting.",
      });
    }
  }

  function handleFormSuccess() {
    const isEdit = Boolean(selectedBrand);
    toast.success(isEdit ? "Brand updated" : "Brand created", {
      description: isEdit
        ? "The brand details have been updated."
        : "A new brand has been added.",
    });

    setDialogOpen(false);
    setSelectedBrand(null);
    fetchBrands();
  }

  const dialogTitle = selectedBrand ? "Edit brand" : "Create new brand";

  const dialogDescription = selectedBrand
    ? "Update the brand details and save your changes."
    : "Add a new brand to your catalog.";

  return (
    <SidebarProvider
    style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }
      }
    >
      <AppSidebar variant="inset"/>
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Brands
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Manage product brands for quick selection while creating items.
                </p>
              </div>
              <Button size="sm" onClick={openCreateDialog}>
                Add brand
              </Button>
            </div>

            {/* Brands list */}
            <section className="rounded-lg border bg-background p-3 sm:p-4">
              {loading ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Loading brands...
                </p>
              ) : brands.length === 0 ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  No brands yet. Click &quot;Add brand&quot; to create one.
                </p>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="space-y-2 md:hidden">
                    {brands.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-md border p-2 text-xs sm:p-3 sm:text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium">{b.name}</div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openEditDialog(b)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-600"
                              onClick={() => handleDelete(b)}
                            >
                              Del
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1 space-y-0.5 text-muted-foreground">
                          <p>Remarks: {b.remarks || "-"}</p>
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
                            <th className="py-2 pl-3 pr-4">Name</th>
                            <th className="py-2 pr-4">Remarks</th>
                            <th className="py-2 pr-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.map((b) => (
                            <tr
                              key={b.id}
                              className="border-b last:border-none hover:bg-muted/40"
                            >
                              <td className="py-2 pl-3 pr-4 font-medium">
                                {b.name}
                              </td>
                              <td className="py-2 pr-4">{b.remarks || "-"}</td>
                              <td className="py-2 pr-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(b)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-600"
                                    onClick={() => handleDelete(b)}
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

            <BrandForm
              brand={selectedBrand}
              onSuccess={handleFormSuccess}
              onClose={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
