import { notFound } from "next/navigation";

export default function ResetPasswordPage(): never {
  void {
    urlPattern: "/reset-password",
    title: "Reset password",
    summary: "Complete an account credential recovery flow.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
