import type { Metadata } from "next";

import { MockSignInForm } from "@/app/mock-sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return <MockSignInForm />;
}
