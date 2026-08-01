import type { Metadata } from "next";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { DevelopmentSignInForm } from "@/modules/identity/authentication/browser-ui";

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
        isEnabled={isInMemoryRuntimeEnabled()}
      isAddingAccount={add === "1"}
    />
  );
}
