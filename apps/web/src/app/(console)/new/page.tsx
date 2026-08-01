import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { listActiveOrganizationMembershipsForAccount } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";
import { createEmptyRepository } from "@/modules/repositories/repositories/server-api";
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
import { Textarea } from "@support/shadcn/ui/textarea";

const createStatusMessages: Readonly<Record<string, string>> = {
  "internal-visibility-not-available":
    "Internal visibility requires verified enterprise entitlement and is not available in this slice.",
  "invalid-description": "Descriptions can contain at most 350 characters.",
  "invalid-name":
    "Use 1–100 ASCII letters, numbers, periods, hyphens, or underscores.",
  "invalid-visibility": "Choose public or private visibility.",
  "permission-denied": "You are not allowed to create a repository for that owner.",
  "repository-name-conflict": "That owner already has a repository with this name.",
};

async function createRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await createEmptyRepository({
    actorAccountId: session.account.accountId,
    ownerId: readFormString(formData, "ownerId"),
    name: readFormString(formData, "name"),
    description: readFormString(formData, "description"),
    visibility: readFormString(formData, "visibility"),
  });
  if (result.status === "created") {
    redirect(
      `/${result.repository.owner.username}/${result.repository.name}/settings?repository=created`,
    );
  }
  redirect(`/new?repository=${result.status}`);
}

export default async function NewRepositoryPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ repository?: string }>;
}>) {
  const session = await requireCurrentSession();
  const [memberships, query] = await Promise.all([
    listActiveOrganizationMembershipsForAccount(
      session.account.accountId,
    ),
    searchParams,
  ]);
  const organizationOwners = (
    await Promise.all(
      memberships
        .filter((membership) => membership.role === "owner")
        .map((membership) =>
          getOrganizationReferenceById(membership.organizationId),
        ),
    )
  ).flatMap((result) =>
    result.status === "found" ? [result.organization] : [],
  );
  const personalOwner =
    session.account.accountType === "personal"
      ? [
          {
            id: session.account.accountId,
            label: `${session.account.username} (personal)`,
          },
        ]
      : [];
  const owners = [
    ...personalOwner,
    ...organizationOwners.map((organization) => ({
      id: organization.organizationId,
      label: `${organization.login} (organization)`,
    })),
  ];
  const message =
    query.repository === undefined
      ? undefined
      : createStatusMessages[query.repository];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-3xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Repository administration
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Create a new repository
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Creates an empty repository identity only. This flow does not
              initialize Git, branches, commits, files, templates, or code.
            </p>
          </div>
        </div>

        {message !== undefined ? (
          <p
            className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {message}
          </p>
        ) : null}

        <form
          action={createRepositoryAction}
          className="mt-8 rounded-xl border border-border bg-card p-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="repository-owner">Owner</FieldLabel>
              <Select name="ownerId" required>
                <SelectTrigger id="repository-owner" className="w-full">
                  <SelectValue placeholder="Choose an owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Organization repositories require an active owner membership.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="repository-name">Repository name</FieldLabel>
              <Input
                id="repository-name"
                name="name"
                maxLength={100}
                pattern="[A-Za-z0-9._-]+"
                required
              />
              <FieldDescription>
                1–100 letters, numbers, periods, hyphens, or underscores.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="repository-description">
                Description
              </FieldLabel>
              <Textarea
                id="repository-description"
                name="description"
                maxLength={350}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="repository-visibility">
                Visibility
              </FieldLabel>
              <Select defaultValue="private" name="visibility" required>
                <SelectTrigger id="repository-visibility" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Internal visibility remains gated until enterprise entitlement
                can be verified.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button className="mt-6" disabled={owners.length === 0} type="submit">
            Create empty repository
          </Button>
        </form>
      </section>
    </main>
  );
}
