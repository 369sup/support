import { setupWorker } from "msw/browser";

import { mockApiHandlers } from "./mock-api-handlers";

const worker = setupWorker(...mockApiHandlers);
let startPromise: Promise<void> | undefined;

export function startMockApi() {
  startPromise ??= worker
    .start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    })
    .then(() => undefined);

  return startPromise;
}
