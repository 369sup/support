import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Clock3,
  MailPlus,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import {
  cancelOrganizationInvitation,
  changeOrganizationMemberRole,
  checkOrganizationContextEligibility,
  inviteOrganizationMember,
  listActiveOrganizationMembershipsForOrganization,
  listOrganizationInvitationsForOrganization,
  removeOrganizationMember,
  updateOrganizationInvitation,
} from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@support/shadcn/ui/select";
import { Separator } from "@support/shadcn/ui/separator";

const invitationStatusMessages: Readonly<Record<string, string>> = {
  "account-not-found":
    "No active personal account matches that username or verified email.",
  "already-member": "That account is already an organization member.",
  canceled: "Organization invitation canceled.",
  "invalid-role": "Choose member or owner as the organization role.",
  "invitation-already-pending":
    "That account already has a pending invitation.",
  "invitation-expired": "That invitation has expired.",
  "invitation-not-found": "That invitation no longer exists.",
  "invitation-not-pending": "That invitation is no longer pending.",
  invited: "Organization invitation created. It expires in seven days.",
  "managed-account-requires-scim":
    "Managed users must be provisioned through SCIM.",
  "organization-not-found": "That organization no longer exists.",
  "permission-denied":
    "Only an organization owner can manage invitations.",
  updated: "Organization invitation updated.",
};

const memberStatusMessages: Readonly<Record<string, string>> = {
  changed: "Organization member role changed.",
  "invalid-role": "Choose member or owner as the organization role.",
  "last-owner-protected":
    "The last organization owner cannot be demoted or removed.",
  "membership-managed-externally":
    "That membership is managed by an enterprise team or identity provider.",
  "membership-not-found": "That active organization membership no longer exists.",
  "organization-not-found": "That organization no longer exists.",
  "permission-denied": "Only an organization owner can change members.",
  removed: "Organization member removed.",
};

async function requireOrganizationOwner(formData: FormData) {
  const session = await requireCurrentSession();
  const requestedLogin = readFormString(formData, "organizationLogin").trim();
  const organization = await getOrganizationByLogin(requestedLogin);
  if (organization.status !== "found") {
    redirect("/dashboard?invitation=organization-not-found");
  }

  const eligibility = await checkOrganizationContextEligibility({
    accountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (
    eligibility.status !== "eligible" ||
    eligibility.membership.role !== "owner"
  ) {
    redirect(
      `/orgs/${organization.organization.login}/people?invitation=permission-denied`,
    );
  }

  return {
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
    organizationLogin: organization.organization.login,
  };
}

async function inviteOrganizationMemberAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireOrganizationOwner(formData);
  const result = await inviteOrganizationMember({
    actorAccountId: access.actorAccountId,
    organizationId: access.organizationId,
    username: readFormString(formData, "username"),
    role: readFormString(formData, "role"),
  });

  revalidatePath(`/orgs/${access.organizationLogin}/people`);
  redirect(
    `/orgs/${access.organizationLogin}/people?invitation=${result.status}`,
  );
}

async function updateOrganizationInvitationAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireOrganizationOwner(formData);
  const result = await updateOrganizationInvitation({
    actorAccountId: access.actorAccountId,
    organizationId: access.organizationId,
    invitationId: readFormString(formData, "invitationId"),
    role: readFormString(formData, "role"),
  });

  revalidatePath(`/orgs/${access.organizationLogin}/people`);
  redirect(
    `/orgs/${access.organizationLogin}/people?invitation=${result.status}`,
  );
}

async function cancelOrganizationInvitationAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireOrganizationOwner(formData);
  const result = await cancelOrganizationInvitation({
    actorAccountId: access.actorAccountId,
    organizationId: access.organizationId,
    invitationId: readFormString(formData, "invitationId"),
  });

  revalidatePath(`/orgs/${access.organizationLogin}/people`);
  redirect(
    `/orgs/${access.organizationLogin}/people?invitation=${result.status}`,
  );
}

async function changeOrganizationMemberRoleAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireOrganizationOwner(formData);
  const result = await changeOrganizationMemberRole({
    actorAccountId: access.actorAccountId,
    organizationId: access.organizationId,
    membershipId: readFormString(formData, "membershipId"),
    role: readFormString(formData, "role"),
  });

  revalidatePath(`/orgs/${access.organizationLogin}/people`);
  redirect(`/orgs/${access.organizationLogin}/people?member=${result.status}`);
}

