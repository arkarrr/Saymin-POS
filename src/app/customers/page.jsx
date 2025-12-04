// app/customers/page.jsx
"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

import { CustomerForm } from "@/components/customers/customer-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast("Failed to load customers", {
          description: data.message || "Please try again in a moment.",
        });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Fetch customers error:", err);
      toast("Failed to load customers", {
        description: "Something went wrong while loading customers.",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  function openCreateDialog() {
    setSelectedCustomer(null);
    setDialogOpen(true);
  }

  function openEditDialog(customer) {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  }

  function handleDialogClose(open) {
    setDialogOpen(open);
    if (!open) {
      setSelectedCustomer(null);
    }
  }

  async function handleDelete(customer) {
    if (customer.id === 1) {
      toast("Cannot delete Walk-in customer", {
        description:
          "The default Walk-in Customer is reserved and cannot be removed.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast("Failed to delete customer", {
          description: data.message || "Please try again.",
        });
        return;
      }

      toast("Customer deleted", {
        description: `“${customer.name}” has been removed.`,
      });
      fetchCustomers();
    } catch (err) {
      console.error("Delete customer error:", err);
      toast("Failed to delete customer", {
        description: "Something went wrong while deleting.",
      });
    }
  }

  function handleFormSuccess() {
    const isEdit = Boolean(selectedCustomer);
    toast.success(isEdit ? "Customer updated" : "Customer created", {
      description: isEdit
        ? "The customer details have been updated."
        : "A new customer has been added.",
    });

    setDialogOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  }

  const dialogTitle = selectedCustomer
    ? "Edit customer"
    : "Create new customer";

  const dialogDescription = selectedCustomer
    ? "Update the customer details and save your changes."
    : "Add a new customer to your POS system.";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Customers
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Manage saved customers and the default walk-in mapping.
                </p>
              </div>
              <Button size="sm" onClick={openCreateDialog}>
                Add customer
              </Button>
            </div>

            {/* Customers list */}
            <section className="rounded-lg border bg-background p-3 sm:p-4">
              {loading ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Loading customers...
                </p>
              ) : customers.length === 0 ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  No customers yet. Click &quot;Add customer&quot; to create one.
                </p>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="space-y-2 md:hidden">
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-md border p-2 text-xs sm:p-3 sm:text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium">
                            {c.name}
                            {c.id === 1 && (
                              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                Walk-in
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openEditDialog(c)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-600"
                              onClick={() => handleDelete(c)}
                              disabled={c.id === 1}
                            >
                              Del
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1 space-y-0.5 text-muted-foreground">
                          <p>Phone: {c.phone || "-"}</p>
                          <p>Address: {c.address || "-"}</p>
                          <p>Remarks: {c.remarks || "-"}</p>
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
                            <th className="py-2 pr-4">Phone</th>
                            <th className="py-2 pr-4">Address</th>
                            <th className="py-2 pr-4">Remarks</th>
                            <th className="py-2 pr-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((c) => (
                            <tr
                              key={c.id}
                              className="border-b last:border-none hover:bg-muted/40"
                            >
                              <td className="py-2 pl-3 pr-4 font-medium">
                                {c.name}
                                {c.id === 1 && (
                                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    Walk-in
                                  </span>
                                )}
                              </td>
                              <td className="py-2 pr-4">{c.phone || "-"}</td>
                              <td className="py-2 pr-4">{c.address || "-"}</td>
                              <td className="py-2 pr-4">{c.remarks || "-"}</td>
                              <td className="py-2 pr-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(c)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-600"
                                    onClick={() => handleDelete(c)}
                                    disabled={c.id === 1}
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

            <CustomerForm
              customer={selectedCustomer}
              onSuccess={handleFormSuccess}
              onClose={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}