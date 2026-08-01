import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { createOrganization } from "@/modules/organizations/organizations/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";

const messages: Readonly<Record<string, string>> = {
  "invalid-login":
    "Use 1–39 letters, numbers, or single hyphens; do not start or end with a hyphen.",
  "invalid-display-name": "Enter a display name of 1–100 characters.",
  "login-conflict": "That organization login is already in use.",
  "service-unavailable":
    "Organization creation is unavailable until the database migration is applied.",
};

async function createOrganizationAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await createOrganization({
    actorAccountId: session.account.accountId,
    login: readFormString(formData, "login"),
    displayName: readFormString(formData, "displayName"),
  });
  if (result.status === "created") {
    redirect(`/orgs/${result.login}/repositories?organization=created`);
  }
  redirect(`/organizations/new?organization=${result.status}`);
}

export default async function NewOrganizationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ organization?: string }>;
}>) {
  await requireCurrentSession();
  const query = await searchParams;
  const message =
    query.organization === undefined
      ? undefined
      : messages[query.organization];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-2xl">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Create an organization
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              You become the first owner. The database protects the final owner
              from removal.
            </p>
          </div>
        </div>
        {message !== undefined ? (
          <p className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}
        <form
          action={createOrganizationAction}
          className="mt-8 rounded-xl border border-border bg-card p-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="organization-login">
                Organization login
              </FieldLabel>
              <Input
                id="organization-login"
                name="login"
                maxLength={39}
                pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                required
              />
              <FieldDescription>
                This becomes the stable organization URL segment.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="organization-display-name">
                Display name
              </FieldLabel>
              <Input
                id="organization-display-name"
                name="displayName"
                maxLength={100}
                required
              />
            </Field>
          </FieldGroup>
          <Button className="mt-6" type="submit">
            Create organization
          </Button>
        </form>
      </section>
    </main>
  );
}
