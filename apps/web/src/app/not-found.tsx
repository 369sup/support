import Link from "next/link";

import { buttonVariants } from "@support/shadcn/ui/button-variants";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center bg-background px-6 text-foreground">
      <section className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight">Page not found.</h1>
        <p className="mt-5 text-muted-foreground">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link className={buttonVariants({ size: "lg", className: "mt-8" })} href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
