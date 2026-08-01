import { UserRoundCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  completeExternalAccountProvisioning,
  getExternalAccountProvisioningState,
  signOutCurrentSession,
} from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";

const provisioningMessages: Readonly<Record<string, string>> = {
  "account-conflict":
    "This Google identity cannot be connected to a Support account.",
  "invalid-username":
    "Use 1 to 39 letters, numbers, or hyphens; do not begin or end with a hyphen.",
  "service-unavailable":
    "Account setup is temporarily unavailable. Please try again.",
  "username-conflict": "That username is already in use.",
};

async function completeGoogleAccountAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const result = await completeExternalAccountProvisioning({
    username: readFormString(formData, "username"),
  });
  if (result.status === "created") {
    redirect("/dashboard");
  }
  redirect(`/signup/complete?provisioning=${result.status}`);
}

async function cancelGoogleAccountAction(): Promise<never> {
  "use server";

  await signOutCurrentSession();
  redirect("/login");
}

export default async function CompleteGoogleSignupPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ provisioning?: string }>;
}>) {
  await connection();
  const state = await getExternalAccountProvisioningState();
  if (state.status === "authenticated") {
    redirect("/dashboard");
  }
  if (state.status === "unavailable") {
    redirect("/login?authentication=service-unavailable");
  }

  const query = await searchParams;
  const message =
    query.provisioning === undefined
      ? undefined
      : provisioningMessages[query.provisioning];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRoundCheck aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
          Choose your Support username
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Google verified {state.email}. Choose the public username that
          identifies your personal Support account.
        </p>

        {message === undefined ? null : (
          <p
            className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
            role="alert"
          >
            {message}
          </p>
        )}

        <form action={completeGoogleAccountAction} className="mt-7">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="google-registration-username">
                Username
              </FieldLabel>
              <Input
                autoComplete="username"
                autoFocus
                id="google-registration-username"
                maxLength={39}
                name="username"
                pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                required
              />
              <FieldDescription>
                You can use letters, numbers, and hyphens.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button className="mt-6 w-full" type="submit">
            Create Support account
          </Button>
        </form>

        <form action={cancelGoogleAccountAction} className="mt-3">
          <Button className="w-full" type="submit" variant="ghost">
            Cancel and sign out
          </Button>
        </form>
      </section>
    </main>
  );
}
