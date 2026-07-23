"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  DevelopmentApiStateContext,
  type DevelopmentApiState,
} from "../hooks/development-api-context";

type DevelopmentApiGateProps = {
  children: ReactNode;
  isDevelopmentBuild: boolean;
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
  isDevelopmentBuild,
  start,
}: DevelopmentApiGateProps) {
  const [state, setState] = useState<DevelopmentApiState>("starting");

  useEffect(() => {
    let isCurrent = true;

    if (!isDevelopmentBuild && !isLocalBrowserHost()) {
      queueMicrotask(() => {
        if (isCurrent) {
          setState("disabled");
        }
      });

      return () => {
        isCurrent = false;
      };
    }

    void start()
      .then(() => {
        if (isCurrent) {
          setState("ready");
        }
      })
      .catch(() => {
        if (isCurrent) {
          setState("failed");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isDevelopmentBuild, start]);

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
