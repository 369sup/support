"use client";

import { useEffect } from "react";

import { Button } from "@support/shadcn/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-dvh items-center bg-background px-6 text-foreground">
        <main className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Something went wrong.
          </h1>
          <p className="mt-4 text-muted-foreground">
            An unexpected error occurred. You can safely try the request again.
          </p>
          <Button className="mt-8" size="lg" onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
