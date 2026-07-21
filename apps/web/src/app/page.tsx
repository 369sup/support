import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Blocks,
  Braces,
  ChevronRight,
  LayoutTemplate,
} from "lucide-react";

import { buttonVariants } from "@support/shadcn/ui/button-variants";
import { Separator } from "@support/shadcn/ui/separator";

const foundations: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    name: "Next.js App Router",
    href: "https://nextjs.org/docs/app",
    icon: LayoutTemplate,
  },
  {
    name: "TypeScript",
    href: "https://www.typescriptlang.org/docs/",
    icon: Braces,
  },
  {
    name: "shadcn/ui",
    href: "https://ui.shadcn.com/docs/components",
    icon: Blocks,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-background text-foreground">
      <header className="flex h-18 shrink-0 items-center border-b px-6 sm:h-22 sm:px-10">
        <span className="text-xl font-semibold tracking-tight">Support</span>
      </header>

      <main className="flex flex-1 items-center px-5 py-16 sm:px-8">
        <section className="mx-auto flex w-full max-w-[960px] flex-col items-center text-center sm:-translate-y-1">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
            Your workspace is ready.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground text-pretty sm:text-xl sm:leading-8">
            Next.js, TypeScript, Tailwind CSS, and shadcn/ui are configured and
            ready to build.
          </p>

          <div className="mt-9 flex w-full max-w-[624px] flex-col gap-3 sm:flex-row">
            <a
              className={buttonVariants({
                size: "lg",
                className: "h-16 flex-1 px-8",
              })}
              href="https://nextjs.org/docs/app/getting-started/project-structure"
              rel="noreferrer"
              target="_blank"
            >
              Start building
              <ArrowRight data-icon="inline-end" />
            </a>
            <a
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-16 flex-1 px-8",
              })}
              href="https://ui.shadcn.com/docs/components"
              rel="noreferrer"
              target="_blank"
            >
              View components
              <ArrowRight data-icon="inline-end" />
            </a>
          </div>

          <div
            className="mt-14 w-full overflow-hidden rounded-xl border bg-card/35 text-left"
            id="foundation"
          >
            {foundations.map((foundation, index) => {
              const Icon = foundation.icon;

              return (
                <div key={foundation.name}>
                  {index > 0 && <Separator />}
                  <a
                    className="group flex min-h-19 items-center gap-4 px-5 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-7"
                    href={foundation.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background/60 text-muted-foreground transition-colors group-hover:text-foreground">
                      <Icon aria-hidden="true" className="size-4.5" />
                    </span>
                    <span className="flex-1 font-medium">{foundation.name}</span>
                    <span className="text-sm text-muted-foreground">Ready</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="flex min-h-18 shrink-0 items-center justify-center border-t px-6 py-5 text-center text-sm text-muted-foreground sm:min-h-32">
        Built on a production-ready foundation.
      </footer>
    </div>
  );
}
