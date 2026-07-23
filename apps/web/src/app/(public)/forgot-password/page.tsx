import { notFound } from "next/navigation";

export default function ForgotPasswordPage(): never {
  void {
    urlPattern: "/forgot-password",
    title: "Forgot password",
    summary: "Request a credential recovery flow for an account.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
