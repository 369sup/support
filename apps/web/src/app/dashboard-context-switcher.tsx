"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AvailableDashboardContext,
} from "@/modules/projections/dashboard/browser-ui";

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
  const [pending, setPending] = useState(false);

  async function select(value: string) {
    const [kind, id] = value.split(":", 2);
    if (
      id === undefined ||
      (kind !== "personal" && kind !== "organization")
    ) {
      return;
    }
    setPending(true);
    const response = await fetch("/api/context/selection", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      setPending(false);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Dashboard context</span>
      <select
        aria-label="Dashboard context"
        className="h-9 max-w-48 rounded-md border bg-background px-2 font-medium"
        disabled={pending}
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
