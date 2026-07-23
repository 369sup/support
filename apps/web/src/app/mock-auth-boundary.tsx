"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { mockAuthEndpoints, mockAuthStorageKey } from "@/app/mock-auth-contract";

export function MockAuthBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = window.localStorage.getItem(mockAuthStorageKey);

    if (token === null) {
      router.replace("/sign-in");
      return () => {
        controller.abort();
      };
    }

    void fetch(mockAuthEndpoints.session, {
      headers: { authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        if (response.ok) {
          setAuthenticated(true);
          return;
        }

        window.localStorage.removeItem(mockAuthStorageKey);
        router.replace("/sign-in");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          window.localStorage.removeItem(mockAuthStorageKey);
          router.replace("/sign-in");
        }
      });

    return () => {
      controller.abort();
    };
  }, [router]);

  if (!authenticated) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-sm text-muted-foreground">
        Checking development session...
      </main>
    );
  }

  return children;
}
