import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env["NEXT_RUNTIME"] !== "nodejs") {
    return;
  }

  /*
   * Dynamic-import exception: defer Node-only observability until the runtime
   * guard succeeds. Scope is this fixed module; static loading would leak Node
   * dependencies into other runtimes. Typecheck, instrumentation tests, and the
   * production build verify and contain the deferred-loading boundary.
   */
  const { registerNodeObservability } = await import("./instrumentation-node");
  await registerNodeObservability();
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env["NEXT_RUNTIME"] !== "nodejs") {
    return;
  }

  /*
   * Dynamic-import exception: defer the Node-only error recorder until the
   * runtime guard succeeds. Scope is this fixed module; static loading would
   * cross the runtime boundary. Instrumentation tests and the production build
   * verify that the deferred path remains contained and observable.
   */
  const { recordRequestError } = await import("./instrumentation-node");
  recordRequestError(error, request, context);
};
