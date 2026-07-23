"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import type { OrganizationTeamReference } from "@/modules/organizations/organization-teams/browser-ui";
import {
  repositoryPermissionOptions,
  type RepositoryPermission,
} from "../../../contracts/effective-repository-permission-decision";

export function RepositoryTeamAccessManager({
  canManageAll,
  organizationLogin,
  repositoryName,
  teams,
}: Readonly<{
  canManageAll: boolean;
  organizationLogin: string;
  repositoryName: string;
  teams: readonly OrganizationTeamReference[];
}>) {
  const router = useRouter();
  const [teamSlug, setTeamSlug] = useState(teams[0]?.slug ?? "");
  const [permission, setPermission] =
    useState<RepositoryPermission>("read");
  const [action, setAction] = useState<"grant" | "change" | "revoke">(
    canManageAll ? "grant" : "revoke",
  );
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setIsPending(true);
    const response = await fetch(
      `/api/organizations/${organizationLogin}/repositories/${repositoryName}/teams/${teamSlug}`,
      {
        method: methodForAction(action),
        ...(action === "revoke"
          ? {}
          : {
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ permission }),
            }),
      },
    );
    const payload: unknown = await response.json().catch(() => null);
    setMessage(
      payload !== null &&
        typeof payload === "object" &&
        "status" in payload &&
        typeof payload.status === "string"
        ? payload.status
        : "request-failed",
    );
    setIsPending(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <form
      className="grid gap-3 rounded-xl border p-5 sm:grid-cols-4"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <label className="grid gap-1 text-sm">
        Team
        <select
          className="h-10 rounded-md border bg-background px-2"
          disabled={isPending || teams.length === 0}
          onChange={(event) => {
            setTeamSlug(event.currentTarget.value);
          }}
          value={teamSlug}
        >
          {teams.map((team) => (
            <option key={team.teamId} value={team.slug}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Action
        <select
          className="h-10 rounded-md border bg-background px-2"
          disabled={isPending}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (isRepositoryAccessAction(value)) {
              setAction(value);
            }
          }}
          value={action}
        >
          {canManageAll ? <option value="grant">Grant</option> : null}
          {canManageAll ? <option value="change">Change</option> : null}
          <option value="revoke">Revoke</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Permission
        <select
          className="h-10 rounded-md border bg-background px-2"
          disabled={isPending || action === "revoke"}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (isRepositoryPermission(value)) {
              setPermission(value);
            }
          }}
          value={permission}
        >
          {repositoryPermissionOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <Button
        className="self-end"
        disabled={isPending || teams.length === 0}
        type="submit"
      >
        Apply access
      </Button>
      {message === undefined ? null : (
        <p className="text-sm text-muted-foreground sm:col-span-4" role="status">
          {message}
        </p>
      )}
    </form>
  );
}

function methodForAction(action: "grant" | "change" | "revoke") {
  if (action === "grant") {
    return "PUT";
  }
  return action === "change" ? "PATCH" : "DELETE";
}

function isRepositoryAccessAction(
  value: string,
): value is "grant" | "change" | "revoke" {
  return value === "grant" || value === "change" || value === "revoke";
}

function isRepositoryPermission(
  value: string,
): value is RepositoryPermission {
  return repositoryPermissionOptions.some((permission) => permission === value);
}
