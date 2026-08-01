"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@support/shadcn/ui/button";

export function AccountMenu({
  currentUsername,
  enterpriseHref,
}: Readonly<{
  currentUsername: string;
  enterpriseHref: Route | null;
}>) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);
    setMessage(undefined);
    const response = await fetch("/api/auth/sessions", { method: "DELETE" });
    if (!response.ok) {
      setMessage("The current Supabase session could not be signed out.");
      setIsPending(false);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <details className="relative shrink-0">
      <summary
        aria-label={`Account menu for @${currentUsername}`}
        className="cursor-pointer list-none rounded-md border border-slate-600 bg-[#0a1624] px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        @{currentUsername}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-700 bg-[#0a1624] p-3 text-slate-100 shadow-2xl shadow-black/40">
        <p className="px-2 pb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
          Signed in with Supabase
        </p>
        <p className="truncate px-2 pb-3 text-sm font-medium">
          @{currentUsername}
        </p>
        {message === undefined ? null : (
          <p
            className="mb-2 rounded-md border border-red-400/30 bg-red-400/10 p-2 text-xs text-red-200"
            role="alert"
          >
            {message}
          </p>
        )}
        <div className="grid gap-2 border-t border-slate-700 pt-3">
          <Link
            className="text-sm font-medium text-slate-300 hover:text-white"
            href="/account"
          >
            Account settings
          </Link>
          <Link
            className="text-sm font-medium text-slate-300 hover:text-white"
            href="/settings/sessions"
          >
            Authentication security
          </Link>
          {enterpriseHref === null ? null : (
            <Link
              className="text-sm font-medium text-slate-300 hover:text-white"
              href={enterpriseHref}
            >
              Enterprise administration
            </Link>
          )}
          <Button
            disabled={isPending}
            onClick={() => void signOut()}
            size="sm"
            variant="outline"
            className="border-slate-600 bg-transparent hover:bg-white/5 hover:text-white"
          >
            {isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </details>
  );
}
