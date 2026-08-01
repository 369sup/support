"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex flex-1 items-center px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary">
          Development access
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
          {isAddingAccount ? "Add account" : "Sign in"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          A server Route Handler creates an opaque, HttpOnly browser session.
          No credential or session token is stored in localStorage.
        </p>
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <label className="block text-sm font-medium" htmlFor="username">
            Username
            <input
              autoComplete="username"
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={isAddingAccount ? "carol_ACME" : "octocat"}
              disabled={!isEnabled}
              id="username"
              name="username"
              required
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="github"
              disabled={!isEnabled}
              id="password"
              name="password"
              required
              type="password"
            />
          </label>
          {error === undefined ? null : (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            className="w-full"
            disabled={!isEnabled || isPending}
            type="submit"
          >
            {getSubmitLabel(isPending, isAddingAccount)}
          </Button>
        </form>
        <p className="mt-6 rounded-lg bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          {isEnabled
            ? 'Development fixtures use password "github".'
            : "In-memory authentication is disabled for this deployment."}
        </p>
      </section>
    </main>
  );
}
