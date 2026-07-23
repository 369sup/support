import { notFound } from "next/navigation";

export default function SignUpPage(): never {
  void {
    urlPattern: "/sign-up",
    title: "Create an account",
    summary: "Create a personal account and its authentication credentials.",
    contexts: ["identity/accounts", "identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
