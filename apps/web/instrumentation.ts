import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env["NEXT_RUNTIME"] !== "nodejs") {
    return;
  }

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

  const { recordRequestError } = await import("./instrumentation-node");
  recordRequestError(error, request, context);
};
