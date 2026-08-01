import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  signOutCurrentSession,
  updateSupabasePassword,
} from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";

async function updatePasswordAction(formData: FormData): Promise<never> {
  "use server";

  const password = readFormString(formData, "password");
  const confirmation = readFormString(formData, "passwordConfirmation");
  if (password !== confirmation) {
    redirect("/reset-password?status=password-mismatch");
  }
  if (
    password.length > 128 ||
    !(
      password.length >= 15 ||
      (password.length >= 8 && /[a-z]/u.test(password) && /\d/u.test(password))
    )
  ) {
    redirect("/reset-password?status=weak-password");
  }
  if (!(await updateSupabasePassword(password))) {
    redirect("/reset-password?status=invalid-session");
  }
  await signOutCurrentSession();
  redirect("/login?password=updated");
}

const statusMessages: Readonly<Record<string, string>> = {
  "invalid-session": "Open a fresh recovery link and try again.",
  "password-mismatch": "The password confirmation does not match.",
  "weak-password":
    "Use at least 15 characters, or at least 8 with a lowercase letter and a number.",
};

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  const message = status === undefined ? undefined : statusMessages[status];
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Choose a new password
        </h1>
        {message === undefined ? null : (
          <p
            className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
            role="alert"
          >
            {message}
          </p>
        )}
        <form action={updatePasswordAction} className="mt-7">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <Input
                autoComplete="new-password"
                id="new-password"
                maxLength={128}
                minLength={8}
                name="password"
                required
                type="password"
              />
              <FieldDescription>
                At least 15 characters, or 8 with a lowercase letter and number.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password-confirmation">
                Confirm password
              </FieldLabel>
              <Input
                autoComplete="new-password"
                id="new-password-confirmation"
                maxLength={128}
                minLength={8}
                name="passwordConfirmation"
                required
                type="password"
              />
            </Field>
          </FieldGroup>
          <Button className="mt-6 w-full" type="submit">
            Update password
          </Button>
        </form>
      </section>
    </main>
  );
}
