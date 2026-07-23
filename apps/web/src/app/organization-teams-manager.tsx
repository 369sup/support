"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import type {
  OrganizationTeamReference,
  TeamMemberView,
  TeamVisibility,
} from "@/modules/organizations/organization-teams/browser-ui";

type TeamView = OrganizationTeamReference &
  Readonly<{
    members: readonly (TeamMemberView & { username: string })[];
  }>;

export function OrganizationTeamsManager({
  canManageAll,
  currentAccountId,
  organizationLogin,
  teams,
}: Readonly<{
  canManageAll: boolean;
  currentAccountId: string;
  organizationLogin: string;
  teams: readonly TeamView[];
}>) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] =
    useState<TeamVisibility>("visible");

  async function mutate(
    url: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body?: unknown,
  ) {
    setPending(true);
    setMessage(undefined);
    const response = await fetch(url, {
      method,
      ...(body === undefined
        ? {}
        : {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
    const payload: unknown = await response.json().catch(() => null);
    const status =
      payload !== null &&
      typeof payload === "object" &&
      "status" in payload &&
      typeof payload.status === "string"
        ? payload.status
        : "request-failed";
    setMessage(status);
    setPending(false);
    if (response.ok) {
      router.refresh();
    }
    return response.ok;
  }

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await mutate(
      `/api/organizations/${organizationLogin}/teams`,
      "POST",
      { name, slug, description: "", visibility },
    );
    if (ok) {
      setName("");
      setSlug("");
    }
  }

  return (
    <div className="grid gap-8">
      {canManageAll ? (
        <form
          className="grid gap-3 rounded-xl border p-5 sm:grid-cols-4"
          onSubmit={(event) => {
            void createTeam(event);
          }}
        >
          <label className="grid gap-1 text-sm">
            Team name
            <input
              className="h-10 rounded-md border bg-background px-3"
              disabled={pending}
              onChange={(event) => {
                setName(event.currentTarget.value);
              }}
              required
              value={name}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Slug
            <input
              className="h-10 rounded-md border bg-background px-3"
              disabled={pending}
              onChange={(event) => {
                setSlug(event.currentTarget.value);
              }}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              value={slug}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Visibility
            <select
              className="h-10 rounded-md border bg-background px-3"
              disabled={pending}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (isTeamVisibility(value)) {
                  setVisibility(value);
                }
              }}
              value={visibility}
            >
              <option value="visible">Visible</option>
              <option value="secret">Secret</option>
            </select>
          </label>
          <Button className="self-end" disabled={pending} type="submit">
            Create team
          </Button>
        </form>
      ) : null}

      {message === undefined ? null : (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}

      <ul className="grid gap-4">
        {teams.map((team) => (
          <TeamEditor
            canManageAll={canManageAll}
            currentAccountId={currentAccountId}
            disabled={pending}
            key={team.teamId}
            mutate={mutate}
            organizationLogin={organizationLogin}
            team={team}
            teams={teams}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamEditor({
  canManageAll,
  currentAccountId,
  disabled,
  mutate,
  organizationLogin,
  team,
  teams,
}: Readonly<{
  canManageAll: boolean;
  currentAccountId: string;
  disabled: boolean;
  mutate: (
    url: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body?: unknown,
  ) => Promise<boolean>;
  organizationLogin: string;
  team: TeamView;
  teams: readonly TeamView[];
}>) {
  const [memberUsername, setMemberUsername] = useState("");
  const [nextVisibility, setNextVisibility] = useState(team.visibility);
  const [parentTeamId, setParentTeamId] = useState(team.parentTeamId ?? "");
  const teamUrl = `/api/organizations/${organizationLogin}/teams/${team.slug}`;
  const canManageTeam =
    canManageAll ||
    team.members.some(
      (member) =>
        member.membership.accountId === currentAccountId &&
        member.isMaintainer,
    );
  const nextParentTeamId =
    nextVisibility === "secret" || parentTeamId === ""
      ? null
      : parentTeamId;

  return (
    <li className="rounded-xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{team.name}</h2>
          <p className="text-sm text-muted-foreground">
            @{organizationLogin}/{team.slug} · {team.visibility}
          </p>
        </div>
        {canManageAll ? (
          <Button
            disabled={disabled}
            onClick={() => {
              void mutate(teamUrl, "DELETE");
            }}
            size="sm"
            variant="outline"
          >
            Delete
          </Button>
        ) : null}
      </div>
      {canManageTeam ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            aria-label={`Visibility for ${team.name}`}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            disabled={disabled}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (isTeamVisibility(value)) {
                setNextVisibility(value);
              }
            }}
            value={nextVisibility}
          >
            <option value="visible">Visible</option>
            <option value="secret">Secret</option>
          </select>
          <select
            aria-label={`Parent for ${team.name}`}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            disabled={
              disabled || !canManageAll || nextVisibility === "secret"
            }
            onChange={(event) => {
              setParentTeamId(event.currentTarget.value);
            }}
            value={parentTeamId}
          >
            <option value="">No parent</option>
            {teams
              .filter(
                (candidate) =>
                  candidate.teamId !== team.teamId &&
                  candidate.visibility === "visible",
              )
              .map((candidate) => (
                <option key={candidate.teamId} value={candidate.teamId}>
                  {candidate.name}
                </option>
              ))}
          </select>
          <Button
            disabled={disabled}
            onClick={() => {
              void mutate(teamUrl, "PATCH", {
                visibility: nextVisibility,
                ...(canManageAll
                  ? { parentTeamId: nextParentTeamId }
                  : {}),
              });
            }}
            size="sm"
            variant="outline"
          >
            Save team
          </Button>
        </div>
      ) : null}

      {canManageTeam ? (
        <form
          className="mt-5 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate(
              `${teamUrl}/members/${encodeURIComponent(memberUsername)}`,
              "PUT",
            ).then((ok) => {
              if (ok) {
                setMemberUsername("");
              }
            });
          }}
        >
          <input
            aria-label={`Add member to ${team.name}`}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            disabled={disabled}
            onChange={(event) => {
              setMemberUsername(event.currentTarget.value);
            }}
          placeholder="username or account ID"
            required
            value={memberUsername}
          />
          <Button disabled={disabled} size="sm" type="submit">
            Add member
          </Button>
        </form>
      ) : null}

      <ul className="mt-4 divide-y">
        {team.members.map((member) => {
          const memberUrl = `${teamUrl}/members/${encodeURIComponent(member.membership.accountId)}`;
          const maintainerUrl = `${teamUrl}/maintainers/${encodeURIComponent(member.membership.accountId)}`;
          return (
            <li
              className="flex flex-wrap items-center gap-3 py-3 text-sm"
              key={member.membership.teamMembershipId}
            >
              <span className="min-w-40 flex-1 font-medium">
                @{member.username}
              </span>
              {canManageAll ? (
                <Button
                  disabled={disabled}
                  onClick={() => {
                    void mutate(
                      maintainerUrl,
                      member.isMaintainer ? "DELETE" : "PUT",
                    );
                  }}
                  size="sm"
                  variant="outline"
                >
                  {member.isMaintainer
                    ? "Revoke maintainer"
                    : "Make maintainer"}
                </Button>
              ) : null}
              {canManageTeam ? (
                <Button
                  disabled={disabled}
                  onClick={() => {
                    void mutate(memberUrl, "DELETE");
                  }}
                  size="sm"
                  variant="outline"
                >
                  Remove
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function isTeamVisibility(value: string): value is TeamVisibility {
  return value === "visible" || value === "secret";
}
