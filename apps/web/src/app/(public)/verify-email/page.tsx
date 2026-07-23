import { notFound } from "next/navigation";

export default function VerifyEmailPage(): never {
  void {
    urlPattern: "/verify-email",
    title: "Verify email",
    summary: "Verify an account email as part of the authentication lifecycle.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
