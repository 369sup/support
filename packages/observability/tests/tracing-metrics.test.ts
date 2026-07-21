import { context, metrics, SpanStatusCode, trace } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, describe, expect, it } from "vitest";

import { createMeter } from "../src/metrics";
import { createTracer } from "../src/tracing";

afterEach(() => {
  context.disable();
  metrics.disable();
  trace.disable();
});

describe("createTracer", () => {
  it("ends successful spans with their attributes", async () => {
    const exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    expect(trace.setGlobalTracerProvider(provider)).toBe(true);
    const tracer = createTracer("tracing-test");

    const result = await tracer.span(
      "operation",
      async (span) => {
        await Promise.resolve();
        span.setAttribute("result", "ok");
        return "done";
      },
      { component: "test" },
    );

    expect(result).toBe("done");
    const span = exporter.getFinishedSpans()[0];
    if (span === undefined) {
      throw new Error("Expected a finished span.");
    }

    expect(span.attributes).toMatchObject({ component: "test", result: "ok" });
    await provider.shutdown();
  });

  it("records errors and still ends the span", async () => {
    const exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    expect(trace.setGlobalTracerProvider(provider)).toBe(true);
    const tracer = createTracer("tracing-error-test");

    await expect(
      tracer.span("failing-operation", async () => {
        await Promise.resolve();
        throw new Error("failure");
      }),
    ).rejects.toThrow("failure");

    const span = exporter.getFinishedSpans()[0];
    if (span === undefined) {
      throw new Error("Expected a finished span.");
    }

    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.events.some((event) => event.name === "exception")).toBe(true);
    await provider.shutdown();
  });
});

describe("createMeter", () => {
  it("is safe when no metrics SDK is registered", () => {
    const meter = createMeter("metrics-test");
    const counter = meter.counter("support.test.count");
    const histogram = meter.histogram("support.test.duration", { unit: "ms" });

    expect(() => {
      counter.add(1, { result: "ok" });
    }).not.toThrow();
    expect(() => {
      histogram.record(12, { result: "ok" });
    }).not.toThrow();
  });
});
