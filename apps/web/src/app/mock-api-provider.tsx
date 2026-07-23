"use client";

import { useCallback, type ReactNode } from "react";

import { DevelopmentApiGate } from "@support/shadcn/custom/development-api-gate";

type MockApiProviderProps = {
  children: ReactNode;
  developmentBuild: boolean;
};

export function MockApiProvider({
  children,
  developmentBuild,
}: MockApiProviderProps) {
  const start = useCallback(async () => {
    const { startMockApi } = await import("@/app/mock-api-browser");

    await startMockApi();
  }, []);

  return (
    <DevelopmentApiGate
      developmentBuild={developmentBuild}
      start={start}
    >
      {children}
    </DevelopmentApiGate>
  );
}
