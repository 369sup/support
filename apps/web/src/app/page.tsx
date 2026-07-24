import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  FolderKanban,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const organizationTeams = ["Platform", "Operations", "Design systems"];
const organizationRepositories = [
  "support-web",
  "governance-docs",
  "integration-hub",
];
const organizationBenefits = [
  "Organize people around durable team responsibilities.",
  "Keep repository ownership and visibility explicit.",
  "Review access from one dependable workspace.",
];
const governanceRoles = [
  { name: "Owners", scope: "Organization administration" },
  { name: "Maintainers", scope: "Team and repository access" },
  { name: "Members", scope: "Assigned resources" },
];
const activityItems = [
  {
    title: "Team access updated",
    detail: "Platform can maintain support-web",
  },
  {
    title: "Repository visibility reviewed",
    detail: "governance-docs remains internal",
  },
  {
    title: "Organization policy published",
    detail: "Members received the latest access guidance",
  },
];

function SupportMark({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-lg font-semibold text-emerald-400 ${className}`}
    >
      S
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#0d1117] text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-6 px-5 sm:px-8">
          <Link
            className="flex items-center gap-3 font-semibold tracking-tight text-white"
            href="/"
          >
            <SupportMark />
            <span className="text-xl">Support</span>
          </Link>

          <nav
            aria-label="Primary"
            className="ml-auto hidden items-center gap-7 text-sm text-slate-300 md:flex"
          >
            <a className="transition-colors hover:text-white" href="#product">
              Product
            </a>
            <a className="transition-colors hover:text-white" href="#solutions">
              Solutions
            </a>
            <a
              className="transition-colors hover:text-white"
              href="#collaboration"
            >
              Collaboration
            </a>
            <Link className="transition-colors hover:text-white" href="/docs">
              Resources
            </Link>
          </nav>

          <Link
            className="ml-auto rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-emerald-400/60 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:ml-0"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-white/10 px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-1/2 -z-10 mx-auto h-px max-w-7xl bg-emerald-400/15"
          />
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <p className="mb-5 font-mono text-xs font-medium tracking-[0.2em] text-emerald-400 uppercase">
              Collaboration with clear boundaries
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-balance sm:text-7xl">
              Where teams build trust together.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400 text-pretty sm:text-xl">
              Bring organizations, teams, repositories, access, notifications,
              and governance together in one secure workspace.
            </p>
            <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#238636] px-5 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                href="/login"
              >
                Sign in to Support
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-white/25 px-5 font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                href="#product"
              >
                Explore the platform
              </a>
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-8 border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28"
          id="product"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
                Organizations
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                One place for every team.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
                Keep organization membership, team structure, repositories,
                and access visible without crossing ownership boundaries.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                {organizationBenefits.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624] shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Building2
                  aria-hidden="true"
                  className="size-5 text-emerald-400"
                />
                <div>
                  <p className="font-semibold text-white">Support workspace</p>
                  <p className="text-xs text-slate-500">
                    Organization overview
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-400">
                  Internal
                </span>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-white/10 p-5 md:border-r md:border-b-0">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <UsersRound
                      aria-hidden="true"
                      className="size-4 text-slate-500"
                    />
                    Teams
                  </div>
                  <ul className="space-y-2">
                    {organizationTeams.map((team) => (
                      <li
                        className="flex items-center rounded-md border border-white/10 bg-white/[0.025] px-3 py-3 text-sm"
                        key={team}
                      >
                        {team}
                        <ChevronRight
                          aria-hidden="true"
                          className="ml-auto size-4 text-slate-600"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <FolderKanban
                      aria-hidden="true"
                      className="size-4 text-slate-500"
                    />
                    Repositories
                  </div>
                  <ul className="space-y-2">
                    {organizationRepositories.map((repository) => (
                      <li
                        className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-3 py-3 text-sm"
                        key={repository}
                      >
                        <LockKeyhole
                          aria-hidden="true"
                          className="size-3.5 text-slate-500"
                        />
                        {repository}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-8 border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28"
          id="solutions"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624] lg:order-1">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-5 text-emerald-400"
                />
                <p className="font-semibold">Organization access</p>
                <span className="ml-auto text-xs text-slate-500">
                  Role overview
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {governanceRoles.map((role) => (
                  <div
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
                    key={role.name}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-emerald-400">
                        {role.name.slice(0, 1)}
                      </span>
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <span className="text-sm text-slate-500 sm:ml-auto">
                      {role.scope}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 bg-black/10 px-5 py-4">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Latest review
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Repository access aligns with assigned team responsibilities.
                </p>
              </div>
            </div>

            <div className="lg:order-2">
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
                Governance
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                Access you can explain.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
                Define roles, review membership, and keep organizational
                boundaries visible from invitation through repository access.
              </p>
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-8 border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28"
          id="collaboration"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
                Collaboration
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                Stay aligned as work moves.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
                Bring notifications, teams, and repository activity into one
                dependable view without hiding who owns each decision.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Bell
                  aria-hidden="true"
                  className="size-5 text-emerald-400"
                />
                <p className="font-semibold">Activity</p>
                <span className="ml-auto rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                  Up to date
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {activityItems.map((item) => (
                  <div className="flex gap-4 px-5 py-4" key={item.title}>
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-400"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <SupportMark className="mx-auto" />
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Bring your workspace together.
            </h2>
            <p className="mt-5 text-lg text-slate-400">
              Start with the teams and repositories you already manage.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#238636] px-6 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="/login"
            >
              Sign in to Support
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 text-sm text-slate-500 sm:flex-row sm:items-center">
          <Link
            className="flex items-center gap-3 font-semibold text-slate-200"
            href="/"
          >
            <SupportMark className="size-8 text-base" />
            Support
          </Link>
          <p className="sm:mr-auto">
            Non-code collaboration and governance for connected teams.
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            <Link className="hover:text-white" href="/docs">
              Docs
            </Link>
            <Link className="hover:text-white" href="/accessibility">
              Accessibility
            </Link>
            <Link className="hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-white" href="/terms">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
