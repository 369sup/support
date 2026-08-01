import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Open the confirmation link sent by Support. Your account can sign in
          after Supabase confirms the email address.
        </p>
        <Link
          className="mt-6 inline-flex text-sm font-medium text-primary underline underline-offset-4"
          href="/login"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
