import Link from "next/link";

export default function PublicLayout({
  children,
  header,
  navigation: navigationSlot,
  sidebar,
  modal,
}: Readonly<{
  children: React.ReactNode;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex min-h-18 items-center justify-between gap-6 border-b px-5 sm:px-8">
        {header}
        <Link className="text-lg font-semibold tracking-tight" href="/">
          Support
        </Link>
        <nav aria-label="Public" className="flex items-center gap-5 text-sm text-muted-foreground">
          {navigationSlot}
          <Link className="transition-colors hover:text-foreground" href="/docs">
            Docs
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/sign-in">
            Sign in
          </Link>
        </nav>
      </header>
      {sidebar}
      {children}
      {modal}
      <footer className="flex min-h-18 items-center justify-center border-t px-6 py-5 text-center text-sm text-muted-foreground">
        Built on a production-ready foundation.
      </footer>
    </div>
  );
}
