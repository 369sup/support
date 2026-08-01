import { redirect } from "next/navigation";
import { Landmark } from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { createEnterprise } from "@/modules/enterprises/enterprises/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";

const messages: Readonly<Record<string, string>> = {
  "invalid-slug":
    "Use 1–39 letters, numbers, or single hyphens; do not start or end with a hyphen.",
  "invalid-display-name": "Enter a display name of 1–100 characters.",
  "slug-conflict": "That enterprise slug is already in use.",
  "service-unavailable":
    "Enterprise creation is unavailable until the database migration is applied.",
};

async function createEnterpriseAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await createEnterprise({
    actorAccountId: session.account.accountId,
    slug: readFormString(formData, "slug"),
    displayName: readFormString(formData, "displayName"),
  });
  if (result.status === "created") {
    redirect(`/enterprises/${result.slug}?enterprise=created`);
  }
  redirect(`/enterprises/new?enterprise=${result.status}`);
}

export default async function NewEnterprisePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ enterprise?: string }>;
}>) {
  await requireCurrentSession();
  const query = await searchParams;
  const message =
    query.enterprise === undefined ? undefined : messages[query.enterprise];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-2xl">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Create an enterprise
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              You become the first enterprise owner and can then attach or
              create organizations.
            </p>
          </div>
        </div>
        {message !== undefined ? (
          <p className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}
        <form
          action={createEnterpriseAction}
          className="mt-8 rounded-xl border border-border bg-card p-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="enterprise-slug">Enterprise slug</FieldLabel>
              <Input
                id="enterprise-slug"
                name="slug"
                maxLength={39}
                pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                required
              />
              <FieldDescription>
                This becomes the stable enterprise URL segment.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="enterprise-display-name">
                Display name
              </FieldLabel>
              <Input
                id="enterprise-display-name"
                name="displayName"
                maxLength={100}
                required
              />
            </Field>
          </FieldGroup>
          <Button className="mt-6" type="submit">
            Create enterprise
          </Button>
        </form>
      </section>
    </main>
  );
}
