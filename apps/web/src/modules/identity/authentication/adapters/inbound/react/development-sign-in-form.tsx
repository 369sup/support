"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { Button } from "@support/shadcn/ui/button";

function readResponseStatus(payload: unknown) {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "status" in payload &&
    typeof payload.status === "string"
  ) {
    return payload.status;
  }
  return null;
}

function getSubmitLabel(isPending: boolean, isAddingAccount: boolean) {
  if (isPending) {
    return "Signing in...";
  }
  if (isAddingAccount) {
    return "Add account";
  }
  return "Sign in";
}

export function DevelopmentSignInForm({
  isEnabled,
  isAddingAccount,
}: Readonly<{ isEnabled: boolean; isAddingAccount: boolean }>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (!isEnabled) {
      return;
    }
    setIsPending(true);
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/development/auth/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      setError(
        readResponseStatus(payload) === "invalid-credentials"
          ? "Incorrect development username or password."
          : "The development session could not be created.",
      );
      setIsPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#0d1117] px-5 text-slate-100">
      <section className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-12">
        <Link
          aria-label="Support home"
          className="mx-auto flex size-14 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-400/10 font-mono text-2xl font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          href="/"
        >
          S
        </Link>
        <h1 className="mt-7 text-center text-3xl font-semibold tracking-[-0.035em] text-white">
          {isAddingAccount ? "Add account to Support" : "Sign in to Support"}
        </h1>

        <form
          aria-busy={isPending}
          className="mt-8 space-y-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <label className="block text-sm font-medium text-slate-200" htmlFor="username">
            Username
            <input
              autoComplete="username"
              autoFocus
              className="mt-2 h-11 w-full rounded-md border border-slate-600 bg-[#0a1624] px-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 hover:border-slate-500 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              defaultValue={isAddingAccount ? "carol_ACME" : "octocat"}
              disabled={!isEnabled}
              id="username"
              name="username"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 h-11 w-full rounded-md border border-slate-600 bg-[#0a1624] px-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 hover:border-slate-500 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              defaultValue="github"
              disabled={!isEnabled}
              id="password"
              name="password"
              required
              type="password"
            />
          </label>
          {error === undefined ? null : (
            <p
              className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button
            className="h-11 w-full bg-[#238636] font-semibold text-white hover:bg-[#2ea043] focus-visible:ring-emerald-400"
            disabled={!isEnabled || isPending}
            type="submit"
          >
            {getSubmitLabel(isPending, isAddingAccount)}
          </Button>
        </form>

        <div
          className="mt-7 flex gap-3 rounded-md border border-slate-700 bg-[#0a1624] px-3 py-3 text-xs leading-5 text-slate-400"
          role="status"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
          <p>
            {isEnabled
              ? 'Development access uses the configured local account and fixture password "github".'
              : "In-memory authentication is disabled for this deployment."}
          </p>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-xl flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/10 py-7 text-xs text-slate-500">
        <Link className="transition-colors hover:text-slate-200" href="/terms">
          Terms
        </Link>
        <Link className="transition-colors hover:text-slate-200" href="/privacy">
          Privacy
        </Link>
        <Link className="transition-colors hover:text-slate-200" href="/docs">
          Docs
        </Link>
        <Link
          className="transition-colors hover:text-slate-200"
          href="/accessibility"
        >
          Accessibility
        </Link>
      </footer>
    </main>
  );
}
