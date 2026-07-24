"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";

import { Button } from "@support/shadcn/ui/button";

import type { OrganizationTeamReference } from "@/modules/organizations/organization-teams/browser-ui";
import {
  repositoryPermissionOptions,
  type RepositoryPermission,
} from "../../../contracts/effective-repository-permission-decision";

const fieldClassName =
  "h-10 rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-[#f0f6fc] outline-none transition focus:border-[#2f81f7] focus:ring-2 focus:ring-[#2f81f7]/20 disabled:cursor-not-allowed disabled:opacity-60";

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
    <section
      aria-labelledby="direct-team-access-heading"
      className="overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] text-[#f0f6fc]"
    >
      <div className="border-b border-[#21262d] bg-[#161b22] px-4 py-4">
        <div className="flex items-center gap-2">
          <UsersRound aria-hidden="true" className="size-4 text-[#8b949e]" />
          <h2
            className="text-sm font-semibold"
            id="direct-team-access-heading"
          >
            Direct team access
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#8b949e]">
          {teams.length === 0
            ? "No organization teams are available for this repository."
            : `${teams.length} organization ${teams.length === 1 ? "team is" : "teams are"} available to manage.`}
        </p>
      </div>

      <form
        className="grid gap-4 p-4 sm:grid-cols-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <label className="grid gap-1.5 text-sm font-medium">
          Team
          <select
            className={fieldClassName}
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
        <label className="grid gap-1.5 text-sm font-medium">
          Action
          <select
            className={fieldClassName}
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
        <label className="grid gap-1.5 text-sm font-medium">
          Permission
          <select
            className={fieldClassName}
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
          className="self-end border border-[#2ea043] bg-[#238636] text-white hover:bg-[#2ea043]"
          disabled={isPending || teams.length === 0}
          type="submit"
        >
          <KeyRound aria-hidden="true" className="size-4" />
          Apply access
        </Button>
        {message === undefined ? null : (
          <p
            className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#8b949e] sm:col-span-4"
            role="status"
          >
            <ShieldCheck
              aria-hidden="true"
              className="mr-2 inline size-4 align-text-bottom"
            />
            {message}
          </p>
        )}
      </form>
    </section>
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
