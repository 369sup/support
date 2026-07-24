"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import type { BrowserAccountSessionView } from "../../../contracts/authenticated-session-reference";

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

function getSessionStatusLabel(session: BrowserAccountSessionView) {
  if (session.isCurrent) {
    return "Current account";
  }
  if (session.status === "expired") {
    return "Reauthentication required";
  }
  return session.account.accountType;
}

export function AccountMenu({
  currentUsername,
  enterpriseHref,
  sessions,
}: Readonly<{
  currentUsername: string;
  enterpriseHref: string | null;
  sessions: readonly BrowserAccountSessionView[];
}>) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pendingSessionId, setPendingSessionId] = useState<string>();

  async function activate(sessionId: string) {
    setPendingSessionId(sessionId);
    setMessage(undefined);
    const response = await fetch(
      `/api/auth/account-sessions/${sessionId}/activate`,
      { method: "POST" },
    );
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(
        readResponseStatus(payload) === "reauthentication-required"
          ? "Reauthentication is required before switching to this managed account."
          : "The account session could not be activated.",
      );
      setPendingSessionId(undefined);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function remove(sessionId: string) {
    setPendingSessionId(sessionId);
    await fetch(`/api/auth/account-sessions/${sessionId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function signOutAll() {
    setPendingSessionId("all");
    await fetch("/api/auth/account-sessions", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <details className="relative shrink-0">
      <summary
        aria-label={`Account menu for @${currentUsername}`}
        className="cursor-pointer list-none rounded-md border px-3 py-2 text-sm font-medium"
      >
        @{currentUsername}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Account sessions
        </p>
        <ul className="space-y-1">
          {sessions.map((session) => (
            <li
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted"
              key={session.sessionId}
            >
              <button
                className="min-w-0 flex-1 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  session.isCurrent ||
                  session.status !== "active" ||
                  pendingSessionId !== undefined
                }
                onClick={() => void activate(session.sessionId)}
                type="button"
              >
                <span className="block truncate font-medium">
                  @{session.account.username}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {getSessionStatusLabel(session)}
                </span>
              </button>
              {!session.isCurrent ? (
                <button
                  aria-label={`Remove ${session.account.username} session`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  disabled={pendingSessionId !== undefined}
                  onClick={() => void remove(session.sessionId)}
                  type="button"
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {message === undefined ? null : (
          <p className="mt-2 rounded-md bg-muted p-2 text-xs" role="alert">
            {message}
          </p>
        )}
        <div className="mt-3 grid gap-2 border-t pt-3">
          <Link className="text-sm font-medium" href="/login?add=1">
            Add account
          </Link>
          <Link className="text-sm font-medium" href="/account">
            Account settings
          </Link>
          {enterpriseHref === null ? null : (
            <Link className="text-sm font-medium" href={enterpriseHref}>
              Enterprise administration
            </Link>
          )}
          <Button
            disabled={pendingSessionId !== undefined}
            onClick={() => void signOutAll()}
            size="sm"
            variant="outline"
          >
            Sign out all
          </Button>
        </div>
      </div>
    </details>
  );
}
