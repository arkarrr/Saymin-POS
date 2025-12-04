// app/products/page.jsx
"use client";

import React from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { ProductForm } from "@/components/products/product-form";
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

export default function ProductsPage() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [productToDelete, setProductToDelete] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [variantManagerOpen, setVariantManagerOpen] = React.useState(false);
  const [variantManagerProduct, setVariantManagerProduct] = React.useState(null);
  const [variantList, setVariantList] = React.useState([]);
  const [variantLoading, setVariantLoading] = React.useState(false);
  const [variantFormOpen, setVariantFormOpen] = React.useState(false);
  const [selectedVariant, setSelectedVariant] = React.useState(null);
  const [variantToDelete, setVariantToDelete] = React.useState(null);
  const [variantDeleteLoading, setVariantDeleteLoading] = React.useState(false);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast("Failed to load products", {
          description: data.message || "Please try again in a moment.",
        });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
      toast("Failed to load products", {
        description: "Something went wrong while loading products.",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchProducts();
  }, []);

  function openCreateDialog() {
    setSelectedProduct(null);
    setDialogOpen(true);
  }

  function openEditDialog(product) {
    setSelectedProduct(product);
    setDialogOpen(true);
  }

  function handleDialogClose(open) {
    setDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
    }
  }

  function openDeleteDialog(product) {
    setProductToDelete(product);
  }

  async function fetchProductVariants(productId) {
    setVariantLoading(true);
    try {
      const res = await fetch(`/api/variants?productId=${productId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast("Failed to load variants", {
          description: data.message || "Please try again in a moment.",
        });
        setVariantLoading(false);
        return;
      }
      const data = await res.json();
      setVariantList(data);
    } catch (err) {
      console.error("Fetch variants error:", err);
      toast("Failed to load variants", {
        description: "Something went wrong while loading variants.",
      });
    } finally {
      setVariantLoading(false);
    }
  }

  function openVariantManager(product) {
    setVariantManagerProduct(product);
    setVariantManagerOpen(true);
    fetchProductVariants(product.id);
  }

  function handleVariantManagerClose(open) {
    setVariantManagerOpen(open);
    if (!open) {
      setVariantManagerProduct(null);
      setVariantList([]);
      setSelectedVariant(null);
      setVariantFormOpen(false);
      setVariantToDelete(null);
    }
  }

  function openVariantCreate() {
    setSelectedVariant(null);
    setVariantFormOpen(true);
  }

  function openVariantEdit(variant) {
    setSelectedVariant(variant);
    setVariantFormOpen(true);
  }

  function openVariantDelete(variant) {
    setVariantToDelete(variant);
  }

  async function handleVariantDelete() {
    if (!variantToDelete) return;
    setVariantDeleteLoading(true);

    try {
      const res = await fetch(`/api/variants/${variantToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast("Failed to delete variant", {
          description: data.message || "Please try again.",
        });
        setVariantDeleteLoading(false);
        return;
      }

      toast("Variant deleted", {
        description: `“${variantToDelete.label}” has been removed.`,
      });
      if (variantManagerProduct) {
        fetchProductVariants(variantManagerProduct.id);
      }
      fetchProducts();
    } catch (err) {
      console.error("Delete variant error:", err);
      toast("Failed to delete variant", {
        description: "Something went wrong while deleting.",
      });
    } finally {
      setVariantDeleteLoading(false);
      setVariantToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast("Failed to delete product", {
          description: data.message || "Please try again.",
        });
        setDeleteLoading(false);
        return;
      }

      toast("Product deleted", {
        description: `“${productToDelete.name}” has been removed.`,
      });
      fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      toast("Failed to delete product", {
        description: "Something went wrong while deleting.",
      });
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
    }
  }

  function handleFormSuccess() {
    const isEdit = Boolean(selectedProduct);
    toast.success(isEdit ? "Product updated" : "Product created", {
      description: isEdit
        ? "The product details have been updated."
        : "A new product has been added.",
    });

    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  }

  function handleVariantFormSuccess() {
    const isEdit = Boolean(selectedVariant);
    toast.success(isEdit ? "Variant updated" : "Variant created", {
      description: isEdit
        ? "The variant details have been updated."
        : "A new variant has been added.",
    });

    setVariantFormOpen(false);
    setSelectedVariant(null);
    if (variantManagerProduct) {
      fetchProductVariants(variantManagerProduct.id);
    }
    fetchProducts();
  }

  const dialogTitle = selectedProduct ? "Edit product" : "Create new product";
  const dialogDescription = selectedProduct
    ? "Update the product details and save your changes."
    : "Add a new product to your catalog.";

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
                  Products
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Manage products, their brands, and availability status.
                </p>
              </div>
              <Button size="sm" onClick={openCreateDialog}>
                Add product
              </Button>
            </div>

            {/* Products list */}
            <section className="rounded-lg border bg-background p-3 sm:p-4">
              {loading ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Loading products...
                </p>
              ) : products.length === 0 ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  No products yet. Click &quot;Add product&quot; to create one.
                </p>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="space-y-2 md:hidden">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-md border p-2 text-xs sm:p-3 sm:text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="font-medium leading-tight">
                              {p.name}
                            </div>
                            <div className="text-muted-foreground">
                              Brand: {p.brand?.name || "-"}
                            </div>
                            <div className="text-muted-foreground">
                              {(p._count?.variants ?? 0)}{" "}
                              {(p._count?.variants ?? 0) === 1
                                ? "variant"
                                : "variants"}
                            </div>
                            <div className="text-muted-foreground">
                              {p.remarks || "No remarks"}
                            </div>
                            <Badge
                              variant="outline"
                              className="mt-1 inline-flex w-fit gap-1 px-1.5"
                            >
                              {p.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openEditDialog(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openVariantManager(p)}
                            >
                              Variants
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-600"
                              onClick={() => openDeleteDialog(p)}
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
                            <th className="py-2 pl-3 pr-4">Name</th>
                            <th className="py-2 pr-4">Brand</th>
                            <th className="py-2 pr-4">Variants</th>
                            <th className="py-2 pr-4">Remarks</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b last:border-none hover:bg-muted/40"
                            >
                              <td className="py-2 pl-3 pr-4 font-medium">
                                {p.name}
                              </td>
                              <td className="py-2 pr-4">{p.brand?.name || "-"}</td>
                              <td className="py-2 pr-4">
                                {(p._count?.variants ?? 0)}{" "}
                                {(p._count?.variants ?? 0) === 1
                                  ? "variant"
                                  : "variants"}
                              </td>
                              <td className="py-2 pr-4">
                                {p.remarks || "-"}
                              </td>
                              <td className="py-2 pr-4">
                                <Badge
                                  variant={p.isActive ? "outline" : "secondary"}
                                  className="px-1.5"
                                >
                                  {p.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-2 pr-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(p)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openVariantManager(p)}
                                  >
                                    Manage variants
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-600"
                                    onClick={() => openDeleteDialog(p)}
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

        {/* Variant manager dialog */}
        <Dialog
          open={variantManagerOpen}
          onOpenChange={handleVariantManagerClose}
        >
          <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-background px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base sm:text-lg">
                  Manage variants
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {variantManagerProduct
                    ? `For “${variantManagerProduct.name}” · ${
                        variantManagerProduct.brand?.name || "No brand"
                      }`
                    : "Select a product to manage its variants."}
                </DialogDescription>
              </div>
              <Button size="sm" onClick={openVariantCreate} disabled={!variantManagerProduct}>
                Add variant
              </Button>
            </div>

            <div className="mt-4">
              {variantLoading ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Loading variants...
                </p>
              ) : variantList.length === 0 ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  No variants yet. Click &quot;Add variant&quot; to create one.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                        <th className="py-2 pl-3 pr-4">Label</th>
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
                      {variantList.map((v) => (
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
                          <td className="py-2 pr-4">{v.sku || "-"}</td>
                          <td className="py-2 pr-4">{v.barcode || "-"}</td>
                          <td className="py-2 pr-4">{v.costPrice}</td>
                          <td className="py-2 pr-4">{v.sellPrice}</td>
                          <td className="py-2 pr-4">{v.openingStock ?? 0}</td>
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
                                onClick={() => openVariantEdit(v)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-600"
                                onClick={() => openVariantDelete(v)}
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
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Variant create/update dialog */}
        <Dialog
          open={variantFormOpen}
          onOpenChange={(open) => {
            setVariantFormOpen(open);
            if (!open) {
              setSelectedVariant(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-background px-4 py-4 sm:px-6 sm:py-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-base sm:text-lg">
                {selectedVariant ? "Edit variant" : "Create new variant"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {selectedVariant
                  ? "Update the variant details and save your changes."
                  : "Add a new variant for this product."}
              </DialogDescription>
            </DialogHeader>

            <VariantForm
              variant={selectedVariant}
              product={variantManagerProduct}
              onSuccess={handleVariantFormSuccess}
              onClose={() => setVariantFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Confirm variant delete dialog */}
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
                from this product.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setVariantToDelete(null)}
                disabled={variantDeleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleVariantDelete}
                disabled={variantDeleteLoading}
              >
                {variantDeleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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

            <ProductForm
              product={selectedProduct}
              onSuccess={handleFormSuccess}
              onClose={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Confirm delete dialog */}
        <Dialog
          open={Boolean(productToDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setProductToDelete(null);
            }
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Delete product?
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                This action will permanently remove{" "}
                <span className="font-semibold text-foreground">
                  {productToDelete?.name}
                </span>{" "}
                from your product list.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setProductToDelete(null)}
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
