import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import Link from "next/link";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { getAccountCandidateByUsername } from "@/modules/identity/accounts/server-api";
import {
  isSupabaseAuthenticationEnabled,
  signUpWithPassword,
} from "@/modules/identity/authentication/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";
import { siteConfig } from "../../../../site-configuration";

const registrationMessages: Readonly<Record<string, string>> = {
  "confirmation-required":
    "Check your email to confirm your account before signing in.",
  "invalid-email": "Enter a valid email address.",
  "invalid-registration":
    "The account could not be created with those details.",
  "invalid-username":
    "Use 1–39 letters, numbers, or single hyphens; do not begin or end with a hyphen.",
  "password-mismatch": "The password confirmation does not match.",
  "registration-failed":
    "The account could not be created. Please try again.",
  "service-unavailable":
    "Account registration is temporarily unavailable.",
  "username-conflict": "That username is already in use.",
  "weak-password":
    "Use at least 15 characters, or at least 8 with a lowercase letter and a number.",
};

async function registerPersonalAccountAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const email = readFormString(formData, "email").trim();
  const username = readFormString(formData, "username").trim();
  const password = readFormString(formData, "password");
  if (password !== readFormString(formData, "passwordConfirmation")) {
    redirect("/signup?registration=password-mismatch");
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email)) {
    redirect("/signup?registration=invalid-email");
  }
  if (
    !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/u.test(username)
  ) {
    redirect("/signup?registration=invalid-username");
  }
  if (
    password.length > 128 ||
    !(
      password.length >= 15 ||
      (password.length >= 8 && /[a-z]/u.test(password) && /\d/u.test(password))
    )
  ) {
    redirect("/signup?registration=weak-password");
  }
  if (!isSupabaseAuthenticationEnabled()) {
    redirect("/signup?registration=service-unavailable");
  }
  const existingAccount = await getAccountCandidateByUsername(username);
  if (existingAccount.status === "found") {
    redirect("/signup?registration=username-conflict");
  }
  const result = await signUpWithPassword({
    email,
    emailRedirectTo: new URL("/auth/callback", siteConfig.url).toString(),
    password,
    username,
  });
  if (result.status === "created") {
    redirect("/dashboard");
  }
  if (result.status === "confirmation-required") {
    redirect("/verify-email?registration=confirmation-required");
  }
  redirect(`/signup?registration=${result.status}`);
}

export default async function SignupPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ registration?: string }>;
}>) {
  const query = await searchParams;
  const message =
    query.registration === undefined
      ? undefined
      : registrationMessages[query.registration];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlus aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
          Create a personal account
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Supabase Auth verifies your email while Support keeps product roles
          and organization access in its server-only database.
        </p>

        {message !== undefined ? (
          <p
            className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        <form action={registerPersonalAccountAction} className="mt-7">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="registration-email">
                Email address
              </FieldLabel>
              <Input
                autoComplete="email"
                id="registration-email"
                maxLength={254}
                name="email"
                required
                type="email"
              />
              <FieldDescription>
                Confirm this address before your first sign-in.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="registration-username">
                Username
              </FieldLabel>
              <Input
                autoComplete="username"
                id="registration-username"
                maxLength={39}
                name="username"
                pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                required
              />
              <FieldDescription>
                Personal accounts only. Managed users are provisioned by their
                enterprise.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="registration-password">Password</FieldLabel>
              <Input
                autoComplete="new-password"
                id="registration-password"
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
              <FieldLabel htmlFor="registration-password-confirmation">
                Confirm password
              </FieldLabel>
              <Input
                autoComplete="new-password"
                id="registration-password-confirmation"
                maxLength={128}
                minLength={8}
                name="passwordConfirmation"
                required
                type="password"
              />
            </Field>
          </FieldGroup>
          <Button className="mt-6 w-full" type="submit">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Roles and permissions are never stored in authentication metadata.
        </p>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link className="text-primary underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
