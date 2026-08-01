"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, UserRound, UsersRound } from "lucide-react";

import { Button } from "@support/shadcn/ui/button";

import type {
  OrganizationRoleAssignmentReference,
  PredefinedOrganizationRoleDefinition,
  PredefinedOrganizationRoleKey,
} from "../../../contracts/organization-role-reference";

const fieldClassName =
  "h-10 rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-[#f0f6fc] outline-none transition placeholder:text-[#6e7681] focus:border-[#2f81f7] focus:ring-2 focus:ring-[#2f81f7]/20 disabled:cursor-not-allowed disabled:opacity-60";

export function OrganizationRolesManager({
  assignments,
  canManage,
  organizationLogin,
  roles,
}: Readonly<{
  assignments: readonly OrganizationRoleAssignmentReference[];
  canManage: boolean;
  organizationLogin: string;
  roles: readonly PredefinedOrganizationRoleDefinition[];
}>) {
  const router = useRouter();
  const [roleKey, setRoleKey] =
    useState<PredefinedOrganizationRoleKey>("all-repository-read");
  const [subjectKind, setSubjectKind] = useState<"account" | "team">(
    "account",
  );
  const [subjectIdentifier, setSubjectIdentifier] = useState("");
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const assignmentsUrl = `/api/organizations/${organizationLogin}/roles/assignments`;

  async function handleAssign(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setIsPending(true);
    const response = await fetch(assignmentsUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roleKey, subjectKind, subjectIdentifier }),
    });
    const payload: unknown = await response.json().catch(() => null);
    setMessage(readStatus(payload));
    setIsPending(false);
    if (response.ok) {
      setSubjectIdentifier("");
      router.refresh();
    }
  }

  async function revoke(assignmentId: string) {
    setIsPending(true);
    const response = await fetch(`${assignmentsUrl}/${assignmentId}`, {
      method: "DELETE",
    });
    const payload: unknown = await response.json().catch(() => null);
    setMessage(readStatus(payload));
    setIsPending(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="grid gap-8 text-[#f0f6fc]">
      <section aria-labelledby="predefined-roles-heading">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-4 text-[#8b949e]" />
          <h2 className="text-base font-semibold" id="predefined-roles-heading">
            Predefined roles
          </h2>
        </div>
        <ul className="divide-y divide-[#21262d] overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
          {roles.map((role) => (
            <li
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              key={role.roleKey}
            >
              <div>
                <h3 className="text-sm font-semibold">{role.displayName}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8b949e]">
                  {role.description}
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-full border border-[#30363d] bg-[#161b22] px-2 py-0.5 text-xs font-medium text-[#8b949e]">
                {role.repositoryPermission ?? "no repository access"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {canManage ? (
        <section
          aria-labelledby="assign-role-heading"
          className="overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]"
        >
          <div className="border-b border-[#21262d] bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <KeyRound aria-hidden="true" className="size-4 text-[#8b949e]" />
              <h2 className="text-sm font-semibold" id="assign-role-heading">
                Assign an organization role
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8b949e]">
              Grant a predefined role to an account or team in this
              organization.
            </p>
          </div>
          <form
            className="grid gap-4 p-4 sm:grid-cols-4"
            onSubmit={(event) => {
              void handleAssign(event);
            }}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              Role
              <select
                className={fieldClassName}
                disabled={isPending}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isPredefinedRoleKey(value)) {
                    setRoleKey(value);
                  }
                }}
                value={roleKey}
              >
                {roles.map((role) => (
                  <option key={role.roleKey} value={role.roleKey}>
                    {role.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Subject type
              <select
                className={fieldClassName}
                disabled={isPending}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isRoleSubjectKind(value)) {
                    setSubjectKind(value);
                  }
                }}
                value={subjectKind}
              >
                <option value="account">Account</option>
                <option value="team">Team</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Account ID or team slug
              <input
                className={fieldClassName}
                disabled={isPending}
                onChange={(event) => {
                  setSubjectIdentifier(event.currentTarget.value);
                }}
                required
                value={subjectIdentifier}
              />
            </label>
            <Button
              className="self-end border border-[#2ea043] bg-[#238636] text-white hover:bg-[#2ea043]"
              disabled={isPending}
              type="submit"
            >
              Assign role
            </Button>
          </form>
        </section>
      ) : null}

      {message === undefined ? null : (
        <p
          className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#8b949e]"
          role="status"
        >
          {message}
        </p>
      )}

      <section aria-labelledby="role-assignments-heading">
        <div className="mb-3 flex items-center gap-2">
          <UsersRound aria-hidden="true" className="size-4 text-[#8b949e]" />
          <h2 className="text-base font-semibold" id="role-assignments-heading">
            Role assignments
          </h2>
        </div>
        {assignments.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#30363d] bg-[#0d1117] px-6 py-10 text-center">
            <UserRound
              aria-hidden="true"
              className="mx-auto size-6 text-[#6e7681]"
            />
            <p className="mt-3 text-sm font-medium">
              No active role assignments
            </p>
            <p className="mt-1 text-sm text-[#8b949e]">
              Assigned accounts and teams will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#21262d] overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
            {assignments.map((assignment) => (
              <li
                className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                key={assignment.assignmentId}
              >
                <span className="rounded-full border border-[#30363d] bg-[#161b22] px-2 py-0.5 text-xs font-medium">
                  {assignment.roleKey}
                </span>
                <span className="min-w-0 flex-1 text-[#8b949e]">
                  {assignment.subject.kind === "account"
                    ? `account:${assignment.subject.accountId}`
                    : `team:${assignment.subject.teamId}`}
                </span>
                {canManage ? (
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      void revoke(assignment.assignmentId);
                    }}
                    size="sm"
                    variant="outline"
                    className="border-[#30363d] bg-[#21262d] text-[#f0f6fc] hover:border-[#8b949e] hover:bg-[#30363d]"
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function readStatus(payload: unknown) {
  return payload !== null &&
    typeof payload === "object" &&
    "status" in payload &&
    typeof payload.status === "string"
    ? payload.status
    : "request-failed";
}

function isPredefinedRoleKey(
  value: string,
): value is PredefinedOrganizationRoleKey {
  return [
    "moderator",
    "security-manager",
    "ci-cd-admin",
    "app-manager",
    "all-repository-read",
    "all-repository-triage",
    "all-repository-write",
    "all-repository-maintain",
    "all-repository-admin",
  ].includes(value);
}

function isRoleSubjectKind(value: string): value is "account" | "team" {
  return value === "account" || value === "team";
}
