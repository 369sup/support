import Link from "next/link";
import { type LucideIcon, CheckCircle2, KeyRound, ShieldCheck, UserRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";

type SettingsCard = Readonly<{
  description: string;
  href: string | null;
  icon: LucideIcon;
  title: string;
}>;

const settingsCards = [
  {
    title: "Your account",
    description:
      "Profile identity details, username, and account metadata for your signed-in identity.",
    href: "/account",
    icon: UserRound,
  },
  {
    title: "Sessions",
    description:
      "Review browser sessions, switch active accounts, and sign out from all sessions.",
    href: "/settings/sessions",
    icon: KeyRound,
  },
  {
    title: "Applications",
    description:
      "OAuth app approvals and external integrations are prepared in a future release.",
    href: null,
    icon: CheckCircle2,
  },
  {
    title: "Security",
    description:
      "Password policies and advanced security controls are not enabled in this environment.",
    href: null,
    icon: ShieldCheck,
  },
] satisfies readonly SettingsCard[];

export default async function SettingsPage() {
  const session = await requireCurrentSession();

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-medium text-muted-foreground">
          Signed in as @{session.account.username}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
          Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Manage account-level controls and security settings for this workspace.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {settingsCards.map((item) => {
            const Icon = item.icon;
            return item.href === null ? (
              <article
                aria-disabled="true"
                className="rounded-xl border border-white/10 bg-[#0a1624] p-5 opacity-80"
                key={item.title}
              >
                <Icon aria-hidden="true" className="size-5 text-slate-400" />
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {item.description}
                </p>
              </article>
            ) : (
              <Link
                className="group rounded-xl border border-white/10 bg-[#0a1624] p-5 transition-colors hover:border-emerald-400/60 hover:bg-emerald-400/5"
                href={item.href}
                key={item.title}
              >
                <Icon
                  aria-hidden="true"
                  className="size-5 text-emerald-300 transition-colors group-hover:text-emerald-200"
                />
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
