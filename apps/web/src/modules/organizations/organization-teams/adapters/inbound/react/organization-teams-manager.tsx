"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  GitBranch,
  Plus,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@support/shadcn/ui/button";

import type {
  OrganizationTeamReference,
  TeamMemberView,
  TeamVisibility,
} from "../../../contracts/organization-team-reference";

type TeamView = OrganizationTeamReference &
  Readonly<{
    members: readonly (TeamMemberView & { username: string })[];
  }>;

const fieldClassName =
  "h-10 rounded-md border border-slate-600 bg-[#0d1117] px-3 text-sm text-slate-100 outline-none transition-colors hover:border-slate-500 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60";

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
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] =
    useState<TeamVisibility>("visible");

  async function mutate(
    url: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body?: unknown,
  ) {
    setIsPending(true);
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
    setIsPending(false);
    if (response.ok) {
      router.refresh();
    }
    return response.ok;
  }

  async function handleCreateTeam(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    const isSuccessful = await mutate(
      `/api/organizations/${organizationLogin}/teams`,
      "POST",
      { name, slug, description: "", visibility },
    );
    if (isSuccessful) {
      setName("");
      setSlug("");
    }
  }

  return (
    <div aria-busy={isPending} className="grid gap-6">
      {canManageAll ? (
        <section className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <Plus aria-hidden="true" className="size-4 text-emerald-400" />
            <div>
              <h2 className="font-semibold text-white">Create a new team</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Define its stable slug and organization visibility.
              </p>
            </div>
          </div>
          <form
            className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_0.7fr_auto]"
            onSubmit={(event) => {
              void handleCreateTeam(event);
            }}
          >
            <label className="grid gap-1.5 text-sm text-slate-300">
              Team name
              <input
                className={fieldClassName}
                disabled={isPending}
                onChange={(event) => {
                  setName(event.currentTarget.value);
                }}
                required
                value={name}
              />
            </label>
            <label className="grid gap-1.5 text-sm text-slate-300">
              Slug
              <input
                className={fieldClassName}
                disabled={isPending}
                onChange={(event) => {
                  setSlug(event.currentTarget.value);
                }}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
                value={slug}
              />
            </label>
            <label className="grid gap-1.5 text-sm text-slate-300">
              Visibility
              <select
                className={fieldClassName}
                disabled={isPending}
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
            <Button
              className="self-end bg-[#238636] font-semibold text-white hover:bg-[#2ea043]"
              disabled={isPending}
              type="submit"
            >
              Create team
            </Button>
          </form>
        </section>
      ) : null}

      {message === undefined ? null : (
        <p
          className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
          role="status"
        >
          {message}
        </p>
      )}

      {teams.length === 0 ? (
        <p
          className="rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-500"
          role="status"
        >
          No organization teams are available.
        </p>
      ) : (
        <ul className="grid gap-4">
          {teams.map((team) => (
            <TeamEditor
              canManageAll={canManageAll}
              currentAccountId={currentAccountId}
              isDisabled={isPending}
              key={team.teamId}
              mutate={mutate}
              organizationLogin={organizationLogin}
              team={team}
              teams={teams}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TeamEditor({
  canManageAll,
  currentAccountId,
  isDisabled,
  mutate,
  organizationLogin,
  team,
  teams,
}: Readonly<{
  canManageAll: boolean;
  currentAccountId: string;
  isDisabled: boolean;
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
  const parentTeam = teams.find(
    (candidate) => candidate.teamId === team.parentTeamId,
  );

  return (
    <li className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400">
            <UsersRound aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-white">{team.name}</h2>
              <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-400 capitalize">
                {team.visibility}
              </span>
            </div>
            <p className="mt-1 truncate font-mono text-xs text-slate-500">
              @{organizationLogin}/{team.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <UserRound aria-hidden="true" className="size-3.5" />
            {team.members.length}{" "}
            {team.members.length === 1 ? "member" : "members"}
          </span>
          {canManageAll ? (
            <Button
              className="border-red-400/30 bg-transparent text-red-200 hover:bg-red-400/10 hover:text-red-100"
              disabled={isDisabled}
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
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h3 className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Team settings
          </h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                {team.visibility === "visible" ? (
                  <Eye aria-hidden="true" className="size-4" />
                ) : (
                  <EyeOff aria-hidden="true" className="size-4" />
                )}
                Visibility
              </dt>
              <dd className="capitalize text-slate-300">{team.visibility}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-slate-500">
                <GitBranch aria-hidden="true" className="size-4" />
                Parent
              </dt>
              <dd className="text-right text-slate-300">
                {parentTeam?.name ?? "No parent"}
              </dd>
            </div>
          </dl>

          {canManageTeam ? (
            <div className="mt-5 grid gap-3">
              <select
                aria-label={`Visibility for ${team.name}`}
                className={fieldClassName}
                disabled={isDisabled}
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
                className={fieldClassName}
                disabled={
                  isDisabled || !canManageAll || nextVisibility === "secret"
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
                className="w-fit border-slate-600 bg-transparent hover:bg-white/5 hover:text-white"
                disabled={isDisabled}
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
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Members
            </h3>
            {canManageTeam ? (
              <form
                className="flex min-w-0 flex-1 justify-end gap-2 sm:flex-none"
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutate(
                    `${teamUrl}/members/${encodeURIComponent(memberUsername)}`,
                    "PUT",
                  ).then((isSuccessful) => {
                    if (isSuccessful) {
                      setMemberUsername("");
                    }
                  });
                }}
              >
                <input
                  aria-label={`Add member to ${team.name}`}
                  className={`${fieldClassName} min-w-0 flex-1 sm:w-56`}
                  disabled={isDisabled}
                  onChange={(event) => {
                    setMemberUsername(event.currentTarget.value);
                  }}
                  placeholder="username or account ID"
                  required
                  value={memberUsername}
                />
                <Button
                  className="bg-[#238636] text-white hover:bg-[#2ea043]"
                  disabled={isDisabled}
                  size="sm"
                  type="submit"
                >
                  Add member
                </Button>
              </form>
            ) : null}
          </div>

          {team.members.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              This team has no direct members.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10">
              {team.members.map((member) => {
                const memberUrl = `${teamUrl}/members/${encodeURIComponent(member.membership.accountId)}`;
                const maintainerUrl = `${teamUrl}/maintainers/${encodeURIComponent(member.membership.accountId)}`;

                return (
                  <li
                    className="flex flex-wrap items-center gap-3 px-3 py-3 text-sm"
                    key={member.membership.teamMembershipId}
                  >
                    <span className="min-w-40 flex-1 font-medium text-slate-200">
                      @{member.username}
                    </span>
                    {member.isMaintainer ? (
                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                        Maintainer
                      </span>
                    ) : null}
                    {canManageAll ? (
                      <Button
                        className="border-slate-600 bg-transparent hover:bg-white/5 hover:text-white"
                        disabled={isDisabled}
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
                        className="border-slate-600 bg-transparent hover:bg-white/5 hover:text-white"
                        disabled={isDisabled}
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
          )}
        </div>
      </div>
    </li>
  );
}

function isTeamVisibility(value: string): value is TeamVisibility {
  return value === "visible" || value === "secret";
}