async function removeOrganizationMemberAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const access = await requireOrganizationOwner(formData);
  const result = await removeOrganizationMember({
    actorAccountId: access.actorAccountId,
    organizationId: access.organizationId,
    membershipId: readFormString(formData, "membershipId"),
  });

  revalidatePath(`/orgs/${access.organizationLogin}/people`);
  redirect(`/orgs/${access.organizationLogin}/people?member=${result.status}`);
}

export default async function OrganizationPeoplePage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ organization: string }>;
  searchParams: Promise<{ invitation?: string; member?: string }>;
}>) {
  const session = await requireCurrentSession();
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const organization = await getOrganizationByLogin(routeParams.organization);

  if (organization.status !== "found") {
    notFound();
  }

  const eligibility = await checkOrganizationContextEligibility({
    accountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (eligibility.status !== "eligible") {
    notFound();
  }

  const canManage = eligibility.membership.role === "owner";
  const [members, invitationResult] = await Promise.all([
    listActiveOrganizationMembershipsForOrganization(
      organization.organization.organizationId,
    ),
    canManage
      ? listOrganizationInvitationsForOrganization({
          actorAccountId: session.account.accountId,
          organizationId: organization.organization.organizationId,
        })
      : Promise.resolve({ status: "permission-denied" as const }),
  ]);
  const membersWithUsername = await Promise.all(
    members.map(async (member) => {
      const account = await getAccountReferenceById(member.accountId);
      return {
        ...member,
        username:
          account.status === "found" ? account.account.username : member.accountId,
      };
    }),
  );
  const invitations =
    invitationResult.status === "found" ? invitationResult.invitations : [];
  const invitationsWithUsername = await Promise.all(
    invitations.map(async (invitation) => {
      const account = await getAccountReferenceById(invitation.accountId);
      return {
        ...invitation,
        username:
          account.status === "found"
            ? account.account.username
            : invitation.accountId,
      };
    }),
  );
  const invitationMessage =
    query.invitation === undefined
      ? undefined
      : invitationStatusMessages[query.invitation];
  const memberMessage =
    query.member === undefined ? undefined : memberStatusMessages[query.member];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Organization administration · {organization.organization.login}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Organization people
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              Invite personal accounts by username or verified email and manage direct
              organization membership. Invitations expire after seven days.
            </p>
          </div>
          <p className="w-fit rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
            {eligibility.membership.role}
          </p>
        </div>

        <p className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Managed users are supplied by SCIM. Enterprise-team and
          identity-provider memberships remain read-only here.
        </p>

        {invitationMessage !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {invitationMessage}
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
                <MailPlus aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Invite a member</h2>
                <p className="text-sm text-muted-foreground">
                  Use a personal-account username or verified email.
                </p>
              </div>
            </div>
            <form action={inviteOrganizationMemberAction} className="mt-6">
              <input
                name="organizationLogin"
                type="hidden"
                value={organization.organization.login}
              />
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
                  <Field>
                    <FieldLabel htmlFor="invitation-username">
                      Username or verified email
                    </FieldLabel>
                    <Input
                      autoComplete="off"
                      id="invitation-username"
                      name="username"
                      placeholder="octocat or octocat@example.com"
                      required
                    />
                    <FieldDescription>
                      Managed-user invitations continue through SCIM.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="invitation-role">Role</FieldLabel>
                    <Select defaultValue="member" name="role">
                      <SelectTrigger id="invitation-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button className="w-fit" type="submit">
                  <MailPlus aria-hidden="true" />
                  Send invitation
                </Button>
              </FieldGroup>
            </form>
          </section>
        ) : (
          <p className="mt-9 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Members can inspect organization membership. Only owners can send
            invitations or change direct members.
          </p>
        )}

        {canManage ? (
          <section className="mt-9 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <h2 className="font-semibold">Invitations</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pending invitations can be edited or canceled.
                </p>
              </div>
              <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {invitationsWithUsername.length} total
              </span>
            </div>
            <Separator />
            {invitationsWithUsername.length === 0 ? (
              <p
                className="px-5 py-10 text-center text-sm text-muted-foreground"
                role="status"
              >
                No organization invitations.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {invitationsWithUsername.map((invitation) => (
                  <li className="px-5 py-5" key={invitation.invitationId}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link
                          className="text-sm font-medium underline decoration-dashed underline-offset-4 hover:text-primary"
                          href={`/${invitation.username}`}
                        >
                          @{invitation.username}
                        </Link>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          Expires {formatDateTime(invitation.expiresAt)}
                        </p>
                      </div>
                      <span className="w-fit rounded-full border border-border px-2 py-1 text-xs capitalize text-muted-foreground">
                        {invitation.state} · {invitation.role}
                      </span>
                    </div>

                    {invitation.state === "pending" ? (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <form
                          action={updateOrganizationInvitationAction}
                          className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end"
                        >
                          <input
                            name="organizationLogin"
                            type="hidden"
                            value={organization.organization.login}
                          />
                          <input
                            name="invitationId"
                            type="hidden"
                            value={invitation.invitationId}
                          />
                          <Field className="max-w-48">
                            <FieldLabel
                              htmlFor={`${invitation.invitationId}-role`}
                            >
                              Invited role
                            </FieldLabel>
                            <Select
                              defaultValue={invitation.role}
                              name="role"
                            >
                              <SelectTrigger
                                id={`${invitation.invitationId}-role`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Button type="submit" variant="outline">
                            Update invitation
                          </Button>
                        </form>
                        <form action={cancelOrganizationInvitationAction}>
                          <input
                            name="organizationLogin"
                            type="hidden"
                            value={organization.organization.login}
                          />
                          <input
                            name="invitationId"
                            type="hidden"
                            value={invitation.invitationId}
                          />
                          <Button type="submit" variant="destructive">
                            <Trash2 aria-hidden="true" />
                            Cancel
                          </Button>
                        </form>
                      </div>
                    ) : null}
                    {invitation.state === "expired" ? (
                      <form
                        action={cancelOrganizationInvitationAction}
                        className="mt-4"
                      >
                        <input
                          name="organizationLogin"
                          type="hidden"
                          value={organization.organization.login}
                        />
                        <input
                          name="invitationId"
                          type="hidden"
                          value={invitation.invitationId}
                        />
                        <Button type="submit" variant="outline">
                          Clear expired invitation
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <section className="mt-9 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="font-semibold">Active members</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Externally managed membership is displayed but cannot be
                changed here.
              </p>
            </div>
            <Users aria-hidden="true" className="size-5 text-primary" />
          </div>
          <Separator />
          {membersWithUsername.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-muted-foreground"
              role="status"
            >
              No active members are visible.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {membersWithUsername.map((member) => (
                <li className="px-5 py-5" key={member.membershipId}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        className="truncate text-sm font-medium underline decoration-dashed underline-offset-4 hover:text-primary"
                        href={`/${member.username}`}
                      >
                        @{member.username}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.source === "direct"
                          ? "Direct organization membership"
                          : `Managed by ${member.source}`}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-border px-2 py-1 text-xs capitalize text-muted-foreground">
                      {member.role}
                    </span>
                  </div>

                  {canManage && member.source === "direct" ? (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <form
                        action={changeOrganizationMemberRoleAction}
                        className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end"
                      >
                        <input
                          name="organizationLogin"
                          type="hidden"
                          value={organization.organization.login}
                        />
                        <input
                          name="membershipId"
                          type="hidden"
                          value={member.membershipId}
                        />
                        <Field className="max-w-48">
                          <FieldLabel htmlFor={`${member.membershipId}-role`}>
                            Organization role
                          </FieldLabel>
                          <Select defaultValue={member.role} name="role">
                            <SelectTrigger id={`${member.membershipId}-role`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Button type="submit" variant="outline">
                          <ShieldCheck aria-hidden="true" />
                          Change role
                        </Button>
                      </form>
                      <form action={removeOrganizationMemberAction}>
                        <input
                          name="organizationLogin"
                          type="hidden"
                          value={organization.organization.login}
                        />
                        <input
                          name="membershipId"
                          type="hidden"
                          value={member.membershipId}
                        />
                        <Button type="submit" variant="destructive">
                          <UserMinus aria-hidden="true" />
                          Remove
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
