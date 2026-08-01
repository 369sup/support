"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AvailableDashboardContext } from "../../../contracts/dashboard-context";

function contextKey(context: AvailableDashboardContext) {
  return context.kind === "personal"
    ? `personal:${context.accountId}`
    : `organization:${context.organizationId}`;
}

export function DashboardContextSwitcher({
  available,
  current,
}: Readonly<{
  available: readonly AvailableDashboardContext[];
  current: AvailableDashboardContext;
}>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function select(value: string) {
    const [kind, id] = value.split(":", 2);
    if (
      id === undefined ||
      (kind !== "personal" && kind !== "organization")
    ) {
      return;
    }
    setIsPending(true);
    const response = await fetch("/api/context/selection", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      setIsPending(false);
    }
  }

  return (
    <label className="flex min-w-0 items-center gap-2 text-sm">
      <span className="sr-only">Dashboard context</span>
      <select
        aria-label="Dashboard context"
        className="h-9 max-w-44 rounded-md border border-slate-600 bg-[#0a1624] px-2 text-sm font-medium text-slate-200 outline-none hover:border-slate-500 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30 sm:max-w-56"
        disabled={isPending}
        onChange={(event) => void select(event.currentTarget.value)}
        value={contextKey(current)}
      >
        {available.map((context) => (
          <option key={contextKey(context)} value={contextKey(context)}>
            {context.kind === "personal"
              ? `@${context.login}`
              : context.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
