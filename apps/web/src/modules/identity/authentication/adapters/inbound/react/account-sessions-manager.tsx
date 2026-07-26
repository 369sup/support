"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import type { BrowserAccountSessionView } from "../../../contracts/authenticated-session-reference";

function readResponseStatus(payload: unknown): string | null {
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

function getSessionActionLabel(session: BrowserAccountSessionView) {
  if (session.status === "expired") {
    return "Cannot activate";
  }
  if (session.isCurrent) {
    return "Current session";
  }
  return "Activate";
}

function getSessionStatusTextClass(session: BrowserAccountSessionView) {
  if (session.isCurrent) {
    return "text-emerald-200";
  }
  if (session.status === "expired") {
    return "text-amber-200";
  }
  return "text-slate-400";
}

export function AccountSessionManager({
  sessions,
}: Readonly<{
  sessions: readonly BrowserAccountSessionView[];
}>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  async function activate(sessionId: string) {
    setPendingSessionId(sessionId);
    setMessage(null);
    const response = await fetch(
      `/api/auth/account-sessions/${sessionId}/activate`,
      { method: "POST" },
    );
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(
        readResponseStatus(payload) === "reauthentication-required"
          ? "Reauthentication is required before switching to this managed account."
          : "This session cannot be activated right now.",
      );
      setPendingSessionId(null);
      return;
    }
    setMessage("Switched to selected account session.");
    setPendingSessionId(null);
    router.refresh();
  }

  async function remove(sessionId: string) {
    setPendingSessionId(sessionId);
    setMessage(null);
    const response = await fetch(`/api/auth/account-sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setMessage("Could not remove the selected session.");
      setPendingSessionId(null);
      return;
    }
    setMessage("Session removed.");
    setPendingSessionId(null);
    router.refresh();
  }

  async function signOutAll() {
    setPendingSessionId("all");
    setMessage(null);
    const response = await fetch("/api/auth/account-sessions", {
      method: "DELETE",
    });
    if (!response.ok) {
      setMessage("Could not sign out all sessions.");
      setPendingSessionId(null);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  const isPending = pendingSessionId !== null;
  const hasSessions = sessions.length > 0;

  return (
    <section className="mt-8 space-y-5">
      <div className="rounded-xl border border-white/15 bg-[#0a1624] p-4">
        <h2 className="text-lg font-semibold text-white">Session list</h2>
        <p className="mt-2 text-sm text-slate-400">
          Manage browser sessions used to access this account workspace.
        </p>

        {hasSessions ? (
          <ul className="mt-4 divide-y divide-white/10">
            {sessions.map((session) => {
              const isSwitchDisabled =
                session.isCurrent ||
                session.status !== "active" ||
                isPending;

              return (
                <li
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={session.sessionId}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      @{session.account.username}
                    </p>
                    <p
                      className={`text-xs ${getSessionStatusTextClass(session)}`}
                      aria-label={`Status for ${session.account.username}`}
                    >
                      {getSessionStatusLabel(session)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Expires: {session.expiresAt ?? "unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSwitchDisabled}
                      onClick={() => {
                        void activate(session.sessionId);
                      }}
                      type="button"
                    >
                      {getSessionActionLabel(session)}
                    </button>
                    {session.isCurrent ? null : (
                      <Button
                        aria-label={`Remove ${session.account.username} session`}
                        disabled={isPending}
                        onClick={() => {
                          void remove(session.sessionId);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500" role="status">
            No browser sessions are currently available.
          </p>
        )}
      </div>

      {message === null ? null : (
        <p
          className="rounded-md border border-slate-700/80 bg-slate-800/80 p-3 text-sm text-slate-100"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-[#0a1624] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-300">
          You can add another account at any time to access multiple
          workspaces.
        </div>
        <div className="flex gap-2 sm:flex-row">
          <Link
            className="inline-flex items-center rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400 hover:text-emerald-200"
            href="/login?add=1"
          >
            Add account
          </Link>
          <Button
            disabled={isPending}
            onClick={() => {
              void signOutAll();
            }}
            size="sm"
            variant="outline"
          >
            Sign out all sessions
          </Button>
        </div>
      </div>
    </section>
  );
}
