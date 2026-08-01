import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasswordSignInForm } from "@/modules/identity/authentication/browser-ui";
import {
  isPasswordAuthenticationEnabled,
  startExternalSignIn,
} from "@/modules/identity/authentication/server-api";
import { siteConfig } from "../../../../site-configuration";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

const authenticationMessages: Readonly<Record<string, string>> = {
  "invalid-confirmation":
    "The authentication link is invalid or has expired.",
  "service-unavailable":
    "The authentication service is temporarily unavailable.",
};

async function startGoogleSignInAction(): Promise<never> {
  "use server";

  const callbackUrl = new URL("/auth/callback", siteConfig.url);
  callbackUrl.searchParams.set("next", "/dashboard");
  const result = await startExternalSignIn({
    provider: "google",
    redirectTo: callbackUrl.toString(),
  });
  if (result.status === "redirect") {
    redirect(result.redirectUrl);
  }
  redirect("/login?authentication=service-unavailable");
}

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    authentication?: string;
    confirmation?: string;
  }>;
}>) {
  const query = await searchParams;
  const messageKey = query.authentication ?? query.confirmation;
  const message =
    messageKey === undefined
      ? undefined
      : authenticationMessages[messageKey];
  const isEnabled = isPasswordAuthenticationEnabled();

  return (
    <PasswordSignInForm
      {...(message === undefined ? {} : { externalError: message })}
      googleSignInAction={startGoogleSignInAction}
      isEnabled={isEnabled}
    />
  );
}
