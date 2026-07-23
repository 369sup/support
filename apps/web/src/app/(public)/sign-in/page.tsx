import type { Metadata } from "next";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { DevelopmentSignInForm } from "@/app/development-sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ add?: string | readonly string[] }>;
}>) {
  const { add } = await searchParams;
  return (
    <DevelopmentSignInForm
      enabled={isInMemoryRuntimeEnabled()}
      isAddingAccount={add === "1"}
    />
  );
}
