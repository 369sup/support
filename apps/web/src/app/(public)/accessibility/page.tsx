import Link from "next/link";
import { ArrowRight, CircleCheck, Eye, Keyboard, ShieldCheck } from "lucide-react";

const checks = [
  "Text, controls, and navigation support semantic structure and keyboard access.",
  "Interactive controls keep visible focus and clear state messaging.",
  "Contrast and spacing are tuned for legibility in the core workflow paths.",
  "Status updates surface in programmatically announced regions and role markers.",
];

export default function AccessibilityPage() {
  return (
    <main className="bg-[#0d1117] px-5 py-14 text-slate-100">
      <section className="mx-auto w-full max-w-6xl space-y-7">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
          Commitment
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance">
            Accessibility
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Our interfaces keep important tasks readable and operable without
            requiring mouse-only patterns.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Eye aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Design standards</h2>
            </div>
            <ul className="space-y-3 px-5 py-4 text-sm text-slate-300">
              {checks.map((check) => (
                <li className="flex gap-3" key={check}>
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  />
                  {check}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Keyboard aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="font-semibold">Keyboard flow</h2>
            </div>
            <p className="px-5 py-4 text-sm leading-7 text-slate-300">
              Navigate forms, dialogs, and context switches with predictable
              focus order and explicit disabled states. Errors are represented as
              role-based alerts to ensure screen-reader visibility.
            </p>
          </article>
        </div>

        <div className="rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <ShieldCheck aria-hidden="true" className="size-5 text-emerald-400" />
            <h2 className="font-semibold">Need support?</h2>
          </div>
          <p className="px-5 py-4 text-sm leading-7 text-slate-300">
            If accessibility guidance is incomplete for your team workflow, open a
            support request from the console or login to request an account review.
          </p>
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-4">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#238636] px-4 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="/login"
            >
              Open Support
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-4 font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              href="/terms"
            >
              Terms
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
