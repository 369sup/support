import Link from "next/link";

const consoleNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/repositories", label: "Repositories" },
  { href: "/settings", label: "Settings" },
];

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex min-h-18 items-center gap-8 border-b px-5 sm:px-8">
        <Link className="shrink-0 text-lg font-semibold tracking-tight" href="/dashboard">
          Support
        </Link>
        <nav aria-label="Console" className="flex min-w-0 gap-5 overflow-x-auto text-sm text-muted-foreground">
          {consoleNavigation.map((item) => (
            <Link
              className="shrink-0 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
