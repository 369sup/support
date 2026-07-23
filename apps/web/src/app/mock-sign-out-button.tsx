"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@support/shadcn/ui/button";

import { mockAuthEndpoints, mockAuthStorageKey } from "@/app/mock-auth-contract";

export function MockSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const token = window.localStorage.getItem(mockAuthStorageKey);

    try {
      if (token !== null) {
        await fetch(mockAuthEndpoints.signOut, {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        });
      }
    } finally {
      window.localStorage.removeItem(mockAuthStorageKey);
      router.push("/sign-in");
      router.refresh();
    }
  }

  return (
    <Button
      disabled={pending}
      onClick={() => {
        void signOut();
      }}
      size="sm"
      variant="outline"
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
