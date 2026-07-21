import type { Instrumentation } from "next";

import {
  createLogger,
  resolveLogLevel,
} from "@support/observability/logging";
import type {
  LogAttributes,
  Logger,
} from "@support/observability/logging";
import { createMeter } from "@support/observability/metrics";
import type { Counter } from "@support/observability/metrics";
import { createTracer } from "@support/observability/tracing";
import type { Tracer } from "@support/observability/tracing";

type RequestErrorRequest = Parameters<Instrumentation.onRequestError>[1];
type RequestErrorContext = Parameters<Instrumentation.onRequestError>[2];

let errorCounter: Counter | undefined;
let isObservabilityRegistered = false;
let logger: Logger | undefined;
let tracer: Tracer | undefined;

function serviceName(): string {
  const configuredName = process.env["OTEL_SERVICE_NAME"]?.trim();
  return configuredName === undefined || configuredName === ""
    ? "support-web"
    : configuredName;
}

function getLogger(): Logger {
  logger ??= createLogger({
    base: {
      environment: process.env.NODE_ENV,
      service: serviceName(),
    },
    level: resolveLogLevel(process.env["LOG_LEVEL"]),
  });

  return logger;
}

function getTracer(): Tracer {
  tracer ??= createTracer("support-web");

  return tracer;
}

function getErrorCounter(): Counter {
  errorCounter ??= createMeter("support-web").counter(
    "support.web.request.errors",
    { description: "Next.js requests that ended with an unexpected error." },
  );

  return errorCounter;
}

function errorDigest(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return undefined;
  }

  return typeof error.digest === "string" ? error.digest : undefined;
}

export function isOtlpExportEnabled(endpoint: string | undefined): boolean {
  return endpoint !== undefined && endpoint.trim() !== "";
}

export function createRequestErrorAttributes(
  error: unknown,
  request: RequestErrorRequest,
  context: RequestErrorContext,
): LogAttributes {
  const digest = errorDigest(error);

  return {
    "http.request.method": request.method,
    "next.route.path": context.routePath,
    "next.route.type": context.routeType,
    "next.router.kind": context.routerKind,
    ...(digest === undefined ? {} : { "error.digest": digest }),
  };
}

export async function registerNodeObservability(): Promise<void> {
  if (isObservabilityRegistered) {
    return;
  }

  const endpoint = process.env["OTEL_EXPORTER_OTLP_ENDPOINT"];
  if (!isOtlpExportEnabled(endpoint)) {
    isObservabilityRegistered = true;
    return;
  }

  const [{ OTLPMetricExporter }, { PeriodicExportingMetricReader }, { registerOTel }] =
    await Promise.all([
      import("@opentelemetry/exporter-metrics-otlp-http"),
      import("@opentelemetry/sdk-metrics"),
      import("@vercel/otel"),
    ]);
  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  });

  registerOTel({
    metricReaders: [metricReader],
    serviceName: serviceName(),
  });
  isObservabilityRegistered = true;
}

export function recordRequestError(
  error: unknown,
  request: RequestErrorRequest,
  context: RequestErrorContext,
): void {
  const attributes = createRequestErrorAttributes(error, request, context);

  getLogger().error("Next.js request failed.", error, attributes);
  getTracer().recordException(error);
  getErrorCounter().add(1, {
    "http.request.method": request.method,
    "next.route.type": context.routeType,
    "next.router.kind": context.routerKind,
  });
}
