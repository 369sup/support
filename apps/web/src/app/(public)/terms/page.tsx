import Link from "next/link";
import { ArrowRight, CircleCheck, FileText, Gavel, ScrollText } from "lucide-react";

const principlePoints = [
  "Use ownership and access boundaries as the source of truth for collaboration.",
  "Keep repository decisions auditable through stable contexts and role assignments.",
  "Respect tenant and organization scope before modifying shared resources.",
  "Avoid using system endpoints for actions outside granted capability intent.",
];

export default function TermsPage() {
  return (
    <main className="bg-[#0d1117] px-5 py-14 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
          Terms
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance">
            Terms of service
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            These principles define how this service is intended to be used across
            organizations, teams, repositories, and enterprise contexts.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Gavel aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Usage principles</h2>
            </div>
            <ul className="space-y-3 px-5 py-4 text-sm text-slate-300">
              {principlePoints.map((point) => (
                <li className="flex gap-3" key={point}>
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <ScrollText aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Changes</h2>
            </div>
            <p className="px-5 py-4 text-sm leading-7 text-slate-300">
              Terms evolve with release and governance requirements. We document
              meaningful changes and keep behavior aligned with the bounded-context
              agreements defined in architecture.
            </p>
          </article>
        </div>

        <article className="rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <FileText aria-hidden="true" className="size-5 text-emerald-400" />
            <h2 className="font-semibold">Acceptance</h2>
          </div>
          <p className="px-5 py-4 text-sm leading-7 text-slate-300">
            By using Support services you agree to act within your granted context
            and use provided access controls for repository and organization
            operations.
          </p>
          <div className="flex flex-wrap gap-3 border-t border-white/10 px-5 py-4">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#238636] px-4 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="/login"
            >
              Continue to Sign in
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-4 font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              href="/privacy"
            >
              Privacy
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
