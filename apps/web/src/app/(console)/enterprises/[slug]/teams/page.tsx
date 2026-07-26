import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  addEnterpriseTeamMember,
  createEnterpriseTeam,
  deleteEnterpriseTeam,
  listEnterpriseTeamMembers,
  listEnterpriseTeams,
  removeEnterpriseTeamMember,
  updateEnterpriseTeam,
} from "@/modules/enterprises/enterprise-teams/server-api";
import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";
import { Separator } from "@support/shadcn/ui/separator";
import { Textarea } from "@support/shadcn/ui/textarea";

const teamStatusMessages: Readonly<Record<string, string>> = {
  created: "Enterprise team created.",
  deleted: "Enterprise team deleted.",
  "enterprise-not-found": "The enterprise no longer exists.",
  "invalid-name": "Enter a team name that can produce a valid slug.",
  "permission-denied": "Only an enterprise owner can change enterprise teams.",
  "team-limit-reached": "This enterprise has reached its team limit.",
  "team-not-found": "The selected enterprise team no longer exists.",
  "team-slug-conflict": "Another enterprise team already uses that slug.",
  updated: "Enterprise team updated.",
};

const memberStatusMessages: Readonly<Record<string, string>> = {
  "account-not-found": "No active account matches that username.",
  added: "Enterprise team member added.",
  "already-team-member": "That account is already a team member.",
  "enterprise-not-found": "The enterprise no longer exists.",
  "membership-not-found": "That active membership no longer exists.",
  "permission-denied": "Only an enterprise owner can change team membership.",
  removed: "Enterprise team member removed.",
  "team-member-limit-reached": "This enterprise team has reached its member limit.",
  "team-not-found": "The selected enterprise team no longer exists.",
};

async function requireEnterpriseTeamOwner(formData: FormData) {
  const session = await requireCurrentSession();
  const requestedSlug = readFormString(formData, "enterpriseSlug").trim();
  const enterprise = await getEnterpriseBySlug(requestedSlug);
  if (enterprise.status !== "found") {
    redirect("/enterprises?team=enterprise-not-found");
  }

  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (
    decision.status !== "allowed" ||
    decision.roleName !== "enterprise-owner"
  ) {
    redirect(
      `/enterprises/${enterprise.enterprise.slug}/teams?team=permission-denied`,
    );
  }

  return {
    actorAccountId: session.account.accountId,
    enterpriseSlug: enterprise.enterprise.slug,
  };
}

async function createEnterpriseTeamAction(formData: FormData): Promise<never> {
  "use server";

  const access = await requireEnterpriseTeamOwner(formData);
  const result = await createEnterpriseTeam({
    ...access,
    name: readFormString(formData, "name"),
    description: readFormString(formData, "description"),
  });

  revalidatePath(`/enterprises/${access.enterpriseSlug}/teams`);
  redirect(
    `/enterprises/${access.enterpriseSlug}/teams?team=${result.status}`,
  );
}

async function updateEnterpriseTeamAction(formData: FormData): Promise<never> {
  "use server";

  const access = await requireEnterpriseTeamOwner(formData);
  const result = await updateEnterpriseTeam({
    ...access,
    teamId: readFormString(formData, "teamId"),
    name: readFormString(formData, "name"),
    description: readFormString(formData, "description"),
  });

  revalidatePath(`/enterprises/${access.enterpriseSlug}/teams`);
  redirect(
    `/enterprises/${access.enterpriseSlug}/teams?team=${result.status}`,
  );
}

async function deleteEnterpriseTeamAction(formData: FormData): Promise<never> {
  "use server";

  const access = await requireEnterpriseTeamOwner(formData);
  const result = await deleteEnterpriseTeam({
    ...access,
    teamId: readFormString(formData, "teamId"),
  });

  revalidatePath(`/enterprises/${access.enterpriseSlug}/teams`);
  redirect(
    `/enterprises/${access.enterpriseSlug}/teams?team=${result.status}`,
  );
}

async function addEnterpriseTeamMemberAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireEnterpriseTeamOwner(formData);
  const result = await addEnterpriseTeamMember({
    ...access,
    teamId: readFormString(formData, "teamId"),
    username: readFormString(formData, "username"),
  });

  revalidatePath(`/enterprises/${access.enterpriseSlug}/teams`);
  redirect(
    `/enterprises/${access.enterpriseSlug}/teams?member=${result.status}`,
  );
}

async function removeEnterpriseTeamMemberAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireEnterpriseTeamOwner(formData);
  const result = await removeEnterpriseTeamMember({
    ...access,
    teamId: readFormString(formData, "teamId"),
    accountId: readFormString(formData, "accountId"),
  });

  revalidatePath(`/enterprises/${access.enterpriseSlug}/teams`);
  redirect(
    `/enterprises/${access.enterpriseSlug}/teams?member=${result.status}`,
  );
}

export default async function EnterpriseTeamsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ member?: string; team?: string }>;
}>) {
  const session = await requireCurrentSession();
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const enterprise = await getEnterpriseBySlug(routeParams.slug);
  if (enterprise.status !== "found") {
    notFound();
  }

  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (decision.status !== "allowed") {
    return <AccessDenied />;
  }

  const enterpriseTeams = await listEnterpriseTeams({
    actorAccountId: session.account.accountId,
    enterpriseSlug: enterprise.enterprise.slug,
  });
  const teams = enterpriseTeams.status === "found" ? enterpriseTeams.teams : [];
  const teamsWithMembers = await Promise.all(
    teams.map(async (team) => {
      const members = await listEnterpriseTeamMembers({
        actorAccountId: session.account.accountId,
        enterpriseSlug: enterprise.enterprise.slug,
        teamId: team.teamId,
      });
      return {
        team,
        members: members.status === "found" ? members.members : [],
      };
    }),
  );
  const canManage = decision.roleName === "enterprise-owner";
  const teamMessage =
    query.team === undefined ? undefined : teamStatusMessages[query.team];
  const memberMessage =
    query.member === undefined ? undefined : memberStatusMessages[query.member];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Enterprise administration
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Enterprise teams
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              Coordinate members across {enterprise.enterprise.displayName}.
              Enterprise teams are flat: they do not have child teams,
              visibility modes, or maintainers.
            </p>
          </div>
          <p className="w-fit rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
            {decision.roleName}
          </p>
        </div>

        <p className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Development data is process-local and resets when the server restarts.
          Organization assignment is not active yet because it must update
          organization membership and base repository permission together.
        </p>

        {teamMessage !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {teamMessage}
          </p>
        ) : null}
        {memberMessage !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {memberMessage}
          </p>
        ) : null}

        {canManage ? (
          <section className="mt-9 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Create a team</h2>
                <p className="text-sm text-muted-foreground">
                  The team slug is generated from its name.
                </p>
              </div>
            </div>
            <form action={createEnterpriseTeamAction} className="mt-6">
              <input
                name="enterpriseSlug"
                type="hidden"
                value={enterprise.enterprise.slug}
              />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-team-name">Team name</FieldLabel>
                  <Input
                    id="new-team-name"
                    maxLength={100}
                    name="name"
                    placeholder="Platform operations"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-team-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="new-team-description"
                    maxLength={280}
                    name="description"
                    placeholder="What this enterprise team coordinates"
                  />
                  <FieldDescription>Up to 280 characters.</FieldDescription>
                </Field>
                <Button className="w-fit" type="submit">
                  <Plus aria-hidden="true" />
                  Create team
                </Button>
              </FieldGroup>
            </form>
          </section>
        ) : (
          <p className="mt-9 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Enterprise administrators can inspect teams. Only enterprise owners
            can create teams or change membership.
          </p>
        )}

        <div className="mt-9 grid gap-6">
          {teamsWithMembers.length === 0 ? (
            <p
              className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground"
              role="status"
            >
              No active enterprise teams.
            </p>
          ) : (
            teamsWithMembers.map(({ team, members }) => (
              <article
                className="rounded-xl border border-border bg-card p-6"
                key={team.teamId}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <UsersRound
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                      <h2 className="text-xl font-semibold">{team.name}</h2>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      @/ent:{team.slug}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {team.description.length === 0
                        ? "No team description."
                        : team.description}
                    </p>
                  </div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </p>
                </div>

                {canManage ? (
                  <>
                    <Separator className="my-6" />
                    <form action={updateEnterpriseTeamAction}>
                      <input
                        name="enterpriseSlug"
                        type="hidden"
                        value={enterprise.enterprise.slug}
                      />
                      <input name="teamId" type="hidden" value={team.teamId} />
                      <FieldGroup>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor={`${team.teamId}-name`}>
                              Team name
                            </FieldLabel>
                            <Input
                              defaultValue={team.name}
                              id={`${team.teamId}-name`}
                              maxLength={100}
                              name="name"
                              required
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`${team.teamId}-description`}>
                              Description
                            </FieldLabel>
                            <Input
                              defaultValue={team.description}
                              id={`${team.teamId}-description`}
                              maxLength={280}
                              name="description"
                            />
                          </Field>
                        </div>
                        <Button className="w-fit" type="submit" variant="outline">
                          Update team
                        </Button>
                      </FieldGroup>
                    </form>
                  </>
                ) : null}

                <Separator className="my-6" />
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Members</h3>
                  <span className="text-xs text-muted-foreground">
                    Personal and managed accounts
                  </span>
                </div>

                {members.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No active members.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                    {members.map(({ account }) => (
                      <li
                        className="flex items-center justify-between gap-4 px-4 py-3"
                        key={account.accountId}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {account.displayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{account.username} · {account.accountType}
                          </p>
                        </div>
                        {canManage ? (
                          <form action={removeEnterpriseTeamMemberAction}>
                            <input
                              name="enterpriseSlug"
                              type="hidden"
                              value={enterprise.enterprise.slug}
                            />
                            <input
                              name="teamId"
                              type="hidden"
                              value={team.teamId}
                            />
                            <input
                              name="accountId"
                              type="hidden"
                              value={account.accountId}
                            />
                            <Button
                              aria-label={`Remove ${account.username} from ${team.name}`}
                              size="sm"
                              type="submit"
                              variant="destructive"
                            >
                              <UserMinus aria-hidden="true" />
                              Remove
                            </Button>
                          </form>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}

                {canManage ? (
                  <>
                    <form
                      action={addEnterpriseTeamMemberAction}
                      className="mt-5 flex flex-col gap-3 sm:flex-row"
                    >
                      <input
                        name="enterpriseSlug"
                        type="hidden"
                        value={enterprise.enterprise.slug}
                      />
                      <input name="teamId" type="hidden" value={team.teamId} />
                      <Field className="flex-1">
                        <FieldLabel
                          className="sr-only"
                          htmlFor={`${team.teamId}-username`}
                        >
                          Account username
                        </FieldLabel>
                        <Input
                          autoComplete="off"
                          id={`${team.teamId}-username`}
                          name="username"
                          placeholder="Account username"
                          required
                        />
                      </Field>
                      <Button type="submit" variant="secondary">
                        <UserPlus aria-hidden="true" />
                        Add member
                      </Button>
                    </form>

                    <Separator className="my-6" />
                    <form action={deleteEnterpriseTeamAction}>
                      <input
                        name="enterpriseSlug"
                        type="hidden"
                        value={enterprise.enterprise.slug}
                      />
                      <input name="teamId" type="hidden" value={team.teamId} />
                      <Button type="submit" variant="destructive">
                        <Trash2 aria-hidden="true" />
                        Delete team
                      </Button>
                    </form>
                  </>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Enterprise administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
          Access denied
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Enterprise affiliation alone does not grant administration access.
        </p>
      </section>
    </main>
  );
}
