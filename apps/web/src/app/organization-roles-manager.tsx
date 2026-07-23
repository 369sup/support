"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import type {
  OrganizationRoleAssignmentReference,
  PredefinedOrganizationRoleDefinition,
  PredefinedOrganizationRoleKey,
} from "@/modules/organizations/organization-roles/browser-ui";

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
  const [pending, setPending] = useState(false);
  const assignmentsUrl = `/api/organizations/${organizationLogin}/roles/assignments`;

  async function assign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const response = await fetch(assignmentsUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roleKey, subjectKind, subjectIdentifier }),
    });
    const payload: unknown = await response.json().catch(() => null);
    setMessage(readStatus(payload));
    setPending(false);
    if (response.ok) {
      setSubjectIdentifier("");
      router.refresh();
    }
  }

  async function revoke(assignmentId: string) {
    setPending(true);
    const response = await fetch(`${assignmentsUrl}/${assignmentId}`, {
      method: "DELETE",
    });
    const payload: unknown = await response.json().catch(() => null);
    setMessage(readStatus(payload));
    setPending(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="text-lg font-semibold">Predefined roles</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <li className="rounded-xl border p-4" key={role.roleKey}>
              <h3 className="font-medium">{role.displayName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {role.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Repository permission: {role.repositoryPermission ?? "none"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {canManage ? (
        <form
          className="grid gap-3 rounded-xl border p-5 sm:grid-cols-4"
          onSubmit={(event) => {
            void assign(event);
          }}
        >
          <label className="grid gap-1 text-sm">
            Role
            <select
              className="h-10 rounded-md border bg-background px-2"
              disabled={pending}
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
          <label className="grid gap-1 text-sm">
            Subject type
            <select
              className="h-10 rounded-md border bg-background px-2"
              disabled={pending}
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
          <label className="grid gap-1 text-sm">
            Account ID or team slug
            <input
              className="h-10 rounded-md border bg-background px-3"
              disabled={pending}
              onChange={(event) => {
                setSubjectIdentifier(event.currentTarget.value);
              }}
              required
              value={subjectIdentifier}
            />
          </label>
          <Button className="self-end" disabled={pending} type="submit">
            Assign role
          </Button>
        </form>
      ) : null}

      {message === undefined ? null : (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold">Role assignments</h2>
        {assignments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No active role assignments.
          </p>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border">
            {assignments.map((assignment) => (
              <li
                className="flex flex-wrap items-center gap-3 p-4 text-sm"
                key={assignment.assignmentId}
              >
                <span className="font-medium">{assignment.roleKey}</span>
                <span className="min-w-0 flex-1 text-muted-foreground">
                  {assignment.subject.kind === "account"
                    ? `account:${assignment.subject.accountId}`
                    : `team:${assignment.subject.teamId}`}
                </span>
                {canManage ? (
                  <Button
                    disabled={pending}
                    onClick={() => {
                      void revoke(assignment.assignmentId);
                    }}
                    size="sm"
                    variant="outline"
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
