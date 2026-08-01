import { metrics } from "@opentelemetry/api";
import type {
  Counter as OpenTelemetryCounter,
  Histogram as OpenTelemetryHistogram,
} from "@opentelemetry/api";

export type MetricAttributeValue = boolean | number | string;
export type MetricAttributes = Readonly<Record<string, MetricAttributeValue>>;

export interface Counter {
  add(value?: number, attributes?: MetricAttributes): void;
}

export interface Histogram {
  record(value: number, attributes?: MetricAttributes): void;
}

export interface MetricOptions {
  description?: string;
  unit?: string;
}

export interface Meter {
  counter(name: string, options?: MetricOptions): Counter;
  histogram(name: string, options?: MetricOptions): Histogram;
}

function wrapCounter(counter: OpenTelemetryCounter): Counter {
  return {
    add(value = 1, attributes) {
      counter.add(value, attributes);
    },
  };
}

function wrapHistogram(histogram: OpenTelemetryHistogram): Histogram {
  return {
    record(value, attributes) {
      histogram.record(value, attributes);
    },
  };
}

export function createMeter(scopeName: string): Meter {
  const meter = metrics.getMeter(scopeName);

  return {
    counter(name, options) {
      return wrapCounter(meter.createCounter(name, options));
    },
    histogram(name, options) {
      return wrapHistogram(meter.createHistogram(name, options));
    },
  };
}
