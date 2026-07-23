"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";
import { useDevelopmentApiState } from "@support/shadcn/hooks/use-development-api-state";

import {
  mockApiErrorSchema,
  mockAuthEndpoints,
  mockAuthStorageKey,
  mockCredentials,
  mockSessionResponseSchema,
} from "@/app/mock-auth-contract";

export function MockSignInForm() {
  const router = useRouter();
  const mockApiState = useDevelopmentApiState();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const enabled = mockApiState === "ready";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enabled) {
      return;
    }

    setPending(true);
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(mockAuthEndpoints.signIn, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    const payload: unknown = await response.json();

    if (!response.ok) {
      const result = mockApiErrorSchema.safeParse(payload);
      setError(result.success ? result.data.message : "Mock API returned an invalid error.");
      setPending(false);
      return;
    }

    const result = mockSessionResponseSchema.safeParse(payload);

    if (!result.success) {
      setError("Mock API returned an invalid session.");
      setPending(false);
      return;
    }

    window.localStorage.setItem(mockAuthStorageKey, result.data.session.token);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary">Development access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This form uses MSW and never authenticates against a production identity provider.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <label className="block text-sm font-medium" htmlFor="username">
            Username
            <input
              autoComplete="username"
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={mockCredentials.username}
              disabled={!enabled}
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
              defaultValue={mockCredentials.password}
              disabled={!enabled}
              id="password"
              name="password"
              required
              type="password"
            />
          </label>

          {error !== undefined ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={!enabled || pending} type="submit">
            {pending ? "Signing in..." : "Sign in with mock account"}
          </Button>
        </form>

        <p className="mt-6 rounded-lg bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          {enabled ? (
            <>
              Mock credentials: <strong>{mockCredentials.username}</strong> /{" "}
              <strong>{mockCredentials.password}</strong>
            </>
          ) : (
            "Mock authentication is disabled outside development and explicit test runs."
          )}
        </p>
      </section>
    </main>
  );
}
