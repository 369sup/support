import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { Span as OpenTelemetrySpan } from "@opentelemetry/api";

export type TraceAttributeValue = boolean | number | string;
export type TraceAttributes = Readonly<Record<string, TraceAttributeValue>>;

export interface TraceSpan {
  recordException(error: unknown): void;
  setAttribute(name: string, value: TraceAttributeValue): void;
  setError(message?: string): void;
}

export interface Tracer {
  recordException(error: unknown): void;
  span<Result>(
    name: string,
    operation: (span: TraceSpan) => Promise<Result>,
    attributes?: TraceAttributes,
  ): Promise<Result>;
}

function exceptionValue(error: unknown): Error | string {
  if (error instanceof Error) {
    return error;
  }

  return String(error);
}

function wrapSpan(span: OpenTelemetrySpan): TraceSpan {
  return {
    recordException(error) {
      span.recordException(exceptionValue(error));
    },
    setAttribute(name, value) {
      span.setAttribute(name, value);
    },
    setError(message) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        ...(message === undefined ? {} : { message }),
      });
    },
  };
}

export function createTracer(scopeName: string): Tracer {
  const openTelemetryTracer = trace.getTracer(scopeName);

  return {
    recordException(error) {
      const activeSpan = trace.getActiveSpan();

      if (activeSpan !== undefined) {
        activeSpan.recordException(exceptionValue(error));
        activeSpan.setStatus({ code: SpanStatusCode.ERROR });
      }
    },
    async span(name, operation, attributes) {
      return openTelemetryTracer.startActiveSpan(
        name,
        attributes === undefined ? {} : { attributes },
        async (openTelemetrySpan) => {
          const span = wrapSpan(openTelemetrySpan);

          try {
            return await operation(span);
          } catch (error) {
            span.recordException(error);
            span.setError(error instanceof Error ? error.message : undefined);
            throw error;
          } finally {
            openTelemetrySpan.end();
          }
        },
      );
    },
  };
}
