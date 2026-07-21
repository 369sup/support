import { context, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, describe, expect, it } from "vitest";

import {
  createLogger,
  resolveLogLevel,
} from "../src/logging";
import type { LogDestination } from "../src/logging";

function createDestination(lines: string[]): LogDestination {
  return {
    write(message) {
      lines.push(message);
    },
  };
}

function requireLine(lines: string[], index: number): string {
  const line = lines[index];

  if (line === undefined) {
    throw new Error(`Missing log line at index ${index}.`);
  }

  return line;
}

afterEach(() => {
  context.disable();
  trace.disable();
});

describe("resolveLogLevel", () => {
  it("accepts supported levels and defaults invalid values to info", () => {
    expect(resolveLogLevel("debug")).toBe("debug");
    expect(resolveLogLevel("fatal")).toBe("info");
    expect(resolveLogLevel(undefined)).toBe("info");
  });
});

describe("createLogger", () => {
  it("writes all exposed levels and child attributes", () => {
    const lines: string[] = [];
    const logger = createLogger({
      destination: createDestination(lines),
      level: "debug",
    }).child({ component: "worker" });

    logger.debug("debug message");
    logger.info("info message", { count: 2 });
    logger.warn("warn message");
    logger.error("error message", new Error("boom"));

    expect(lines).toHaveLength(4);
    expect(requireLine(lines, 0)).toContain('"component":"worker"');
    expect(requireLine(lines, 1)).toContain('"count":2');
    expect(requireLine(lines, 3)).toContain('"msg":"error message"');
    expect(requireLine(lines, 3)).toContain("boom");
  });

  it("redacts sensitive fields", () => {
    const lines: string[] = [];
    const logger = createLogger({ destination: createDestination(lines) });

    logger.info("sensitive", {
      headers: { authorization: "Bearer secret", cookie: "session=secret" },
      password: "password-value",
      token: "token-value",
    });

    const line = requireLine(lines, 0);
    expect(line).not.toContain("Bearer secret");
    expect(line).not.toContain("session=secret");
    expect(line).not.toContain("password-value");
    expect(line).not.toContain("token-value");
    expect(line).toContain("[REDACTED]");
  });

  it("correlates logs with the active trace", async () => {
    const contextManager = new AsyncLocalStorageContextManager();
    contextManager.enable();
    expect(context.setGlobalContextManager(contextManager)).toBe(true);
    const exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    expect(trace.setGlobalTracerProvider(provider)).toBe(true);
    const lines: string[] = [];
    const logger = createLogger({ destination: createDestination(lines) });
    const tracer = trace.getTracer("logging-test");

    tracer.startActiveSpan("outer", (span) => {
      logger.info("correlated");
      span.end();
    });

    const line = requireLine(lines, 0);
    const span = exporter.getFinishedSpans()[0];
    if (span === undefined) {
      throw new Error("Expected a finished span.");
    }

    expect(line).toContain(span.spanContext().traceId);
    expect(line).toContain(span.spanContext().spanId);
    await provider.shutdown();
  });
});
