import { ArrowRight, BookOpenText, CircleCheck, FolderKanban, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";

const documentationSections = [
  {
    title: "Organization foundations",
    icon: ShieldCheck,
    items: [
      "Create and maintain organization ownership boundaries.",
      "Assign teams with explicit responsibilities and stable visibility.",
      "Review access in one location before repository work starts.",
    ],
  },
  {
    title: "Repositories and ownership",
    icon: FolderKanban,
    items: [
      "Model repositories with explicit ownership and access intent.",
      "Track where teams and roles intersect with repository rules.",
      "Keep repository context changes transparent to decision-makers.",
    ],
  },
  {
    title: "Runtime operations",
    icon: Settings,
    items: [
      "Navigate enterprise and organization setup with explicit intent.",
      "Coordinate role changes through predictable workflow gates.",
      "Use governance actions and permissions as auditable operations.",
    ],
  },
];

export default function DocsPage() {
  return (
    <main className="bg-[#0d1117] px-5 py-14 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
          Resources
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance">
            Documentation
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Learn how Support models organizations, repositories, teams,
            governance, and notification behavior while keeping security and
            ownership boundaries explicit.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {documentationSections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]"
                key={section.title}
              >
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                  <Icon aria-hidden="true" className="size-5 text-emerald-400" />
                  <h2 className="font-semibold">{section.title}</h2>
                </div>
                <ul className="space-y-3 px-5 py-4 text-sm text-slate-300">
                  {section.items.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <CircleCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-emerald-400"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <article className="rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
            <BookOpenText aria-hidden="true" className="size-5 text-emerald-400" />
            <h2 className="font-semibold">Quick path</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm leading-7 text-slate-300">
              Start at your dashboard, confirm governance context, then move to
              repository access.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#238636] px-4 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="/login"
            >
              Open Support
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
