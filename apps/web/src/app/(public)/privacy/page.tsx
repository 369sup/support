import Link from "next/link";
import { ArrowRight, CircleCheck, LockKeyhole, ShieldCheck } from "lucide-react";

const privacyFacts = [
  "Supabase Auth owns credential, MFA, and browser-session state.",
  "Supabase SSR session cookies are HttpOnly and scoped to Support routes.",
  "Role and ownership references are minimized to what each page needs.",
  "Activity surfaces expose only bounded-context information for current ownership.",
];

export default function PrivacyPage() {
  return (
    <main className="bg-[#0d1117] px-5 py-14 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
          Trust
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance">
            Privacy
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Protection defaults are explicit at each boundary so data stays in the
            context where it is needed and auditable.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <ShieldCheck aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Data handling</h2>
            </div>
            <ul className="space-y-3 px-5 py-4 text-sm text-slate-300">
              {privacyFacts.map((fact) => (
                <li className="flex gap-3" key={fact}>
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </article>

          <article className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <LockKeyhole aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Retention</h2>
            </div>
            <p className="px-5 py-4 text-sm leading-7 text-slate-300">
              Session tokens and derived ownership views are short-lived by design.
              Expired sessions are no longer usable and must be explicitly
              refreshed or replaced by reauthentication.
            </p>
          </article>
        </div>

        <div className="rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="px-5 py-4">
            <p className="text-sm text-slate-300">
              Support is built to reduce implicit data retention and avoid broad
              cross-context disclosure. If you need export, removal, or additional
              controls, use the account management flow after signing in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-white/10 px-5 py-4">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#238636] px-4 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="/login"
            >
              Open Support
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-4 font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              href="/docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
