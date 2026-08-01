import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Building2, Check, MailOpen, X } from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import {
  acceptOrganizationInvitation,
  declineOrganizationInvitation,
  listPendingOrganizationInvitationsForAccount,
} from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";
import { Button } from "@support/shadcn/ui/button";
import { Separator } from "@support/shadcn/ui/separator";

const invitationStatusMessages: Readonly<Record<string, string>> = {
  accepted: "Organization invitation accepted.",
  "already-member": "You are already an active organization member.",
  declined: "Organization invitation declined.",
  "invitation-expired": "That invitation has expired.",
  "invitation-not-for-actor": "That invitation belongs to another account.",
  "invitation-not-found": "That invitation no longer exists.",
  "invitation-not-pending": "That invitation is no longer pending.",
};

async function acceptOrganizationInvitationAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await acceptOrganizationInvitation({
    actorAccountId: session.account.accountId,
    invitationId: readFormString(formData, "invitationId"),
  });

  revalidatePath("/accept-invitation");
  redirect(`/accept-invitation?invitation=${result.status}`);
}

async function declineOrganizationInvitationAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await declineOrganizationInvitation({
    actorAccountId: session.account.accountId,
    invitationId: readFormString(formData, "invitationId"),
  });

  revalidatePath("/accept-invitation");
  redirect(`/accept-invitation?invitation=${result.status}`);
}

export default async function AcceptInvitationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ invitation?: string }>;
}>) {
  const session = await requireCurrentSession();
  const query = await searchParams;
  const result = await listPendingOrganizationInvitationsForAccount({
    actorAccountId: session.account.accountId,
  });
  const invitationsWithOrganization = await Promise.all(
    result.invitations.map(async (invitation) => {
      const organization = await getOrganizationReferenceById(
        invitation.organizationId,
      );
      return {
        invitation,
        organization:
          organization.status === "found"
            ? organization.organization
            : undefined,
      };
    }),
  );
  const statusMessage =
    query.invitation === undefined
      ? undefined
      : invitationStatusMessages[query.invitation];

  return (
    <main className="flex min-h-screen items-center px-4 py-12 sm:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MailOpen aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Signed in as @{session.account.username}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Organization invitations
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Accepting activates the direct organization membership shown
              below. Pending invitations expire seven days after creation.
            </p>
          </div>
        </div>

        {statusMessage !== undefined ? (
          <p
            className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {statusMessage}
          </p>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <h2 className="font-semibold">Pending invitations</h2>
            <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {invitationsWithOrganization.length} pending
            </span>
          </div>
          <Separator />
          {invitationsWithOrganization.length === 0 ? (
            <p
              className="px-5 py-12 text-center text-sm text-muted-foreground"
              role="status"
            >
              You do not have any pending organization invitations.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {invitationsWithOrganization.map(
                ({ invitation, organization }) => (
                  <li className="px-5 py-5" key={invitation.invitationId}>
                    <div className="flex items-start gap-3">
                      <Building2
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-primary"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {organization?.displayName ??
                            invitation.organizationId}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {organization === undefined
                            ? "Organization reference unavailable"
                            : `@${organization.login}`}{" "}
                          · invited as {invitation.role}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Expires {formatDateTime(invitation.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <form action={acceptOrganizationInvitationAction}>
                        <input
                          name="invitationId"
                          type="hidden"
                          value={invitation.invitationId}
                        />
                        <Button type="submit">
                          <Check aria-hidden="true" />
                          Accept
                        </Button>
                      </form>
                      <form action={declineOrganizationInvitationAction}>
                        <input
                          name="invitationId"
                          type="hidden"
                          value={invitation.invitationId}
                        />
                        <Button type="submit" variant="outline">
                          <X aria-hidden="true" />
                          Decline
                        </Button>
                      </form>
                    </div>
                  </li>
                ),
              )}
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
