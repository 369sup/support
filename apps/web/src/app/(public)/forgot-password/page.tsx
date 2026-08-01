import { redirect } from "next/navigation";
import Link from "next/link";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requestSupabasePasswordReset } from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";
import { siteConfig } from "../../../../site-configuration";

async function requestPasswordResetAction(formData: FormData): Promise<never> {
  "use server";

  await requestSupabasePasswordReset({
    email: readFormString(formData, "email"),
    redirectTo: new URL(
      "/auth/callback?next=/reset-password",
      siteConfig.url,
    ).toString(),
  });
  redirect("/forgot-password?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ sent?: string }> }>) {
  const { sent } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Enter the email address associated with your account.
        </p>
        {sent === "1" ? (
          <p
            className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
            role="status"
          >
            If that address belongs to an account, a recovery link has been
            sent.
          </p>
        ) : null}
        <form action={requestPasswordResetAction} className="mt-7">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-email">
                Email address
              </FieldLabel>
              <Input
                autoComplete="email"
                id="recovery-email"
                name="email"
                required
                type="email"
              />
              <FieldDescription>
                The response is identical whether or not the account exists.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button className="mt-6 w-full" type="submit">
            Send recovery link
          </Button>
        </form>
        <Link
          className="mt-6 inline-flex text-sm text-primary underline underline-offset-4"
          href="/login"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
