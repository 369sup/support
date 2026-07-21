import { afterEach, describe, expect, it, vi } from "vitest";

const otelMocks = vi.hoisted(() => ({
  createMetricExporter: vi.fn(),
  createMetricReader: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@opentelemetry/exporter-metrics-otlp-http", () => ({
  OTLPMetricExporter: otelMocks.createMetricExporter,
}));

vi.mock("@opentelemetry/sdk-metrics", () => ({
  PeriodicExportingMetricReader: otelMocks.createMetricReader,
}));

vi.mock("@vercel/otel", () => ({
  registerOTel: otelMocks.register,
}));

import {
  createRequestErrorAttributes,
  isOtlpExportEnabled,
  registerNodeObservability,
} from "./instrumentation-node";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("OTLP activation", () => {
  it("is disabled until a non-empty endpoint is configured", () => {
    expect(isOtlpExportEnabled(undefined)).toBe(false);
    expect(isOtlpExportEnabled(" ")).toBe(false);
    expect(isOtlpExportEnabled("http://127.0.0.1:4318")).toBe(true);
  });

  it("does not load or construct exporters without an endpoint", async () => {
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "");

    await registerNodeObservability();

    expect(otelMocks.createMetricExporter).not.toHaveBeenCalled();
    expect(otelMocks.createMetricReader).not.toHaveBeenCalled();
    expect(otelMocks.register).not.toHaveBeenCalled();
  });
});

describe("request error attributes", () => {
  it("keeps only reviewed route metadata", () => {
    const attributes = createRequestErrorAttributes(
      { digest: "digest-123", message: "secret body" },
      {
        headers: {
          authorization: "Bearer secret",
          cookie: "session=secret",
        },
        method: "POST",
        path: "/repositories?token=secret",
      },
      {
        renderSource: "react-server-components",
        revalidateReason: undefined,
        routePath: "/repositories/[repositoryId]",
        routeType: "render",
        routerKind: "App Router",
      },
    );

    expect(attributes).toEqual({
      "error.digest": "digest-123",
      "http.request.method": "POST",
      "next.route.path": "/repositories/[repositoryId]",
      "next.route.type": "render",
      "next.router.kind": "App Router",
    });
    expect(JSON.stringify(attributes)).not.toContain("Bearer secret");
    expect(JSON.stringify(attributes)).not.toContain("token=secret");
    expect(JSON.stringify(attributes)).not.toContain("secret body");
  });
});
