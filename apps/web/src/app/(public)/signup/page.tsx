import { notFound } from "next/navigation";

export default function SignupPage(): never {
  void {
    urlPattern: "/signup",
    title: "Sign up",
    summary: "GitHub-style canonical URL for personal account registration.",
    contexts: ["identity/accounts", "identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
