import type { Metadata } from "next";

import { DevelopmentSignInForm } from "@/modules/identity/authentication/browser-ui";
import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
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
