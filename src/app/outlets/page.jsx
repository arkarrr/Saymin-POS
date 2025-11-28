"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OutletSelectionPage() {
  const router = useRouter();
  const [outlets, setOutlets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function fetchOutlets() {
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
        console.error(err);
        setError("Something went wrong");
        setIsLoading(false);
      }
    }

    fetchOutlets();
  }, []);

  async function handleSelectOutlet(outletId) {
    try {
      const res = await fetch("/api/outlets/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to select outlet");
        return;
      }

      // Outlet selected → go to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        Loading outlets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold mb-2 text-center">
          Select an outlet
        </h1>
        <p className="text-slate-400 mb-6 text-center">
          Choose which shop you want to manage.
        </p>

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => handleSelectOutlet(outlet.id)}
              className="text-left"
            >
              <Card className="h-full bg-slate-900 border-slate-800 hover:border-cyan-500 hover:-translate-y-1 transition-all duration-150 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {outlet.name}
                  </CardTitle>
                  <CardDescription>
                    {outlet.code}
                    {outlet.address ? ` · ${outlet.address}` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))}

          {outlets.length === 0 && (
            <p className="text-center text-slate-500 col-span-full">
              No outlets assigned to your account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}