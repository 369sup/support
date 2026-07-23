"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  DevelopmentApiStateContext,
  type DevelopmentApiState,
} from "../hooks/development-api-context";

type DevelopmentApiGateProps = {
  children: ReactNode;
  developmentBuild: boolean;
  start: () => Promise<void>;
};

function isLocalBrowserHost() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function DevelopmentApiGate({
  children,
  developmentBuild,
  start,
}: DevelopmentApiGateProps) {
  const [state, setState] = useState<DevelopmentApiState>("starting");

  useEffect(() => {
    let current = true;

    if (!developmentBuild && !isLocalBrowserHost()) {
      queueMicrotask(() => {
        if (current) {
          setState("disabled");
        }
      });

      return () => {
        current = false;
      };
    }

    void start()
      .then(() => {
        if (current) {
          setState("ready");
        }
      })
      .catch(() => {
        if (current) {
          setState("failed");
        }
      });

    return () => {
      current = false;
    };
  }, [developmentBuild, start]);

  let content = children;

  if (state === "starting") {
    content = (
      <main className="grid min-h-dvh place-items-center px-6 text-sm text-muted-foreground">
        Starting development API...
      </main>
    );
  }

  if (state === "failed") {
    content = (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">
            Development API unavailable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reload after confirming the mock worker is served from the public
            directory.
          </p>
        </div>
      </main>
    );
  }

  return (
    <DevelopmentApiStateContext.Provider value={state}>
      {content}
    </DevelopmentApiStateContext.Provider>
  );
}
