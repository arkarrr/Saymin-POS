"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Store, Warehouse, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OutletSelectionPage() {
  const router = useRouter();
  const [outlets, setOutlets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function fetchOutlets() {
      setError("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/outlets/my");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Failed to load outlets");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setOutlets(data.outlets || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch outlets error:", err);
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }

    fetchOutlets();
  }, []);

  async function handleSelectOutlet(outletId) {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/outlets/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to select outlet");
        setIsSubmitting(false);
        return;
      }

      // Outlet selected → go to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Select outlet error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  function getOutletIcon(outlet) {
    const name = (outlet.name || "").toLowerCase();

    if (name.includes("main") || name.includes("shop")) {
      return <Store size={28} />;
    }
    if (name.includes("warehouse") || name.includes("store")) {
      return <Warehouse size={28} />;
    }
    return <Building2 size={28} />;
  }

  function getAvatarClasses(outlet) {
    if (outlet.isDefault) {
      return "bg-cyan-500/20 text-cyan-400";
    }
    return "bg-slate-800 text-slate-300";
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select an outlet</CardTitle>
            <CardDescription>
              Choose which shop outlet you want to work in. You can switch
              outlets later if you have access to multiple locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-4 text-sm text-red-500">{error}</p>
            )}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading outlets…
              </p>
            ) : outlets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No outlets are assigned to your account. Please contact the
                system owner.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {outlets.map((outlet) => (
                  <button
                    key={outlet.id}
                    type="button"
                    onClick={() => handleSelectOutlet(outlet.id)}
                    disabled={isSubmitting}
                    className="text-left"
                  >
                    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                      <CardHeader className="pb-2 flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${getAvatarClasses(
                            outlet
                          )}`}
                        >
                          {getOutletIcon(outlet)}
                        </div>

                        <CardTitle className="text-base text-center">
                          {outlet.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-center">
                          {outlet.code}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 text-center">
                        {outlet.address && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {outlet.address}
                          </p>
                        )}

                        {outlet.isDefault && (
                          <p className="mt-2 inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-500">
                            Default outlet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && outlets.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Click an outlet card to continue.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => router.push("/login")}
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}